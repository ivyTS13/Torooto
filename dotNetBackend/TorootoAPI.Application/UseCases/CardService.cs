using FluentValidation;
using MapsterMapper;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Common;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.UseCases;

public interface ICardService
{
    Task<Result<IReadOnlyList<CardResponseDto>>> GetAllTarotCardsAsync(CancellationToken ct = default);
    Task<Result<IReadOnlyList<CardResponseDto>>> GetCardsByDeckIdAsync(Guid deckId, CancellationToken ct = default);
    Task<Result<CardResponseDto>> AddCardAsync(Guid deckId, CardCreateDto dto, CancellationToken ct = default);
    Task<Result<CardResponseDto>> UpdateCardAsync(Guid cardId, CardUpdateDto dto, CancellationToken ct = default);
    Task<Result<CardResponseDto>> SoftDeleteCardAsync(Guid cardId, CancellationToken ct = default);
    Task<Result<CardResponseDto>> UpdateCardImageAsync(Guid cardId, ImageUploadRequest uploadRequest, CancellationToken ct = default);
}

internal sealed class CardService(
    ICardRepository cardRepository,
    IDeckRepository deckRepository,
    IImageStorageService imageStorageService,
    ICacheService cacheService,
    IMapper mapper,
    IValidator<CardCreateDto> createValidator,
    IValidator<CardUpdateDto> updateValidator) : ICardService
{
    private const string TarotDeckCacheKey = "tarot_deck";
    private static readonly TimeSpan StaticMetadataCacheDuration = TimeSpan.FromHours(12);
    private static string DeckCardsCacheKey(Guid deckId) => $"deck_{deckId}";

    public async Task<Result<IReadOnlyList<CardResponseDto>>> GetAllTarotCardsAsync(CancellationToken ct = default)
    {
        var cached = await cacheService.GetAsync<List<CardResponseDto>>(TarotDeckCacheKey, ct);
        if (cached is not null)
            return Result.Success<IReadOnlyList<CardResponseDto>>(cached);

        var cards = (await cardRepository.GetAllTarotCardsAsync(ct)).ToList();
        if (cards.Count == 0)
            return Result.Failure<IReadOnlyList<CardResponseDto>>(DomainError.NotFound("Tarot deck not found."));

        var dtos = mapper.Map<List<CardResponseDto>>(cards);
        await cacheService.SetAsync(TarotDeckCacheKey, dtos, absoluteExpireTime: StaticMetadataCacheDuration, ct: ct);

        return Result.Success<IReadOnlyList<CardResponseDto>>(dtos);
    }

    public async Task<Result<IReadOnlyList<CardResponseDto>>> GetCardsByDeckIdAsync(Guid deckId, CancellationToken ct = default)
    {
        var cacheKey = DeckCardsCacheKey(deckId);
        var cached = await cacheService.GetAsync<List<CardResponseDto>>(cacheKey, ct);
        if (cached is not null)
            return Result.Success<IReadOnlyList<CardResponseDto>>(cached);

        var cards = await cardRepository.GetCardsByDeckIdAsync(deckId, ct);
        var dtos = mapper.Map<List<CardResponseDto>>(cards);
        await cacheService.SetAsync(cacheKey, dtos, absoluteExpireTime: StaticMetadataCacheDuration, ct: ct);

        return Result.Success<IReadOnlyList<CardResponseDto>>(dtos);
    }

    public async Task<Result<CardResponseDto>> AddCardAsync(Guid deckId, CardCreateDto dto, CancellationToken ct = default)
    {
        if (deckId == Guid.Empty)
            return Result.Failure<CardResponseDto>(DomainError.Validation("DeckId is required."));

        var validationError = await createValidator.ValidateToErrorAsync(dto, ct);
        if (validationError is not null)
            return Result.Failure<CardResponseDto>(validationError);

        var deck = await deckRepository.GetDeckByIdAsync(deckId, ct);
        if (deck is null)
            return Result.Failure<CardResponseDto>(DomainError.NotFound("Deck not found."));

        var newCard = Card.Create(deckId, dto.CardName, dto.CardSuit, dto.CardPosition, dto.CardMetadata);
        var createdCard = await cardRepository.CreateCardAsync(newCard, ct);

        await InvalidateCardCachesAsync(deckId, ct);
        return Result.Success(mapper.Map<CardResponseDto>(createdCard));
    }

    public async Task<Result<CardResponseDto>> UpdateCardAsync(Guid cardId, CardUpdateDto dto, CancellationToken ct = default)
    {
        var validationError = await updateValidator.ValidateToErrorAsync(dto, ct);
        if (validationError is not null)
            return Result.Failure<CardResponseDto>(validationError);

        var card = await cardRepository.GetCardByIdAsync(cardId, ct);
        if (card is null)
            return Result.Failure<CardResponseDto>(DomainError.NotFound("Card not found."));

        card.UpdateDetails(dto.CardName, dto.CardSuit, dto.CardPosition, dto.CardMetadata, dto.ImageUrl);
        var updatedCard = await cardRepository.UpdateCardAsync(card, ct);

        await InvalidateCardCachesAsync(card.DeckId, ct);
        return Result.Success(mapper.Map<CardResponseDto>(updatedCard ?? card));
    }

    public async Task<Result<CardResponseDto>> SoftDeleteCardAsync(Guid cardId, CancellationToken ct = default)
    {
        var card = await cardRepository.SoftDeleteCardAsync(cardId, ct);
        if (card is null)
            return Result.Failure<CardResponseDto>(DomainError.NotFound("Card not found."));

        await InvalidateCardCachesAsync(card.DeckId, ct);
        return Result.Success(mapper.Map<CardResponseDto>(card));
    }

    public async Task<Result<CardResponseDto>> UpdateCardImageAsync(
        Guid cardId,
        ImageUploadRequest uploadRequest,
        CancellationToken ct = default)
    {
        var card = await cardRepository.GetCardByIdAsync(cardId, ct);
        if (card is null)
            return Result.Failure<CardResponseDto>(DomainError.NotFound("Card not found."));

        var taggedRequest = uploadRequest with
        {
            Tags = uploadRequest.Tags ?? ["back-end-upload", $"deck_{card.DeckId}"]
        };

        var imageUrl = await imageStorageService.UploadImageAsync(taggedRequest, ct);
        card.UpdateImage(imageUrl);
        var updatedCard = await cardRepository.UpdateCardAsync(card, ct);

        await InvalidateCardCachesAsync(card.DeckId, ct);
        return Result.Success(mapper.Map<CardResponseDto>(updatedCard ?? card));
    }

    private async Task InvalidateCardCachesAsync(Guid deckId, CancellationToken ct)
    {
        await cacheService.RemoveAsync(TarotDeckCacheKey, ct);
        await cacheService.RemoveAsync(DeckCardsCacheKey(deckId), ct);
    }
}
