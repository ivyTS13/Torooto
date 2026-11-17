using FluentValidation;
using MapsterMapper;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Common;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.UseCases;

public interface IDeckService
{
    Task<Result<IReadOnlyList<DeckResponseDto>>> GetAllDecksAsync(CancellationToken ct = default);
    Task<Result<DeckResponseDto>> CreateDeckAsync(DeckCreateDto dto, CancellationToken ct = default);
    Task<Result<DeckResponseDto>> UpdateDeckAsync(Guid deckId, DeckUpdateDto dto, CancellationToken ct = default);
    Task<Result<DeckResponseDto>> SoftDeleteDeckAsync(Guid deckId, CancellationToken ct = default);
    Task<Result<DeckResponseDto>> RestoreDeckAsync(Guid deckId, CancellationToken ct = default);
    Task<Result<IReadOnlyList<CardResponseDto>>> UploadCardsFromCsvAsync(Guid deckId, Stream csvStream, CancellationToken ct = default);
}

internal sealed class DeckService(
    IDeckRepository deckRepository,
    ICardRepository cardRepository,
    ICsvCardParser csvCardParser,
    ICacheService cacheService,
    IMapper mapper,
    IValidator<DeckCreateDto> createValidator,
    IValidator<DeckUpdateDto> updateValidator) : IDeckService
{
    private const string AllDecksCacheKey = "all_decks";
    private const string TarotDeckCacheKey = "tarot_deck";
    private static readonly TimeSpan StaticMetadataCacheDuration = TimeSpan.FromHours(12);
    private static string DeckCardsCacheKey(Guid deckId) => $"deck_{deckId}";

    public async Task<Result<IReadOnlyList<DeckResponseDto>>> GetAllDecksAsync(CancellationToken ct = default)
    {
        var cached = await cacheService.GetAsync<List<DeckResponseDto>>(AllDecksCacheKey, ct);
        if (cached is not null)
            return Result.Success<IReadOnlyList<DeckResponseDto>>(cached);

        var decks = await deckRepository.GetAllDecksAsync(ct);
        var dtos = mapper.Map<List<DeckResponseDto>>(decks);
        await cacheService.SetAsync(AllDecksCacheKey, dtos, absoluteExpireTime: StaticMetadataCacheDuration, ct: ct);

        return Result.Success<IReadOnlyList<DeckResponseDto>>(dtos);
    }

    public async Task<Result<DeckResponseDto>> CreateDeckAsync(DeckCreateDto dto, CancellationToken ct = default)
    {
        var validationError = await createValidator.ValidateToErrorAsync(dto, ct);
        if (validationError is not null)
            return Result.Failure<DeckResponseDto>(validationError);

        var newDeck = Deck.Create(dto.DeckName, dto.DeckType, dto.DeckContent, DateTime.UtcNow);
        var createdDeck = await deckRepository.CreateDeckAsync(newDeck, ct);

        await cacheService.RemoveAsync(AllDecksCacheKey, ct);
        return Result.Success(mapper.Map<DeckResponseDto>(createdDeck));
    }

    public async Task<Result<DeckResponseDto>> UpdateDeckAsync(Guid deckId, DeckUpdateDto dto, CancellationToken ct = default)
    {
        var validationError = await updateValidator.ValidateToErrorAsync(dto, ct);
        if (validationError is not null)
            return Result.Failure<DeckResponseDto>(validationError);

        var existingDeck = await deckRepository.GetDeckByIdAsync(deckId, ct);
        if (existingDeck is null)
            return Result.Failure<DeckResponseDto>(DomainError.NotFound("Deck not found."));

        existingDeck.Update(dto.DeckName, dto.DeckContent);
        var updatedDeck = await deckRepository.UpdateDeckAsync(existingDeck, ct);

        await InvalidateDeckCachesAsync(deckId, ct);
        return Result.Success(mapper.Map<DeckResponseDto>(updatedDeck ?? existingDeck));
    }

    public async Task<Result<DeckResponseDto>> SoftDeleteDeckAsync(Guid deckId, CancellationToken ct = default)
    {
        var deck = await deckRepository.SoftDeleteDeckAsync(deckId, ct);
        if (deck is null)
            return Result.Failure<DeckResponseDto>(DomainError.NotFound("Deck not found."));

        await InvalidateDeckCachesAsync(deckId, ct);
        return Result.Success(mapper.Map<DeckResponseDto>(deck));
    }

    public async Task<Result<DeckResponseDto>> RestoreDeckAsync(Guid deckId, CancellationToken ct = default)
    {
        var restoredDeck = await deckRepository.RestoreDeckAsync(deckId, ct);
        if (restoredDeck is null)
            return Result.Failure<DeckResponseDto>(DomainError.NotFound($"Deck with ID {deckId} not found."));

        await InvalidateDeckCachesAsync(deckId, ct);
        return Result.Success(mapper.Map<DeckResponseDto>(restoredDeck));
    }

    public async Task<Result<IReadOnlyList<CardResponseDto>>> UploadCardsFromCsvAsync(
        Guid deckId,
        Stream csvStream,
        CancellationToken ct = default)
    {
        var deck = await deckRepository.GetDeckByIdAsync(deckId, ct);
        if (deck is null)
            return Result.Failure<IReadOnlyList<CardResponseDto>>(DomainError.NotFound("Deck not found."));

        var parseResult = await csvCardParser.ParseAsync(csvStream, ct);
        if (!string.IsNullOrEmpty(parseResult.FatalError))
            return Result.Failure<IReadOnlyList<CardResponseDto>>(DomainError.Validation(parseResult.FatalError));

        if (parseResult.Errors.Count > 0)
            return Result.Failure<IReadOnlyList<CardResponseDto>>(
                DomainError.Validation($"CSV validation errors: {string.Join(" | ", parseResult.Errors)}"));

        if (parseResult.Rows.Count == 0)
            return Result.Success<IReadOnlyList<CardResponseDto>>([]);

        var newCards = parseResult.Rows
            .Select(row => Card.Create(deckId, row.CardName, row.CardSuit, row.CardPosition, row.Metadata, row.ImageUrl))
            .ToList();

        var insertedCards = await cardRepository.CreateCardsBulkAsync(newCards, ct);
        await InvalidateDeckCachesAsync(deckId, ct);

        return Result.Success<IReadOnlyList<CardResponseDto>>(mapper.Map<List<CardResponseDto>>(insertedCards));
    }

    private async Task InvalidateDeckCachesAsync(Guid deckId, CancellationToken ct)
    {
        await cacheService.RemoveAsync(AllDecksCacheKey, ct);
        await cacheService.RemoveAsync(TarotDeckCacheKey, ct);
        await cacheService.RemoveAsync(DeckCardsCacheKey(deckId), ct);
    }
}
