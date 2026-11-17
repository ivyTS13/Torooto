using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TorootoAPI.Domain.Models;
using TorootoAPI.IntegrationTests.Infrastructure;
using Xunit;

namespace TorootoAPI.IntegrationTests;

public sealed class DecksAndCardsEndpointTests(TorootoWebApplicationFactory factory)
    : IClassFixture<TorootoWebApplicationFactory>
{
    private static async Task<(User Admin, User Regular, Deck Deck)> SeedAdminAndDeckAsync(TorootoWebApplicationFactory factory)
    {
        User? admin = null;
        User? regular = null;
        Deck? deck = null;

        await factory.WithDbContextAsync(async (db, hasher) =>
        {
            admin = User.Create($"admin_{Guid.NewGuid():N}@example.com", hasher.Hash("Admin123!"), "Admin", null, null);
            typeof(User).GetProperty(nameof(User.IsSuperuser))!.SetValue(admin, true);

            regular = User.Create($"user_{Guid.NewGuid():N}@example.com", hasher.Hash("User123!"), "Seeker", null, null);
            deck = Deck.Create("Rider Waite", "Tarot", "Classic deck", DateTime.UtcNow);
            var existingCard = Card.Create(deck.DeckId, "0 - The Fool", "Major Arcana", 0, imageUrl: "https://img/fool.jpg");

            db.Users.AddRange(admin, regular);
            db.Decks.Add(deck);
            db.Cards.Add(existingCard);
            await db.SaveChangesAsync();
        });

        return (admin!, regular!, deck!);
    }

    [Fact]
    public async Task AddCard_Binds_SnakeCase_DeckId_Route_And_Invalidates_Metadata_Caches()
    {
        var (admin, regular, deck) = await SeedAdminAndDeckAsync(factory);

        // Warm caches via public GET endpoints first
        var publicClient = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await publicClient.GetAsync("/decks/tarot-cards")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await publicClient.GetAsync($"/decks/{deck.DeckId}/cards")).StatusCode);
        Assert.True(factory.TestCache.ContainsKey("tarot_deck"));
        Assert.True(factory.TestCache.ContainsKey($"deck_{deck.DeckId}"));
        factory.TestCache.ResetTracking();

        using var regularClient = factory.CreateAuthenticatedClient(regular);
        var forbiddenResp = await regularClient.PostAsJsonAsync($"/decks/{deck.DeckId}/cards", new
        {
            card_name = "I - The Magician",
            card_suit = "Major Arcana",
            card_position = 1
        });
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenResp.StatusCode);

        using var adminClient = factory.CreateAuthenticatedClient(admin);
        var addResponse = await adminClient.PostAsJsonAsync($"/decks/{deck.DeckId}/cards", new
        {
            card_name = "I - The Magician",
            card_suit = "Major Arcana",
            card_position = 1,
            card_metadata = new Dictionary<string, object> { ["upright"] = "Skill and willpower" }
        });

        Assert.Equal(HttpStatusCode.OK, addResponse.StatusCode);
        using var json = JsonDocument.Parse(await addResponse.Content.ReadAsStringAsync());
        var cardData = json.RootElement.GetProperty("data");
        Assert.Equal(deck.DeckId, cardData.GetProperty("deck_id").GetGuid());
        Assert.NotEqual(Guid.Empty, cardData.GetProperty("card_id").GetGuid());
        Assert.Equal("I - The Magician", cardData.GetProperty("card_name").GetString());

        Assert.Contains("tarot_deck", factory.TestCache.RemovedKeys);
        Assert.Contains($"deck_{deck.DeckId}", factory.TestCache.RemovedKeys);
    }

    [Fact]
    public async Task Missing_Deck_Delete_Returns_404_And_Deck_SoftDelete_Restore_Invalidates_Caches()
    {
        var (admin, _, deck) = await SeedAdminAndDeckAsync(factory);
        using var adminClient = factory.CreateAuthenticatedClient(admin);

        var notFoundDelete = await adminClient.DeleteAsync($"/decks/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, notFoundDelete.StatusCode);

        factory.TestCache.ResetTracking();
        var deleteResp = await adminClient.DeleteAsync($"/decks/{deck.DeckId}");
        Assert.Equal(HttpStatusCode.OK, deleteResp.StatusCode);

        Assert.Contains("all_decks", factory.TestCache.RemovedKeys);
        Assert.Contains("tarot_deck", factory.TestCache.RemovedKeys);
        Assert.Contains($"deck_{deck.DeckId}", factory.TestCache.RemovedKeys);

        factory.TestCache.ResetTracking();
        var restoreResp = await adminClient.PostAsync($"/decks/{deck.DeckId}/restore", null);
        Assert.Equal(HttpStatusCode.OK, restoreResp.StatusCode);

        Assert.Contains("all_decks", factory.TestCache.RemovedKeys);
        Assert.Contains("tarot_deck", factory.TestCache.RemovedKeys);
        Assert.Contains($"deck_{deck.DeckId}", factory.TestCache.RemovedKeys);

        var restoredCardsResp = await adminClient.GetAsync($"/decks/{deck.DeckId}/cards");
        Assert.Equal(HttpStatusCode.OK, restoredCardsResp.StatusCode);
        using var restoredCardsJson = JsonDocument.Parse(await restoredCardsResp.Content.ReadAsStringAsync());
        Assert.True(restoredCardsJson.RootElement.GetProperty("data").GetArrayLength() >= 1);
    }
}
