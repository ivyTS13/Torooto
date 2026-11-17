using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Collections.Concurrent;
using System.Text.Json;
using TorootoAPI.Application.Interfaces;

namespace TorootoAPI.Infrastucture.Services;

public sealed class MemoryCacheKeyRegistry
{
    private readonly ConcurrentDictionary<string, byte> _keys = new();

    public void Track(string key) => _keys.TryAdd(key, 0);

    public void Untrack(string key) => _keys.TryRemove(key, out _);

    public IReadOnlyList<string> PopMatching(string patternFragment)
    {
        var matches = new List<string>();
        foreach (var key in _keys.Keys)
        {
            if (key.Contains(patternFragment, StringComparison.Ordinal))
            {
                if (_keys.TryRemove(key, out _))
                    matches.Add(key);
            }
        }
        return matches;
    }
}

public sealed class RedisCacheService(
    IMemoryCache memoryCache,
    MemoryCacheKeyRegistry keyRegistry,
    IDistributedCache cache,
    IConnectionMultiplexer connectionMultiplexer,
    ILogger<RedisCacheService> logger) : ICacheService
{
    private static readonly TimeSpan MaxL1Duration = TimeSpan.FromMinutes(15);
    private const int DeleteBatchSize = 256;

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        if (memoryCache.TryGetValue(key, out T? l1Value) && l1Value is not null)
            return l1Value;

        try
        {
            var cachedData = await cache.GetStringAsync(key, ct);
            if (cachedData is null) return default;

            var deserialized = JsonSerializer.Deserialize<T>(cachedData);
            if (deserialized is not null)
                SetL1(key, deserialized, MaxL1Duration, null);

            return deserialized;
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis Cache Read Failed for key {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(
        string key,
        T data,
        TimeSpan? absoluteExpireTime = null,
        TimeSpan? slidingExpireTime = null,
        CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var l2Absolute = absoluteExpireTime ?? TimeSpan.FromMinutes(10);
        var l1Absolute = l2Absolute < MaxL1Duration ? l2Absolute : MaxL1Duration;
        SetL1(key, data, l1Absolute, slidingExpireTime);

        try
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = l2Absolute,
                SlidingExpiration = slidingExpireTime
            };

            var serializedData = JsonSerializer.Serialize(data);
            await cache.SetStringAsync(key, serializedData, options, ct);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis Cache Write Failed for key {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        memoryCache.Remove(key);
        keyRegistry.Untrack(key);

        try
        {
            await cache.RemoveAsync(key, ct);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis Cache Remove Failed for key {Key}", key);
        }
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var needle = pattern.Replace("*", string.Empty, StringComparison.Ordinal);
        foreach (var l1Key in keyRegistry.PopMatching(needle))
        {
            memoryCache.Remove(l1Key);
        }

        try
        {
            foreach (var endpoint in connectionMultiplexer.GetEndPoints())
            {
                ct.ThrowIfCancellationRequested();
                var server = connectionMultiplexer.GetServer(endpoint);
                if (server.IsReplica) continue;

                var db = connectionMultiplexer.GetDatabase();
                var batch = new List<RedisKey>(DeleteBatchSize);

                await foreach (var key in server.KeysAsync(pattern: $"*{needle}*").WithCancellation(ct))
                {
                    batch.Add(key);
                    if (batch.Count >= DeleteBatchSize)
                    {
                        await db.KeyDeleteAsync(batch.ToArray());
                        batch.Clear();
                    }
                }

                if (batch.Count > 0)
                    await db.KeyDeleteAsync(batch.ToArray());
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis Cache RemoveByPattern Failed for pattern {Pattern}", pattern);
        }
    }

    private void SetL1<T>(string key, T data, TimeSpan absoluteExpiration, TimeSpan? slidingExpiration)
    {
        var entryOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = absoluteExpiration,
            SlidingExpiration = slidingExpiration
        };
        entryOptions.RegisterPostEvictionCallback((evictedKey, _, _, _) =>
        {
            if (evictedKey is string keyString)
                keyRegistry.Untrack(keyString);
        });

        memoryCache.Set(key, data, entryOptions);
        keyRegistry.Track(key);
    }
}
