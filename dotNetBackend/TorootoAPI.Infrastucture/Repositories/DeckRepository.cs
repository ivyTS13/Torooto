
using Microsoft.EntityFrameworkCore;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.Infrastucture.Repositories
{
    public class DeckRepository : IDeckRepository
    {
        private readonly TorootoDBContext _context;

        public DeckRepository(TorootoDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Deck>> GetAllDecksAsync()
        {
            return await _context.Decks
                .Where(d => d.IsDeleted == false)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<Deck?> GetDeckByIdAsync(Guid deckId)
        {
            return await _context.Decks
                .FirstOrDefaultAsync(d => d.DeckId == deckId && d.IsDeleted == false);
        }

        public async Task<Deck> CreateDeckAsync(Deck deck)
        {
            deck.DeckId = Guid.NewGuid();
            deck.CreatedAt = DateTime.UtcNow;
            deck.IsDeleted = false;

            await _context.Decks.AddAsync(deck);
            await _context.SaveChangesAsync();
            return deck;
        }

        public async Task<Deck?> UpdateDeckAsync(Deck deck)
        {
            _context.Decks.Update(deck);
            await _context.SaveChangesAsync();
            return deck;
        }

       public async Task<Deck?> SoftDeleteDeckAsync(Guid deckId)
{
    var deck = await _context.Decks.FindAsync(deckId);
    if (deck == null) return null;

    var now = DateTime.UtcNow;
    deck.IsDeleted = true;
    deck.DeletedAt = now;

    // Cascade soft delete to associated cards
    var cards = await _context.Cards
        .Where(c => c.DeckId == deckId)
        .ToListAsync();

    foreach (var card in cards)
    {
        card.IsDeleted = true;
        card.DeletedAt = now;
    }

    // All changes are saved in a single implicit transaction
    await _context.SaveChangesAsync();

    return deck;
}
        public async Task<Deck?> RestoreDeckAsync(Guid deckId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var deck = await _context.Decks.FindAsync(deckId);
                if (deck == null) return null;

                deck.IsDeleted = false;
                deck.DeletedAt = null;

                // Cascade restore to associated cards
                var cards = await _context.Cards.Where(c => c.DeckId == deckId).ToListAsync();
                foreach (var card in cards)
                {
                    card.IsDeleted = false;
                    card.DeletedAt = null;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return deck;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}