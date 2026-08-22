
using Microsoft.EntityFrameworkCore;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.Infrastucture.Repositories
{
    public class CardRepository : ICardRepository
    {
        private readonly TorootoDBContext _context;

        public CardRepository(TorootoDBContext context)
        {
            _context = context;
        }

        public async Task<Card?> GetCardByIdAsync(Guid cardId)
        {
            return await _context.Cards.FirstOrDefaultAsync(c => c.CardId == cardId && c.IsDeleted ==false);
        }

        public async Task<Card> CreateCardAsync(Card card)
        {
            card.CardId =  Guid.NewGuid();
            _context.Cards.Add(card);
            await _context.SaveChangesAsync();
            return card;
        }

        public async Task<IEnumerable<Card>> CreateCardsBulkAsync(IEnumerable<Card> cards)
        {
            await _context.Cards.AddRangeAsync(cards);
            await _context.SaveChangesAsync();
            return cards;
        }

        public async Task<Card?> UpdateCardAsync(Card card)
        {
            _context.Cards.Update(card);
            await _context.SaveChangesAsync();
            return card;
        }

        public async Task<Card?> SoftDeleteCardAsync(Guid cardId)
        {
            var card = await _context.Cards.FirstOrDefaultAsync(c => c.CardId == cardId);
            if (card == null) return null;

            card.IsDeleted = true;
            card.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return card;
        }

        public async Task<IEnumerable<Card>> GetAllTarotCardsAsync()
        {
           
            var tarotDeck = await _context.Decks
                .FirstOrDefaultAsync(d => d.DeckType == "Tarot" && d.IsDeleted==false);

            if (tarotDeck == null) return Enumerable.Empty<Card>();

            return await _context.Cards
                .Where(c => c.DeckId == tarotDeck.DeckId && c.IsDeleted !=true)
                .ToListAsync();
        }

        public async Task<IEnumerable<Card>> GetCardsByDeckIdAsync(Guid deckId)
        {
            
            var tarotDeck = await _context.Decks
                .FirstOrDefaultAsync(d => d.DeckId == deckId && d.IsDeleted == false);

            if (tarotDeck == null) return Enumerable.Empty<Card>();

            return await _context.Cards
                .Where(c => c.DeckId == tarotDeck.DeckId && c.IsDeleted != true)
                .ToListAsync();
        }
    }
}