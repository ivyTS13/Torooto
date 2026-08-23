using Microsoft.EntityFrameworkCore;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.Infrastucture.Repositories
{
    public class PileRepository : IPileRepository
    {
        private readonly TorootoDBContext _context;

        public PileRepository(TorootoDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Pile>> GetUserPilesAsync(Guid userId)
        {
            return await _context.Piles
                .Where(p => p.UserId == userId && p.IsDeleted == false)
                .Include(p => p.PileContents)
                    .ThenInclude(pc => pc.Card)
                .OrderByDescending(p => p.DrawnAt)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Pile> Piles, int TotalCount)> GetUserPilesPagedAsync(Guid userId, int page, int pageSize)
        {
            var query = _context.Piles
                .Where(p => p.UserId == userId && p.IsDeleted == false);

            var totalCount = await query.CountAsync();

            var piles = await query
                .Include(p => p.PileContents)
                    .ThenInclude(pc => pc.Card)
                .OrderByDescending(p => p.DrawnAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (piles, totalCount);
        }

   public async Task<Pile?> GetPileByIdAsync(Guid pileId, Guid userId)
{
    var pile = await _context.Piles
        .Where(p => p.PileId == pileId && p.UserId == userId && p.IsDeleted == false)
        .Include(p => p.PileContents)
            .ThenInclude(pc => pc.Card)
        .FirstOrDefaultAsync();

    if (pile != null)
    {
        pile.PileContents = pile.PileContents
            .Where(pc => pc.IsDeleted == false)
            .OrderBy(pc => pc.Position)
            .ToList();
    }

    return pile;
}

        public async Task<Pile> CreatePileAsync(Pile pile)
        {
            _context.Piles.Add(pile);
            await _context.SaveChangesAsync();
            return pile;
        }

        public async Task<Pile?> SoftDeletePileAsync(Guid pileId)
        {
            var pile = await _context.Piles.FirstOrDefaultAsync(p => p.PileId == pileId);
            if (pile == null) return null;

            pile.IsDeleted = true;
            pile.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return pile;
        }

        public async Task<IEnumerable<Card>> GetAvailableTarotCardsAsync()
        {
            return await _context.Cards
                .Include(c => c.Deck)
                .Where(c => c.Deck!.DeckType == "Tarot" && c.Deck.IsDeleted == false && c.IsDeleted == false)
                .ToListAsync();
        }
    }
}