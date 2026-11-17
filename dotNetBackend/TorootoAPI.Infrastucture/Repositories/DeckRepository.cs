using Microsoft.EntityFrameworkCore;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.Infrastucture.Repositories;

public sealed class DeckRepository(TorootoDBContext context) : IDeckRepository
{
    public async Task<IEnumerable<Deck>> GetAllDecksAsync(CancellationToken ct = default)
    {
        return await context.Decks
            .AsNoTracking()
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Deck?> GetDeckByIdAsync(Guid deckId, CancellationToken ct = default)
    {
        return await context.Decks
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DeckId == deckId, ct);
    }

    public async Task<Deck> CreateDeckAsync(Deck deck, CancellationToken ct = default)
    {
        await context.Decks.AddAsync(deck, ct);
        await context.SaveChangesAsync(ct);
        return deck;
    }

    public async Task<Deck?> UpdateDeckAsync(Deck deck, CancellationToken ct = default)
    {
        context.Decks.Update(deck);
        await context.SaveChangesAsync(ct);
        return deck;
    }

    public async Task<Deck?> SoftDeleteDeckAsync(Guid deckId, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        if (!context.Database.IsRelational())
        {
            var inMemDeck = await context.Decks.FirstOrDefaultAsync(d => d.DeckId == deckId, ct);
            if (inMemDeck is null) return null;

            inMemDeck.SoftDelete(now);
            var cards = await context.Cards.Where(c => c.DeckId == deckId).ToListAsync(ct);
            foreach (var card in cards) card.SoftDelete(now);

            await context.SaveChangesAsync(ct);
            return inMemDeck;
        }

        var strategy = context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await context.Database.BeginTransactionAsync(ct);
            try
            {
                var deck = await context.Decks
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DeckId == deckId, ct);
                if (deck is null) return null;

                await context.Decks
                    .Where(d => d.DeckId == deckId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(d => d.IsDeleted, true)
                        .SetProperty(d => d.DeletedAt, now), ct);

                await context.Cards
                    .Where(c => c.DeckId == deckId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(c => c.IsDeleted, true)
                        .SetProperty(c => c.DeletedAt, now), ct);

                await transaction.CommitAsync(ct);

                deck.SoftDelete(now);
                return deck;
            }
            catch
            {
                await transaction.RollbackAsync(ct);
                throw;
            }
        });
    }

    public async Task<Deck?> RestoreDeckAsync(Guid deckId, CancellationToken ct = default)
    {
        if (!context.Database.IsRelational())
        {
            var inMemDeck = await context.Decks
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(d => d.DeckId == deckId, ct);
            if (inMemDeck is null) return null;

            inMemDeck.Restore();
            var cards = await context.Cards
                .IgnoreQueryFilters()
                .Where(c => c.DeckId == deckId)
                .ToListAsync(ct);
            foreach (var card in cards) card.Restore();

            await context.SaveChangesAsync(ct);
            return inMemDeck;
        }

        var strategy = context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await context.Database.BeginTransactionAsync(ct);
            try
            {
                var deck = await context.Decks
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DeckId == deckId, ct);
                if (deck is null) return null;

                await context.Decks
                    .IgnoreQueryFilters()
                    .Where(d => d.DeckId == deckId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(d => d.IsDeleted, false)
                        .SetProperty(d => d.DeletedAt, (DateTime?)null), ct);

                await context.Cards
                    .IgnoreQueryFilters()
                    .Where(c => c.DeckId == deckId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(c => c.IsDeleted, false)
                        .SetProperty(c => c.DeletedAt, (DateTime?)null), ct);

                await transaction.CommitAsync(ct);

                deck.Restore();
                return deck;
            }
            catch
            {
                await transaction.RollbackAsync(ct);
                throw;
            }
        });
    }
}
