using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces;

public interface ICardRepository
{
    Task<Card?> GetCardByIdAsync(Guid cardId, CancellationToken ct = default);
    Task<Card> CreateCardAsync(Card card, CancellationToken ct = default);
    Task<IEnumerable<Card>> CreateCardsBulkAsync(IEnumerable<Card> cards, CancellationToken ct = default);
    Task<Card?> UpdateCardAsync(Card card, CancellationToken ct = default);
    Task<Card?> SoftDeleteCardAsync(Guid cardId, CancellationToken ct = default);
    Task<IEnumerable<Card>> GetAllTarotCardsAsync(CancellationToken ct = default);
    Task<IEnumerable<Card>> GetCardsByDeckIdAsync(Guid deckId, CancellationToken ct = default);
    Task<bool> AllCardsExistAsync(IReadOnlyCollection<Guid> cardIds, CancellationToken ct = default);
}
