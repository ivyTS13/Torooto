using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Text;
using System.Threading.RateLimiting;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Infrastucture.Models;
using TorootoAPI.Infrastucture.Repositories;
using TorootoAPI.Infrastucture.Services;

namespace TorootoAPI.Infrastucture.DependencyInjection
{
    public static class ServiceContainer
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
        {
            // add Dbcontext
            services.AddDbContext<TorootoDBContext>(option => option.UseNpgsql(config.GetConnectionString("DefaultConnection"),
                npgsqlOptionsAction => npgsqlOptionsAction.EnableRetryOnFailure()));

            // create DI
            services.AddScoped<IPileRepository, PileRepository>();
            services.AddScoped<ICardRepository, CardRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDeckRepository, DeckRepository>();
            services.AddScoped<IImageStorageService, ImageKitStorageService>();
            services.AddScoped<ICacheService, RedisCacheService>();
            // Configure CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontendApps", policy =>
                {
                    policy.WithOrigins(
                            "https://torooto.onrender.com",
                            "http://localhost:5173"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            // JWT schema
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                var key = Encoding.UTF8.GetBytes(config.GetSection("JwtSettings:Secret").Value!);
                string issuer = config.GetSection("JwtSettings:Issuer").Value!;
                string audience = config.GetSection("JwtSettings:Audience").Value!;

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
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });

            // Redis
            services.AddStackExchangeRedisCache(options =>
            {
                var connectionString = config.GetConnectionString("RedisConnection");

                options.ConfigurationOptions = StackExchange.Redis.ConfigurationOptions.Parse(connectionString!);
                options.ConfigurationOptions.Ssl = true;
                options.ConfigurationOptions.AbortOnConnectFail = false; // Prevent startup crashes on timeout
                options.InstanceName = "Torooto";
            });
            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var connectionString = config.GetConnectionString("RedisConnection") ?? "localhost:6379";

                // Add the 'return' keyword here:
                return ConnectionMultiplexer.Connect(connectionString);
            }); 
            // Rate Limiting 
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                // Create a policy named "StandardLimit"
                options.AddPolicy("StandardLimit", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        // Group requests by the user's IP Address
                        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 30, // Max 30 requests...
                            Window = TimeSpan.FromMinutes(1), // ...every 1 minute
                            QueueLimit = 0 // Do not queue excess requests, reject them immediately
                        }));
            });
            return services;
        }
    }
}
