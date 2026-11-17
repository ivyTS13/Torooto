namespace TorootoAPI.Application.DTOs.Piles;

public record ApiResponse<T>(bool Success, T? Data, string Message);

public record CreatePileRequestDto(int NumberOfCards, bool IsReversed);

public record SavePileRequestDto(List<FeCardRequestDto> Cards);

public record FeCardRequestDto(Guid CardId, bool ReversedCard, int Position);

public record SavePileResultDto(Guid PileId);

public record PileResponseDto(
    Guid PileId,
    Guid UserId,
    DateTime DrawnAt,
    bool IsDeleted,
    List<PileContentResponseDto> PileContents
);

public record PileDetailResponseDto(
    Guid PileId,
    Guid UserId,
    DateTime DrawnAt,
    bool IsDeleted,
    List<PileContentResponseDto> Cards
);

public record PileContentResponseDto(
    Guid CardId,
    Guid PileContentId,
    string CardName,
    string CardSuit,
    string? ImageUrl,
    bool ReversedCard,
    int Position,
    Dictionary<string, object>? CardMetadata
);

public record PagedResultDto<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
