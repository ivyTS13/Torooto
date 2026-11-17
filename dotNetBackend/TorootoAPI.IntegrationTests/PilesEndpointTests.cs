using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TorootoAPI.Domain.Models;
using TorootoAPI.IntegrationTests.Infrastructure;
using Xunit;

namespace TorootoAPI.IntegrationTests;

public sealed class PilesEndpointTests(TorootoWebApplicationFactory factory)
    : IClassFixture<TorootoWebApplicationFactory>
{
    [Fact]
    public async Task Piles_Lifecycle_Enforces_Auth_Ownership_IDOR_Protection_And_Cache_Invalidation()
    {
        User? owner = null;
        User? otherUser = null;
        List<Card> seededCards = [];

        await factory.WithDbContextAsync(async (db, hasher) =>
        {
            owner = User.Create($"owner_{Guid.NewGuid():N}@example.com", hasher.Hash("Pass123!"), "Owner", null, null);
            otherUser = User.Create($"other_{Guid.NewGuid():N}@example.com", hasher.Hash("Pass123!"), "Other", null, null);

            var deck = Deck.Create("Tarot Deck", "Tarot", "78 cards", DateTime.UtcNow);
            seededCards = Enumerable.Range(0, 5)
                .Select(i => Card.Create(deck.DeckId, $"Card {i}", "Major Arcana", i, imageUrl: $"https://ik.imagekit.io/test/{i}.jpg"))
                .ToList();

            db.Users.AddRange(owner, otherUser);
            db.Decks.Add(deck);
            db.Cards.AddRange(seededCards);
            await db.SaveChangesAsync();
        });

        var anonClient = factory.CreateClient();
        var anonResp = await anonClient.PostAsJsonAsync("/piles/add", new { number_of_cards = 3, is_reversed = false });
        Assert.Equal(HttpStatusCode.Unauthorized, anonResp.StatusCode);

        using var ownerClient = factory.CreateAuthenticatedClient(owner!);
        using var otherClient = factory.CreateAuthenticatedClient(otherUser!);

        // Warm paged pile list cache
        var initialList = await ownerClient.GetAsync("/piles/list?page=1&pageSize=5");
        Assert.Equal(HttpStatusCode.OK, initialList.StatusCode);
        Assert.True(factory.TestCache.ContainsKey($"piles_user_{owner!.Id}_page_1_size_5"));
        factory.TestCache.ResetTracking();

        // Save spread using snake_case DTO contract
        var saveResponse = await ownerClient.PostAsJsonAsync("/piles/save-fe-pile", new
        {
            cards = new[]
            {
                new { card_id = seededCards[0].CardId, reversed_card = false, position = 0 },
                new { card_id = seededCards[1].CardId, reversed_card = true, position = 1 }
            }
        });
        Assert.Equal(HttpStatusCode.OK, saveResponse.StatusCode);

        using var saveJson = JsonDocument.Parse(await saveResponse.Content.ReadAsStringAsync());
        var pileId = saveJson.RootElement.GetProperty("data").GetProperty("pile_id").GetGuid();
        Assert.NotEqual(Guid.Empty, pileId);
        Assert.Contains($"piles_user_{owner.Id}_*", factory.TestCache.RemovedPatterns);
        Assert.False(factory.TestCache.ContainsKey($"piles_user_{owner.Id}_page_1_size_5"));

        // Verify owner can fetch detail, while another user receives 404 (IDOR protection)
        var ownerGet = await ownerClient.GetAsync($"/piles/{pileId}");
        Assert.Equal(HttpStatusCode.OK, ownerGet.StatusCode);

        var otherGet = await otherClient.GetAsync($"/piles/{pileId}");
        Assert.Equal(HttpStatusCode.NotFound, otherGet.StatusCode);

        var otherDelete = await otherClient.DeleteAsync($"/piles/{pileId}");
        Assert.Equal(HttpStatusCode.NotFound, otherDelete.StatusCode);

        factory.TestCache.ResetTracking();
        var ownerDelete = await ownerClient.DeleteAsync($"/piles/{pileId}");
        Assert.Equal(HttpStatusCode.OK, ownerDelete.StatusCode);
        Assert.Contains($"piles_user_{owner.Id}_*", factory.TestCache.RemovedPatterns);

        var afterDeleteList = await ownerClient.GetAsync("/piles/list?page=1&pageSize=5");
        using var listJson = JsonDocument.Parse(await afterDeleteList.Content.ReadAsStringAsync());
        Assert.Equal(0, listJson.RootElement.GetProperty("data").GetProperty("items").GetArrayLength());

        var drawResponse = await ownerClient.PostAsJsonAsync("/piles/add", new { number_of_cards = 3, is_reversed = true });
        Assert.Equal(HttpStatusCode.OK, drawResponse.StatusCode);
        using var drawJson = JsonDocument.Parse(await drawResponse.Content.ReadAsStringAsync());
        var drewData = drawJson.RootElement.GetProperty("data");
        Assert.NotEqual(Guid.Empty, drewData.GetProperty("pile_id").GetGuid());
        Assert.Equal(3, drewData.GetProperty("pile_contents").GetArrayLength());
    }
}
