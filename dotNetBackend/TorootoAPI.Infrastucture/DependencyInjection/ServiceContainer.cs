using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Infrastucture.Models;
using TorootoAPI.Infrastucture.Repositories;
using TorootoAPI.Infrastucture.Services;

namespace TorootoAPI.Infrastucture.DependencyInjection;

public static class ServiceContainer
{
    public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<TorootoDBContext>(option =>
            option.UseNpgsql(
                config.GetConnectionString("DefaultConnection"),
                npgsqlOptionsAction => npgsqlOptionsAction.EnableRetryOnFailure()));

        services.AddScoped<IPileRepository, PileRepository>();
        services.AddScoped<ICardRepository, CardRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IDeckRepository, DeckRepository>();

        services.AddMemoryCache();
        services.AddSingleton<MemoryCacheKeyRegistry>();

        services.AddScoped<IImageStorageService, ImageKitStorageService>();
        services.AddScoped<ICacheService, RedisCacheService>();
        services.AddScoped<IPasswordHasher, Argon2PasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<ICsvCardParser, CsvCardParser>();

        var rawRedisConnection = config.GetConnectionString("RedisConnection");
        var redisConnectionString = string.IsNullOrWhiteSpace(rawRedisConnection)
            ? "localhost:6379"
            : rawRedisConnection;

        var redisOptions = ConfigurationOptions.Parse(redisConnectionString);
        redisOptions.AbortOnConnectFail = false;
        if (!redisConnectionString.Contains("localhost", StringComparison.OrdinalIgnoreCase) &&
            !redisConnectionString.Contains("127.0.0.1", StringComparison.OrdinalIgnoreCase))
        {
            redisOptions.Ssl = true;
        }

        services.AddStackExchangeRedisCache(options =>
        {
            options.ConfigurationOptions = redisOptions.Clone();
            options.InstanceName = "Torooto";
        });

        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(redisOptions.Clone()));

        return services;
    }
}
