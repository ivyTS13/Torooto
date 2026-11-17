using TorootoAPI.Domain.Common;
using TorootoAPI.Domain.Models;
using Xunit;

namespace TorootoAPI.UnitTests.Domain;

public sealed class DomainInvariantTests
{
    [Fact]
    public void Pile_Create_Generates_Ids_And_Orders_By_Position()
    {
        var userId = Guid.NewGuid();
        var cardA = Guid.NewGuid();
        var cardB = Guid.NewGuid();
        var cardC = Guid.NewGuid();
        var now = DateTime.UtcNow;

        var pile = Pile.Create(
            userId,
            now,
            [
                (cardC, 2, true),
                (cardA, 0, false),
                (cardB, 1, true)
            ]);

        Assert.NotEqual(Guid.Empty, pile.PileId);
        Assert.Equal(userId, pile.UserId);
        Assert.Equal(now, pile.DrawnAt);
        Assert.False(pile.IsDeleted);
        Assert.Null(pile.DeletedAt);
        Assert.Equal(3, pile.PileContents.Count);

        var ordered = pile.PileContents.ToList();
        Assert.Equal([cardA, cardB, cardC], ordered.Select(x => x.CardId));
        Assert.Equal([0, 1, 2], ordered.Select(x => x.Position));
        Assert.Equal([false, true, true], ordered.Select(x => x.ReversedCard));
        Assert.All(ordered, pc =>
        {
            Assert.NotEqual(Guid.Empty, pc.PileContentId);
            Assert.Equal(pile.PileId, pc.PileId);
            Assert.False(pc.IsDeleted);
        });
    }

    [Fact]
    public void Pile_Create_Throws_When_UserId_Empty_Cards_Empty_Or_Duplicate_Cards()
    {
        var cardId = Guid.NewGuid();

        Assert.Throws<ArgumentException>(() =>
            Pile.Create(Guid.Empty, DateTime.UtcNow, [(cardId, 0, false)]));

        Assert.Throws<ArgumentException>(() =>
            Pile.Create(Guid.NewGuid(), DateTime.UtcNow, []));

        Assert.Throws<ArgumentException>(() =>
            Pile.Create(Guid.NewGuid(), DateTime.UtcNow, [(cardId, 0, false), (cardId, 1, true)]));
    }

    [Fact]
    public void PileContent_Create_Rejects_Invalid_Arguments()
    {
        Assert.Throws<ArgumentException>(() => PileContent.Create(Guid.Empty, Guid.NewGuid(), 0, false));
        Assert.Throws<ArgumentException>(() => PileContent.Create(Guid.NewGuid(), Guid.Empty, 0, false));
        Assert.Throws<ArgumentOutOfRangeException>(() => PileContent.Create(Guid.NewGuid(), Guid.NewGuid(), -1, false));
    }

    [Fact]
    public void Card_Create_And_Mutations_Enforce_Invariants()
    {
        var deckId = Guid.NewGuid();
        var card = Card.Create(deckId, "  The Fool  ", "  Major Arcana ", 0, null, "https://example.com/fool.jpg");

        Assert.NotEqual(Guid.Empty, card.CardId);
        Assert.Equal(deckId, card.DeckId);
        Assert.Equal("The Fool", card.CardName);
        Assert.Equal("Major Arcana", card.CardSuit);
        Assert.NotNull(card.CardMetadata);
        Assert.False(card.IsDeleted);

        Assert.Throws<ArgumentException>(() => Card.Create(Guid.Empty, "The Fool", "Major", 0));
        Assert.Throws<ArgumentException>(() => Card.Create(deckId, " ", "Major", 0));
        Assert.Throws<ArgumentException>(() => Card.Create(deckId, "The Fool", "", 0));

        card.UpdateDetails("  The Magician ", " Major Arcana ", 1, new() { ["element"] = "Air" }, null);
        Assert.Equal("The Magician", card.CardName);
        Assert.Equal(1, card.CardPosition);
        Assert.Equal("Air", card.CardMetadata["element"]);
        Assert.Equal("https://example.com/fool.jpg", card.ImageUrl);

        Assert.Throws<ArgumentException>(() => card.UpdateImage(" "));
        card.UpdateImage("  https://example.com/magician.jpg ");
        Assert.Equal("https://example.com/magician.jpg", card.ImageUrl);

        var deletedAt = DateTime.UtcNow;
        card.SoftDelete(deletedAt);
        Assert.True(card.IsDeleted);
        Assert.Equal(deletedAt, card.DeletedAt);

        card.Restore();
        Assert.False(card.IsDeleted);
        Assert.Null(card.DeletedAt);
    }

    [Fact]
    public void Deck_Create_And_Mutations_Enforce_Invariants()
    {
        var now = DateTime.UtcNow;
        var deck = Deck.Create(" Rider Waite ", " tarot ", " Classic 78-card deck ", now);

        Assert.NotEqual(Guid.Empty, deck.DeckId);
        Assert.Equal("Rider Waite", deck.DeckName);
        Assert.Equal("tarot", deck.DeckType);
        Assert.Equal("Classic 78-card deck", deck.DeckContent);
        Assert.Equal(now, deck.CreatedAt);
        Assert.False(deck.IsDeleted);

        Assert.Throws<ArgumentException>(() => Deck.Create("", "tarot", "desc", now));
        Assert.Throws<ArgumentException>(() => Deck.Create("Name", " ", "desc", now));
        Assert.Throws<ArgumentException>(() => deck.Update("   ", "desc"));

        deck.Update(" Updated Name ", " Updated Desc ");
        Assert.Equal("Updated Name", deck.DeckName);
        Assert.Equal("Updated Desc", deck.DeckContent);

        deck.SoftDelete(now);
        Assert.True(deck.IsDeleted);
        deck.Restore();
        Assert.False(deck.IsDeleted);
        Assert.Null(deck.DeletedAt);
    }

    [Fact]
    public void User_Create_Normalizes_Email_And_Enforces_Invariants()
    {
        var user = User.Create("  Reader@Example.COM ", "hashed-secret", "  Morgan ", new DateOnly(1995, 10, 24), " Scorpio ");

        Assert.NotEqual(Guid.Empty, user.Id);
        Assert.Equal("reader@example.com", user.Email);
        Assert.Equal("Morgan", user.Name);
        Assert.Equal("Scorpio", user.ZodiacSign);
        Assert.True(user.IsActive);
        Assert.False(user.IsSuperuser);

        Assert.Throws<ArgumentException>(() => User.Create("", "hash", null, null, null));
        Assert.Throws<ArgumentException>(() => User.Create("a@b.com", " ", null, null, null));
        Assert.Throws<ArgumentException>(() => user.UpdateImage(""));
    }

    [Fact]
    public void Result_Throws_On_Invalid_Access_Or_Error_Combination()
    {
        var failure = Result.Failure<string>(DomainError.NotFound("Missing"));
        Assert.True(failure.IsFailure);
        Assert.Throws<InvalidOperationException>(() => _ = failure.Value);

        var success = Result.Success(42);
        Assert.True(success.IsSuccess);
        Assert.Equal(42, success.Value);
        Assert.Equal(ErrorType.None, success.Error.Type);
    }
}
