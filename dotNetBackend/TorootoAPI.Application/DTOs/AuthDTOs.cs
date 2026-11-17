namespace TorootoAPI.Application.Auth;

public record UserReadDto(
    Guid Id,
    string Email,
    bool IsActive,
    bool IsSuperuser,
    bool IsVerified,
    string? Name,
    DateOnly? Birthday,
    string? ZodiacSign,
    string? ImageUrl
);

public record UserCreateDto(
    string Email,
    string Password,
    string? Name,
    DateOnly? Birthday,
    string? ZodiacSign
);

public record LoginRequestDto(
    string Email,
    string Password
);

public record AuthTokenResponseDto(
    string AccessToken,
    string TokenType
);

public record UserUpdateDto(
    string? Name,
    DateOnly? Birthday,
    string? ZodiacSign
);
