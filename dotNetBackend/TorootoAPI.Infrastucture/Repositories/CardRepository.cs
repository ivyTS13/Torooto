using Microsoft.EntityFrameworkCore;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.Infrastucture.Repositories;

public sealed class CardRepository(TorootoDBContext context) : ICardRepository
{
    public async Task<Card?> GetCardByIdAsync(Guid cardId, CancellationToken ct = default)
    {
        return await context.Cards
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CardId == cardId, ct);
    }

    public async Task<Card> CreateCardAsync(Card card, CancellationToken ct = default)
    {
        context.Cards.Add(card);
        await context.SaveChangesAsync(ct);
        return card;
    }

    public async Task<IEnumerable<Card>> CreateCardsBulkAsync(IEnumerable<Card> cards, CancellationToken ct = default)
    {
        var list = cards.ToList();
        await context.Cards.AddRangeAsync(list, ct);
        await context.SaveChangesAsync(ct);
        return list;
    }

    public async Task<Card?> UpdateCardAsync(Card card, CancellationToken ct = default)
    {
        context.Cards.Update(card);
        await context.SaveChangesAsync(ct);
        return card;
    }

    public async Task<Card?> SoftDeleteCardAsync(Guid cardId, CancellationToken ct = default)
    {
        var card = await context.Cards.FirstOrDefaultAsync(c => c.CardId == cardId, ct);
        if (card is null) return null;

        card.SoftDelete(DateTime.UtcNow);
        await context.SaveChangesAsync(ct);
        return card;
    }

    public async Task<IEnumerable<Card>> GetAllTarotCardsAsync(CancellationToken ct = default)
    {
        return await context.Cards
            .AsNoTracking()
            .Where(c => c.Deck.DeckType == "Tarot" && c.Deck.IsDeleted != true)
            .OrderBy(c => c.CardSuit)
            .ThenBy(c => c.CardPosition)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Card>> GetCardsByDeckIdAsync(Guid deckId, CancellationToken ct = default)
    {
        return await context.Cards
            .AsNoTracking()
            .Where(c => c.DeckId == deckId && c.Deck.IsDeleted != true)
            .OrderBy(c => c.CardSuit)
            .ThenBy(c => c.CardPosition)
            .ToListAsync(ct);
    }

    public async Task<bool> AllCardsExistAsync(IReadOnlyCollection<Guid> cardIds, CancellationToken ct = default)
    {
        if (cardIds.Count == 0) return false;

        var existingCount = await context.Cards
            .AsNoTracking()
            .CountAsync(c => cardIds.Contains(c.CardId), ct);

        return existingCount == cardIds.Count;
    }
}
