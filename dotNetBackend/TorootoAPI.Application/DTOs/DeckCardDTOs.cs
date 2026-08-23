

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

public record CardCreateDto(
    string CardName,
    string CardSuit,
    int CardPosition,
    Dictionary<string, object>? CardMetadata
);

public record CardUpdateDto(
    string CardName,
    string CardSuit,
    Dictionary<string, object>? CardMetadata,
    string? ImageUrl
);

public record CardCsvRowDto(
    string NameAndNumber,
    string Suit,
    string? ImageUrl,
    Dictionary<string, object>? Metadata
);

public record ImageUpdateDto(
    string ImageUrl
);