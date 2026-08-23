

using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces
{
    public interface IDeckRepository
    {
        Task<IEnumerable<Deck>> GetAllDecksAsync();
        Task<Deck?> GetDeckByIdAsync(Guid deckId);
        Task<Deck> CreateDeckAsync(Deck deck);
        Task<Deck?> UpdateDeckAsync(Deck deck);
        Task<Deck?> SoftDeleteDeckAsync(Guid deckId);
        Task<Deck?> RestoreDeckAsync(Guid deckId);
    }
}
