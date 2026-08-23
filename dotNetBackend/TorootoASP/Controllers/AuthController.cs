using Isopoh.Cryptography.Argon2;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TorootoAPI.Application.Auth;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;

namespace TorootoASP.Controllers
{
    [EnableRateLimiting("StandardLimit")]
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserCreateDto dto)
        {
            var existingUser = await _userRepository.GetUserByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email already registered" });

            var newUser = dto.Adapt<User>();
            var createdUser = await _userRepository.CreateUserAsync(newUser, dto.Password);

            return Ok(createdUser.Adapt<UserReadDto>());
        }

        // Note: For a proper login DTO, create a record with Email and Password
        [HttpPost("jwt/login")]
        public async Task<IActionResult> Login([FromBody] UserCreateDto loginDto)
        {
            var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

            // Safely verify Argon2 password
            bool isPasswordValid = false;
            if (user != null && !string.IsNullOrEmpty(user.HashedPassword))
            {
                try
                {
                    isPasswordValid = Argon2.Verify(user.HashedPassword, loginDto.Password);
                }
                catch (Exception)
                {
                    // Catch malformed hashes safely so the API doesn't crash
                    isPasswordValid = false;
                }
            }

            if (!isPasswordValid)
                return Unauthorized(new { detail = "Invalid credentials" });

            var token = GenerateJwtToken(user);

            // Matches FastAPI's default OAuth2 bearer response
            return Ok(new { access_token = token, token_type = "bearer" });
        }
        [HttpPost("jwt/logout")]
        [Authorize] // Requires the user to pass their token one last time
        public IActionResult Logout()
        {
            // For standard stateless JWTs, "logging out" is a client-side action 
            // where the frontend drops the token. The backend simply acknowledges the request.

            // Note: If you were using HTTP-only cookies instead of returning the token 
            // in the JSON body during login, you would clear the cookie here like this:
            // Response.Cookies.Delete("YourCookieName");

            return Ok(new { message = "Successfully logged out." });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Use a List instead of an array so we can dynamically add claims
            var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, user.Email)
    };

            // Assign the appropriate role claim
            if (user.IsSuperuser)
            {
                claims.Add(new Claim(ClaimTypes.Role, "SuperUser"));
            }
            else
            {
                // It is a good practice to assign a default role to standard users
                claims.Add(new Claim(ClaimTypes.Role, "StandardUser"));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}