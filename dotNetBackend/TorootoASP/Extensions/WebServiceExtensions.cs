using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Domain.Common;

namespace TorootoASP.Extensions;

public static class WebServiceExtensions
{
    public static IServiceCollection AddWebPresentationServices(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontendApps", policy =>
            {
                policy.WithOrigins(
                        "https://torooto.onrender.com",
                        "http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            var secret = config["JwtSettings:Secret"] ?? string.Empty;
            var issuer = config["JwtSettings:Issuer"] ?? string.Empty;
            var audience = config["JwtSettings:Audience"] ?? string.Empty;

            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
            };
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy("StandardLimit", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 30,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
        });

        return services;
    }

    public static IActionResult ToActionResult<T>(
        this ControllerBase controller,
        Result<T> result,
        string successMessage)
    {
        if (result.IsSuccess)
            return controller.Ok(new ApiResponse<T>(true, result.Value, successMessage));

        return result.Error.Type switch
        {
            ErrorType.Validation => controller.BadRequest(new ApiResponse<object>(false, null, result.Error.Message)),
            ErrorType.NotFound => controller.NotFound(new ApiResponse<object>(false, null, result.Error.Message)),
            ErrorType.Conflict => controller.Conflict(new ApiResponse<object>(false, null, result.Error.Message)),
            ErrorType.Unauthorized => controller.Unauthorized(new ApiResponse<object>(false, null, result.Error.Message)),
            ErrorType.Forbidden => controller.StatusCode(StatusCodes.Status403Forbidden, new ApiResponse<object>(false, null, result.Error.Message)),
            _ => controller.StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse<object>(false, null, result.Error.Message))
        };
    }

    public static bool TryGetUserId(this ClaimsPrincipal principal, out Guid userId)
    {
        var rawId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub");

        return Guid.TryParse(rawId, out userId);
    }
}
