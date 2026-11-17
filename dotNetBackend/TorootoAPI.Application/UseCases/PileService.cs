using FluentValidation;
using MapsterMapper;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Common;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.UseCases;

public interface IPileService
{
    Task<Result<PagedResultDto<PileResponseDto>>> GetUserPilesPagedAsync(Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<Result<PileResponseDto>> DrawPileAsync(Guid userId, CreatePileRequestDto request, CancellationToken ct = default);
    Task<Result<PileDetailResponseDto>> GetPileByIdAsync(Guid pileId, Guid userId, CancellationToken ct = default);
    Task<Result<PileResponseDto>> SoftDeletePileAsync(Guid pileId, Guid userId, CancellationToken ct = default);
    Task<Result<SavePileResultDto>> SaveFrontendPileAsync(Guid userId, SavePileRequestDto request, CancellationToken ct = default);
}

internal sealed class PileService(
    IPileRepository pileRepository,
    ICardRepository cardRepository,
    ICacheService cacheService,
    IMapper mapper,
    IValidator<CreatePileRequestDto> createValidator,
    IValidator<SavePileRequestDto> saveValidator) : IPileService
{
    private const string TarotDeckCacheKey = "tarot_deck";
    private static readonly TimeSpan StaticMetadataCacheDuration = TimeSpan.FromHours(12);

    private static string UserPilesCacheKey(Guid userId, int page, int pageSize)
        => $"piles_user_{userId}_page_{page}_size_{pageSize}";

    private static string UserPilesPattern(Guid userId) => $"piles_user_{userId}_*";

    public async Task<Result<PagedResultDto<PileResponseDto>>> GetUserPilesPagedAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var safePage = Math.Max(1, page);
        var safePageSize = pageSize is < 1 or > 50 ? 5 : pageSize;

        var cacheKey = UserPilesCacheKey(userId, safePage, safePageSize);
        var cachedResponse = await cacheService.GetAsync<PagedResultDto<PileResponseDto>>(cacheKey, ct);
        if (cachedResponse is not null)
            return Result.Success(cachedResponse);

        var (piles, totalCount) = await pileRepository.GetUserPilesPagedAsync(userId, safePage, safePageSize, ct);
        var dtos = mapper.Map<List<PileResponseDto>>(piles);
        var totalPages = Math.Max(1, (int)Math.Ceiling(totalCount / (double)safePageSize));

        var pagedResult = new PagedResultDto<PileResponseDto>(dtos, totalCount, safePage, safePageSize, totalPages);
        await cacheService.SetAsync(cacheKey, pagedResult, absoluteExpireTime: TimeSpan.FromHours(2), ct: ct);

        return Result.Success(pagedResult);
    }

    public async Task<Result<PileResponseDto>> DrawPileAsync(
        Guid userId,
        CreatePileRequestDto request,
        CancellationToken ct = default)
    {
        var validationError = await createValidator.ValidateToErrorAsync(request, ct);
        if (validationError is not null)
            return Result.Failure<PileResponseDto>(validationError);

        var cachedCards = await cacheService.GetAsync<List<CardResponseDto>>(TarotDeckCacheKey, ct);
        if (cachedCards is null)
        {
            var rawCards = (await pileRepository.GetAvailableTarotCardsAsync(ct)).ToList();
            cachedCards = mapper.Map<List<CardResponseDto>>(rawCards);
            if (cachedCards.Count > 0)
            {
                await cacheService.SetAsync(
                    TarotDeckCacheKey,
                    cachedCards,
                    absoluteExpireTime: StaticMetadataCacheDuration,
                    ct: ct);
            }
        }

        if (cachedCards.Count < request.NumberOfCards)
            return Result.Failure<PileResponseDto>(
                DomainError.Validation($"Only {cachedCards.Count} cards available."));

        var shufflePool = new List<CardResponseDto>(cachedCards);

        // Unbiased Fisher-Yates shuffle using Random.Shared
        for (int i = shufflePool.Count - 1; i > 0; i--)
        {
            int j = Random.Shared.Next(i + 1);
            (shufflePool[i], shufflePool[j]) = (shufflePool[j], shufflePool[i]);
        }

        var drawnCards = shufflePool.Take(request.NumberOfCards).ToList();
        var drawSpec = drawnCards.Select((card, index) => (
            card.CardId,
            Position: index,
            ReversedCard: request.IsReversed && Random.Shared.Next(2) == 1
        ));

        var newPile = Pile.Create(userId, DateTime.UtcNow, drawSpec);
        await pileRepository.CreatePileAsync(newPile, ct);
        await cacheService.RemoveByPatternAsync(UserPilesPattern(userId), ct);

        var cardsById = drawnCards.ToDictionary(c => c.CardId);
        var contentDtos = newPile.PileContents
            .OrderBy(pc => pc.Position)
            .Select(pc =>
            {
                var card = cardsById[pc.CardId];
                return new PileContentResponseDto(
                    card.CardId,
                    pc.PileContentId,
                    card.CardName,
                    card.CardSuit,
                    card.ImageUrl,
                    pc.ReversedCard,
                    pc.Position,
                    card.CardMetadata);
            })
            .ToList();

        var responseDto = new PileResponseDto(
            newPile.PileId,
            newPile.UserId,
            newPile.DrawnAt ?? DateTime.UtcNow,
            newPile.IsDeleted ?? false,
            contentDtos);

        return Result.Success(responseDto);
    }

    public async Task<Result<PileDetailResponseDto>> GetPileByIdAsync(
        Guid pileId,
        Guid userId,
        CancellationToken ct = default)
    {
        var pile = await pileRepository.GetPileByIdAsync(pileId, userId, ct);
        if (pile is null)
            return Result.Failure<PileDetailResponseDto>(DomainError.NotFound("Pile not found."));

        return Result.Success(mapper.Map<PileDetailResponseDto>(pile));
    }

    public async Task<Result<PileResponseDto>> SoftDeletePileAsync(
        Guid pileId,
        Guid userId,
        CancellationToken ct = default)
    {
        var pile = await pileRepository.SoftDeletePileAsync(pileId, userId, ct);
        if (pile is null)
            return Result.Failure<PileResponseDto>(DomainError.NotFound("Pile not found."));

        await cacheService.RemoveByPatternAsync(UserPilesPattern(userId), ct);
        return Result.Success(mapper.Map<PileResponseDto>(pile));
    }

    public async Task<Result<SavePileResultDto>> SaveFrontendPileAsync(
        Guid userId,
        SavePileRequestDto request,
        CancellationToken ct = default)
    {
        var validationError = await saveValidator.ValidateToErrorAsync(request, ct);
        if (validationError is not null)
            return Result.Failure<SavePileResultDto>(validationError);

        var requestedIds = request.Cards.Select(c => c.CardId).Distinct().ToList();
        var allExist = await cardRepository.AllCardsExistAsync(requestedIds, ct);
        if (!allExist)
            return Result.Failure<SavePileResultDto>(DomainError.Validation("One or more referenced cards do not exist."));

        var newPile = Pile.Create(
            userId,
            DateTime.UtcNow,
            request.Cards.Select(c => (c.CardId, c.Position, c.ReversedCard)));

        await pileRepository.CreatePileAsync(newPile, ct);
        await cacheService.RemoveByPatternAsync(UserPilesPattern(userId), ct);

        return Result.Success(new SavePileResultDto(newPile.PileId));
    }
}
