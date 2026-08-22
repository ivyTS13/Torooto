using MapsterMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;

namespace TorootoASP.Controllers
{
    [Authorize]
    [EnableRateLimiting("StandardLimit")]
    [ApiController]
    [Route("piles")]
    public class PilesController : ControllerBase
    {
        private readonly IPileRepository _pileRepo;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;

        public PilesController(IPileRepository pileRepo, IMapper mapper, ICacheService cacheService)
        {
            _pileRepo = pileRepo;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        // Helper to get User ID from JWT Token
        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("list")]
        public async Task<IActionResult> GetPiles([FromQuery] int page = 1, [FromQuery] int pageSize = 5)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 50) pageSize = 5;

                var userId = GetUserId();
                var cacheKey = $"piles_user_{userId}_page_{page}_size_{pageSize}";

                var cachedResponse = await _cacheService.GetAsync<PagedResultDto<PileResponseDto>>(cacheKey);
                if (cachedResponse != null)
                {
                    return Ok(new ApiResponse<PagedResultDto<PileResponseDto>>(true, cachedResponse, "Piles retrieved successfully from cache"));
                }

                var (piles, totalCount) = await _pileRepo.GetUserPilesPagedAsync(userId, page, pageSize);
                var dtos = _mapper.Map<List<PileResponseDto>>(piles);

                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                // Instantiated properly using positional arguments
                var pagedResult = new PagedResultDto<PileResponseDto>(
                    dtos,
                    totalCount,
                    page,
                    pageSize,
                    totalPages == 0 ? 1 : totalPages
                );

                await _cacheService.SetAsync(cacheKey, pagedResult, absoluteExpireTime: TimeSpan.FromHours(2));

                return Ok(new ApiResponse<PagedResultDto<PileResponseDto>>(true, pagedResult, "Piles retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }
        [HttpPost("add")]
        public async Task<IActionResult> AddNewPile([FromBody] CreatePileRequestDto request)
        {
            if (request.NumberOfCards < 1 || request.NumberOfCards > 78)
                return BadRequest(new ApiResponse<object>(false, null, "Number of cards must be between 1 and 78"));

            var allCards = (await _pileRepo.GetAvailableTarotCardsAsync()).ToList();

            if (allCards.Count < request.NumberOfCards)
                return BadRequest(new ApiResponse<object>(false, null, $"Only {allCards.Count} cards available"));

            // Shuffle logic (System.Random)
            var rnd = new Random();
            var drawnCards = allCards.OrderBy(x => rnd.Next()).Take(request.NumberOfCards).ToList();

            var newPile = new Pile
            {
                UserId = GetUserId(),
                DrawnAt = DateTime.UtcNow,
                PileContents = drawnCards.Select((card, index) => new PileContent
                {
                    CardId = card.CardId,
                    Position = index,
                    ReversedCard = request.IsReversed && rnd.Next(2) == 1
                }).ToList()
            };

            await _pileRepo.CreatePileAsync(newPile);
            var responseDto = _mapper.Map<PileResponseDto>(newPile);

            return Ok(new ApiResponse<PileResponseDto>(true, responseDto, $"Successfully drew {request.NumberOfCards} cards"));
        }

        [HttpGet("{pile_id:guid}")]
        public async Task<IActionResult> GetPile(Guid pile_id)
        {
            var pile = await _pileRepo.GetPileByIdAsync(pile_id, GetUserId());
            if (pile == null)
                return NotFound(new ApiResponse<object>(false, null, "Pile not found"));

            var dto = _mapper.Map<PileDetailResponseDto>(pile);
            return Ok(new ApiResponse<PileDetailResponseDto>(true, dto, "Pile details retrieved successfully"));
        }

        [HttpDelete("{pile_id:guid}")]
        [Authorize] 
        public async Task<IActionResult> DeletePile(Guid pile_id)
        {
            var userId = GetUserId();
            var pile = await _pileRepo.SoftDeletePileAsync(pile_id);
            if (pile == null)
                return NotFound(new ApiResponse<object>(false, null, "Pile not found"));

            // Python code returned the entity, Mapster formats it safely
            var dto = _mapper.Map<PileResponseDto>(pile);
             await _cacheService.RemoveByPatternAsync($"piles_user_{userId}_*");
            return Ok(new ApiResponse<PileResponseDto>(true, dto, "Pile moved to trash"));
        }

        [HttpPost("save-fe-pile")]
        public async Task<IActionResult> SaveFrontendPile([FromBody] SavePileRequestDto request)
        {
            var tem = Guid.NewGuid();
            var userId = GetUserId();
            var newPile = new Pile
            {
                PileId = tem,
                UserId = userId,
                DrawnAt = DateTime.UtcNow,
                IsDeleted = false,
                PileContents = request.Cards.Select(c => new PileContent
                {
                    PileId = tem,
                   PileContentId= Guid.NewGuid(),
                    CardId = c.CardId,
                    Position = c.Position,
                    ReversedCard = c.ReversedCard,
                    IsDeleted= false,
                }).ToList()
            };

            await _pileRepo.CreatePileAsync(newPile);
            // 3. CACHE INVALIDATION: Delete the stale cache for THIS specific user
            await _cacheService.RemoveByPatternAsync($"piles_user_{userId}_*");
            return Ok(new ApiResponse<object>(true, new { pile_id = newPile.PileId }, "Pile saved successfully!"));
        }
    }
}