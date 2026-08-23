

namespace TorootoAPI.Application.Auth;

// Replaces UserRead (GET /users/me)
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

// Replaces UserCreate (POST /auth/register)
public record UserCreateDto(
    string Email,
    string Password,
    string? Name,
    DateOnly? Birthday,
    string? ZodiacSign
);

// Replaces UserUpdate (PATCH /users/me)
public record UserUpdateDto(
    string? Name,
    DateOnly? Birthday,
    string? ZodiacSign
);