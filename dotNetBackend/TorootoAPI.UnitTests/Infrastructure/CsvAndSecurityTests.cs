using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using StackExchange.Redis;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Services;
using Xunit;

namespace TorootoAPI.UnitTests.Infrastructure;

public sealed class CsvAndSecurityTests
{
    [Fact]
    public async Task CsvCardParser_Parses_Quoted_Fields_And_Normalizes_Metadata_Headers()
    {
        const string csv = """"
            Card Number & Name,suit,image_url,position,Upright Meaning,Shadow Aspect
            "0 - The Fool","Major Arcana","https://ik.imagekit.io/demo/fool.jpg",0,"New beginnings, leap of faith","Recklessness ""ignored"""

            "1 - The Magician",Major Arcana,,1,Manifestation,Manipulation
            """";

        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var parser = new CsvCardParser();

        var result = await parser.ParseAsync(stream);

        Assert.Null(result.FatalError);
        Assert.Empty(result.Errors);
        Assert.Equal(2, result.Rows.Count);

        var fool = result.Rows[0];
        Assert.Equal("0 - The Fool", fool.CardName);
        Assert.Equal("Major Arcana", fool.CardSuit);
        Assert.Equal(0, fool.CardPosition);
        Assert.Equal("https://ik.imagekit.io/demo/fool.jpg", fool.ImageUrl);
        Assert.Equal("New beginnings, leap of faith", fool.Metadata["upright_meaning"]);
        Assert.Equal("Recklessness \"ignored\"", fool.Metadata["shadow_aspect"]);

        var magician = result.Rows[1];
        Assert.Null(magician.ImageUrl);
        Assert.Equal(1, magician.CardPosition);
    }

    [Fact]
    public async Task CsvCardParser_Reports_Missing_Headers_And_Row_Errors()
    {
        const string missingHeaderCsv = "name,suit\nFool,Major\n";
        await using var badHeaderStream = new MemoryStream(Encoding.UTF8.GetBytes(missingHeaderCsv));
        var parser = new CsvCardParser();

        var headerResult = await parser.ParseAsync(badHeaderStream);
        Assert.NotNull(headerResult.FatalError);
        Assert.Contains("Missing columns", headerResult.FatalError);

        const string invalidRowsCsv = """
            Card Number & Name,suit,image_url,position
            Valid Card,Cups,https://img/1.jpg,2
            Bad Position,Cups,,not-a-number
            ,Cups,,3
            Short Row,Swords
            """;
        await using var badRowsStream = new MemoryStream(Encoding.UTF8.GetBytes(invalidRowsCsv));
        var rowsResult = await parser.ParseAsync(badRowsStream);

        Assert.Null(rowsResult.FatalError);
        Assert.Single(rowsResult.Rows);
        Assert.Equal(3, rowsResult.Errors.Count);
    }

    [Fact]
    public async Task CsvCardParser_Propagates_CancellationToken()
    {
        const string csv = "Card Number & Name,suit,image_url,position\nFool,Major,,0\n";
        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        var parser = new CsvCardParser();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => parser.ParseAsync(stream, cts.Token));
    }

    [Fact]
    public void Argon2PasswordHasher_Hashes_And_Verifies_Safely()
    {
        var hasher = new Argon2PasswordHasher();
        var hash = hasher.Hash("ArcanaSecret#99");

        Assert.NotEqual("ArcanaSecret#99", hash);
        Assert.True(hasher.Verify(hash, "ArcanaSecret#99"));
        Assert.False(hasher.Verify(hash, "wrong-password"));
        Assert.False(hasher.Verify("corrupted-hash-format", "ArcanaSecret#99"));
    }

    [Fact]
    public void JwtTokenService_Includes_Expected_Claims_And_Role()
    {
        var values = new Dictionary<string, string?>
        {
            ["Secret"] = "SuperSecretIntegrationKeyForTestingPurposes123!",
            ["Issuer"] = "TorootoTests",
            ["Audience"] = "TorootoClients",
            ["ExpiryMinutes"] = "30"
        };

        var sectionMock = new Mock<IConfigurationSection>();
        sectionMock.Setup(s => s[It.IsAny<string>()]).Returns((string k) => values.GetValueOrDefault(k));

        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c.GetSection("JwtSettings")).Returns(sectionMock.Object);

        var user = User.Create("tarot@example.com", "hash", "TarotReader", null, null);
        var tokenString = new JwtTokenService(configMock.Object).GenerateJwtToken(user);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(tokenString);
        Assert.Equal("TorootoTests", jwt.Issuer);
        Assert.Contains("TorootoClients", jwt.Audiences);
        Assert.Equal(user.Id.ToString(), jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("tarot@example.com", jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal("StandardUser", jwt.Claims.First(c => c.Type == ClaimTypes.Role).Value);
    }

    [Fact]
    public async Task RedisCacheService_Uses_L1_Hit_And_Pops_Pattern_Keys()
    {
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var registry = new MemoryCacheKeyRegistry();
        var distributedCache = new Mock<IDistributedCache>();
        var multiplexer = new Mock<IConnectionMultiplexer>();
        multiplexer.Setup(m => m.GetEndPoints(It.IsAny<bool>())).Returns([]);

        var sut = new RedisCacheService(
            memoryCache,
            registry,
            distributedCache.Object,
            multiplexer.Object,
            NullLogger<RedisCacheService>.Instance);

        var userId = Guid.NewGuid();
        var key = $"piles_user_{userId}_page_1_size_5";
        await sut.SetAsync(key, "cached-payload", TimeSpan.FromMinutes(20));

        var hit = await sut.GetAsync<string>(key);
        Assert.Equal("cached-payload", hit);
        distributedCache.Verify(d => d.GetAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);

        await sut.RemoveByPatternAsync($"piles_user_{userId}_*");
        Assert.False(memoryCache.TryGetValue(key, out _));
    }
}
