using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TorootoAPI.Application.Auth;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Application.UseCases;
using TorootoASP.Extensions;

namespace TorootoASP.Controllers;

[EnableRateLimiting("StandardLimit")]
[ApiController]
[Route("users")]
[Authorize]
public sealed class UsersController(
    IAuthService authService,
    ILogger<UsersController> logger) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
    {
        if (!User.TryGetUserId(out var userId))
            return Unauthorized(new ApiResponse<object>(false, null, "Invalid user token."));

        var result = await authService.GetCurrentUserAsync(userId, ct);
        return this.ToActionResult(result, "User profile retrieved.");
    }

    [HttpPatch("me")]
    public async Task<IActionResult> UpdateCurrentUser([FromBody] UserUpdateDto updateDto, CancellationToken ct)
    {
        if (!User.TryGetUserId(out var userId))
            return Unauthorized(new ApiResponse<object>(false, null, "Invalid user token."));

        var result = await authService.UpdateCurrentUserAsync(userId, updateDto, ct);
        return this.ToActionResult(result, "User profile updated.");
    }

    [HttpPatch("{userId:guid}/image")]
    public async Task<IActionResult> UpdateUserImage(Guid userId, IFormFile? file, CancellationToken ct)
    {
        if (!User.TryGetUserId(out var currentUserId))
            return Unauthorized(new ApiResponse<object>(false, null, "Invalid user token."));

        if (file is null || file.Length == 0)
            return BadRequest(new ApiResponse<object>(false, null, "Image file is required."));

        try
        {
            await using var stream = file.OpenReadStream();
            var uploadRequest = new ImageUploadRequest(
                stream,
                $"user_{userId}_{Path.GetFileName(file.FileName)}",
                file.ContentType,
                "/users",
                ["back-end-upload", $"user_{userId}"]);

            var result = await authService.UpdateUserImageAsync(currentUserId, userId, uploadRequest, ct);
            return this.ToActionResult(result, "User image updated successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during user image upload for user {UserId}", userId);
            return StatusCode(500, new ApiResponse<object>(false, null, "Failed to upload image to storage provider."));
        }
    }
}
