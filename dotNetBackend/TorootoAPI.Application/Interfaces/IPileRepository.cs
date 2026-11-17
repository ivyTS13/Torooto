using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces;

public interface IPileRepository
{
    Task<IEnumerable<Pile>> GetUserPilesAsync(Guid userId, CancellationToken ct = default);
    Task<(IEnumerable<Pile> Piles, int TotalCount)> GetUserPilesPagedAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<Pile?> GetPileByIdAsync(Guid pileId, Guid userId, CancellationToken ct = default);
    Task<Pile> CreatePileAsync(Pile pile, CancellationToken ct = default);
    Task<Pile?> SoftDeletePileAsync(Guid pileId, Guid userId, CancellationToken ct = default);
    Task<IEnumerable<Card>> GetAvailableTarotCardsAsync(CancellationToken ct = default);
}
