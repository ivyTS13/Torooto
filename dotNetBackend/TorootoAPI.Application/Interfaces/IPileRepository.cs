

using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces
{
    public interface IPileRepository
    {
        Task<IEnumerable<Pile>> GetUserPilesAsync(Guid userId);
        Task<(IEnumerable<Pile> Piles, int TotalCount)> GetUserPilesPagedAsync(Guid userId, int page, int pageSize);
        Task<Pile?> GetPileByIdAsync(Guid pileId, Guid userId);
        Task<Pile> CreatePileAsync(Pile pile);
        Task<Pile?> SoftDeletePileAsync(Guid pileId);
        Task<IEnumerable<Card>> GetAvailableTarotCardsAsync();
    }
}
