using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TorootoAPI.Application.Auth;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.UseCases;
using TorootoASP.Extensions;

namespace TorootoASP.Controllers;

[EnableRateLimiting("StandardLimit")]
[ApiController]
[Route("auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserCreateDto dto, CancellationToken ct)
    {
        var result = await authService.RegisterAsync(dto, ct);
        return this.ToActionResult(result, "Registered successfully.");
    }

    [HttpPost("jwt/login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto, CancellationToken ct)
    {
        var result = await authService.LoginAsync(loginDto, ct);
        return this.ToActionResult(result, "Logged in successfully.");
    }

    [HttpPost("jwt/logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return Ok(new ApiResponse<object>(true, null, "Successfully logged out."));
    }
}
