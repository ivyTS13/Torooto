namespace TorootoAPI.Application.DTOs.Decks;

public record DeckCreateDto(
    string DeckName,
    string DeckType,
    string DeckContent
);

public record DeckUpdateDto(
    string DeckName,
    string DeckContent
);

public record DeckResponseDto(
    Guid DeckId,
    string DeckName,
    string DeckType,
    string DeckContent,
    DateTime? CreatedAt,
    bool? IsDeleted,
    DateTime? DeletedAt
);

public record CardCreateDto(
    string CardName,
    string CardSuit,
    int CardPosition,
    Dictionary<string, object>? CardMetadata
);

public record CardUpdateDto(
    string CardName,
    string CardSuit,
    int? CardPosition,
    Dictionary<string, object>? CardMetadata,
    string? ImageUrl
);

public record CardResponseDto(
    Guid CardId,
    Guid DeckId,
    string CardName,
    string CardSuit,
    Dictionary<string, object>? CardMetadata,
    string? ImageUrl,
    bool? IsDeleted,
    DateTime? DeletedAt,
    int CardPosition
);
