using System.Collections.Concurrent;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using StackExchange.Redis;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.IntegrationTests.Infrastructure;

public sealed class RecordingCacheService : ICacheService
{
    private readonly ConcurrentDictionary<string, string> _store = new();
    public ConcurrentQueue<string> RemovedKeys { get; } = new();
    public ConcurrentQueue<string> RemovedPatterns { get; } = new();

    public Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        if (_store.TryGetValue(key, out var json))
            return Task.FromResult(JsonSerializer.Deserialize<T>(json));

        return Task.FromResult<T?>(default);
    }

    public Task SetAsync<T>(
        string key,
        T data,
        TimeSpan? absoluteExpireTime = null,
        TimeSpan? slidingExpireTime = null,
        CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        _store[key] = JsonSerializer.Serialize(data);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        _store.TryRemove(key, out _);
        RemovedKeys.Enqueue(key);
        return Task.CompletedTask;
    }

    public Task RemoveByPatternAsync(string pattern, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var needle = pattern.Replace("*", string.Empty, StringComparison.Ordinal);
        foreach (var key in _store.Keys)
        {
            if (key.Contains(needle, StringComparison.Ordinal))
                _store.TryRemove(key, out _);
        }

        RemovedPatterns.Enqueue(pattern);
        return Task.CompletedTask;
    }

    public bool ContainsKey(string key) => _store.ContainsKey(key);

    public void ResetTracking()
    {
        RemovedKeys.Clear();
        RemovedPatterns.Clear();
    }
}

public sealed class FakeImageStorageService : IImageStorageService
{
    public Task<string> UploadImageAsync(ImageUploadRequest request, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult($"https://ik.imagekit.io/test{request.Folder}/{request.FileName}");
    }
}

public sealed class TorootoWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"TorootoTestDb_{Guid.NewGuid():N}";

    public RecordingCacheService TestCache { get; } = new();
    public FakeImageStorageService TestImageStorage { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:DefaultConnection", "Host=localhost;Database=torooto_test;Username=test;Password=test");
        builder.UseSetting("ConnectionStrings:RedisConnection", "localhost:6379");
        builder.UseSetting("JwtSettings:Secret", "IntegrationTestJwtSecretKeyMustBeAtLeast32CharsLong!");
        builder.UseSetting("JwtSettings:Issuer", "TorootoTestIssuer");
        builder.UseSetting("JwtSettings:Audience", "TorootoTestAudience");
        builder.UseSetting("JwtSettings:ExpiryMinutes", "60");
        builder.UseSetting("ImageKit:PrivateKey", "test_private_key");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<TorootoDBContext>>();
            services.RemoveAll<DbContextOptions>();
            services.RemoveAll<TorootoDBContext>();

            var efConfigDescriptors = services
                .Where(d => d.ServiceType.IsGenericType &&
                            d.ServiceType.GetGenericTypeDefinition().Name.StartsWith("IDbContextOptionsConfiguration", StringComparison.Ordinal))
                .ToList();

            foreach (var descriptor in efConfigDescriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<TorootoDBContext>(options =>
                options.UseInMemoryDatabase(_databaseName));

            services.RemoveAll<IConnectionMultiplexer>();
            services.RemoveAll<ICacheService>();
            services.AddSingleton<ICacheService>(TestCache);

            services.RemoveAll<IImageStorageService>();
            services.AddSingleton<IImageStorageService>(TestImageStorage);
        });
    }

    public async Task WithDbContextAsync(Func<TorootoDBContext, IPasswordHasher, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TorootoDBContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        await db.Database.EnsureCreatedAsync();
        await action(db, hasher);
    }

    public HttpClient CreateAuthenticatedClient(User user)
    {
        using var scope = Services.CreateScope();
        var tokenService = scope.ServiceProvider.GetRequiredService<ITokenService>();
        var token = tokenService.GenerateJwtToken(user);

        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}
