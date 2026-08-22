

using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces
{
    public interface ICardRepository
    {
        Task<Card?> GetCardByIdAsync(Guid cardId);
        Task<Card> CreateCardAsync(Card card);
        Task<IEnumerable<Card>> CreateCardsBulkAsync(IEnumerable<Card> cards);
        Task<Card?> UpdateCardAsync(Card card);
        Task<Card?> SoftDeleteCardAsync(Guid cardId);
        Task<IEnumerable<Card>> GetAllTarotCardsAsync();
        Task<IEnumerable<Card>> GetCardsByDeckIdAsync(Guid deckId);
    }
}
