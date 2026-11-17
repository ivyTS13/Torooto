using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces;

public interface IDeckRepository
{
    Task<IEnumerable<Deck>> GetAllDecksAsync(CancellationToken ct = default);
    Task<Deck?> GetDeckByIdAsync(Guid deckId, CancellationToken ct = default);
    Task<Deck> CreateDeckAsync(Deck deck, CancellationToken ct = default);
    Task<Deck?> UpdateDeckAsync(Deck deck, CancellationToken ct = default);
    Task<Deck?> SoftDeleteDeckAsync(Guid deckId, CancellationToken ct = default);
    Task<Deck?> RestoreDeckAsync(Guid deckId, CancellationToken ct = default);
}
