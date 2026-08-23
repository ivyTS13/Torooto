using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using TorootoAPI.Application.Auth;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;

namespace TorootoASP.Controllers
{
    [EnableRateLimiting("StandardLimit")]
    [ApiController]
    [Route("users")]
    [Authorize] // Protects all routes in this controller
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IImageStorageService _imageStorageService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserRepository userRepository, ILogger<UsersController> logger, IImageStorageService imageStorageService)
        {
            _userRepository = userRepository;
            _logger = logger;
            _imageStorageService = imageStorageService;
        }

        // Helper to get the current logged-in user's ID from the JWT token
        private Guid GetCurrentUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.Parse(userIdString!);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = GetCurrentUserId();
            var user = await _userRepository.GetUserByIdAsync(userId);

            if (user == null) return NotFound();

            return Ok(user.Adapt<UserReadDto>());
        }

        [HttpPatch("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UserUpdateDto updateDto)
        {
            var userId = GetCurrentUserId();
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null) return NotFound();

            // Apply updates to the existing entity
            updateDto.Adapt(user);
            var updatedUser = await _userRepository.UpdateUserAsync(user);

            return Ok(updatedUser.Adapt<UserReadDto>());
        }

        [HttpPatch("{userId}/image")]
        public async Task<IActionResult> UpdateUserImage(Guid userId, IFormFile file)
        {
            var currentUserId = GetCurrentUserId();

            // Ensure the user is only updating their own profile image
            if (currentUserId != userId)
            {
                return Forbid();
            }

            try
            {
                // Define upload arguments
                var fileName = $"user_{userId}_{file.FileName}";
                var folder = "/users";
                var tags = new List<string> { "back-end-upload", $"user_{userId}" };

                // Pass the file processing down to the Storage Service
                var imageUrl = await _imageStorageService.UploadImageAsync(file, fileName, folder, tags);

                // Update database
                var updatedUser = await _userRepository.UpdateUserImageAsync(userId, imageUrl);

                return Ok(new
                {
                    success = true,
                    data = updatedUser?.Adapt<UserReadDto>(),
                    message = "User image updated successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during user image upload.");
                return StatusCode(500, new { success = false, message = "Failed to upload image to storage provider." });
            }
        }
    }
}