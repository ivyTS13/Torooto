using Microsoft.EntityFrameworkCore;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.Infrastucture.Repositories;

public sealed class PileRepository(TorootoDBContext context) : IPileRepository
{
    public async Task<IEnumerable<Pile>> GetUserPilesAsync(Guid userId, CancellationToken ct = default)
    {
        return await context.Piles
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .Include(p => p.PileContents.Where(pc => pc.IsDeleted != true))
                .ThenInclude(pc => pc.Card)
            .AsSplitQuery()
            .OrderByDescending(p => p.DrawnAt)
            .ToListAsync(ct);
    }

    public async Task<(IEnumerable<Pile> Piles, int TotalCount)> GetUserPilesPagedAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = context.Piles
            .AsNoTracking()
            .Where(p => p.UserId == userId);

        var totalCount = await query.CountAsync(ct);

        var piles = await query
            .Include(p => p.PileContents.Where(pc => pc.IsDeleted != true))
                .ThenInclude(pc => pc.Card)
            .AsSplitQuery()
            .OrderByDescending(p => p.DrawnAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (piles, totalCount);
    }

    public async Task<Pile?> GetPileByIdAsync(Guid pileId, Guid userId, CancellationToken ct = default)
    {
        return await context.Piles
            .AsNoTracking()
            .Where(p => p.PileId == pileId && p.UserId == userId)
            .Include(p => p.PileContents.Where(pc => pc.IsDeleted != true))
                .ThenInclude(pc => pc.Card)
            .AsSplitQuery()
            .FirstOrDefaultAsync(ct);
    }

    public async Task<Pile> CreatePileAsync(Pile pile, CancellationToken ct = default)
    {
        context.Piles.Add(pile);
        await context.SaveChangesAsync(ct);
        return pile;
    }

    public async Task<Pile?> SoftDeletePileAsync(Guid pileId, Guid userId, CancellationToken ct = default)
    {
        var pile = await context.Piles
            .FirstOrDefaultAsync(p => p.PileId == pileId && p.UserId == userId, ct);
        if (pile is null) return null;

        pile.SoftDelete(DateTime.UtcNow);
        await context.SaveChangesAsync(ct);
        return pile;
    }

    public async Task<IEnumerable<Card>> GetAvailableTarotCardsAsync(CancellationToken ct = default)
    {
        return await context.Cards
            .AsNoTracking()
            .Where(c => c.Deck.DeckType == "Tarot" && c.Deck.IsDeleted != true)
            .ToListAsync(ct);
    }
}
