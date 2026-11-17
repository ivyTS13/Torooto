using FluentValidation;
using MapsterMapper;
using TorootoAPI.Application.Auth;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Common;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.UseCases;

public interface IAuthService
{
    Task<Result<UserReadDto>> RegisterAsync(UserCreateDto dto, CancellationToken ct = default);
    Task<Result<AuthTokenResponseDto>> LoginAsync(LoginRequestDto dto, CancellationToken ct = default);
    Task<Result<UserReadDto>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
    Task<Result<UserReadDto>> UpdateCurrentUserAsync(Guid userId, UserUpdateDto dto, CancellationToken ct = default);
    Task<Result<UserReadDto>> UpdateUserImageAsync(Guid currentUserId, Guid targetUserId, ImageUploadRequest uploadRequest, CancellationToken ct = default);
}

internal sealed class AuthService(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IImageStorageService imageStorageService,
    IMapper mapper,
    IValidator<UserCreateDto> createValidator,
    IValidator<LoginRequestDto> loginValidator,
    IValidator<UserUpdateDto> updateValidator) : IAuthService
{
    public async Task<Result<UserReadDto>> RegisterAsync(UserCreateDto dto, CancellationToken ct = default)
    {
        var validationError = await createValidator.ValidateToErrorAsync(dto, ct);
        if (validationError is not null)
            return Result.Failure<UserReadDto>(validationError);

        var existingUser = await userRepository.GetUserByEmailAsync(dto.Email, ct);
        if (existingUser is not null)
            return Result.Failure<UserReadDto>(DomainError.Conflict("Email already registered."));

        var hashedPassword = passwordHasher.Hash(dto.Password);
        var user = User.Create(dto.Email, hashedPassword, dto.Name, dto.Birthday, dto.ZodiacSign);

        var createdUser = await userRepository.CreateUserAsync(user, ct);
        return Result.Success(mapper.Map<UserReadDto>(createdUser));
    }

    public async Task<Result<AuthTokenResponseDto>> LoginAsync(LoginRequestDto dto, CancellationToken ct = default)
    {
        var validationError = await loginValidator.ValidateToErrorAsync(dto, ct);
        if (validationError is not null)
            return Result.Failure<AuthTokenResponseDto>(validationError);

        var user = await userRepository.GetUserByEmailAsync(dto.Email, ct);
        if (user is null || string.IsNullOrEmpty(user.HashedPassword) || !passwordHasher.Verify(user.HashedPassword, dto.Password))
            return Result.Failure<AuthTokenResponseDto>(DomainError.Unauthorized("Invalid credentials."));

        var token = tokenService.GenerateJwtToken(user);
        return Result.Success(new AuthTokenResponseDto(token, "bearer"));
    }

    public async Task<Result<UserReadDto>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await userRepository.GetUserByIdAsync(userId, ct);
        if (user is null)
            return Result.Failure<UserReadDto>(DomainError.NotFound("User not found."));

        return Result.Success(mapper.Map<UserReadDto>(user));
    }

    public async Task<Result<UserReadDto>> UpdateCurrentUserAsync(Guid userId, UserUpdateDto dto, CancellationToken ct = default)
    {
        var validationError = await updateValidator.ValidateToErrorAsync(dto, ct);
        if (validationError is not null)
            return Result.Failure<UserReadDto>(validationError);

        var user = await userRepository.GetUserByIdAsync(userId, ct);
        if (user is null)
            return Result.Failure<UserReadDto>(DomainError.NotFound("User not found."));

        user.UpdateProfile(dto.Name, dto.Birthday, dto.ZodiacSign);
        var updatedUser = await userRepository.UpdateUserAsync(user, ct);
        return Result.Success(mapper.Map<UserReadDto>(updatedUser ?? user));
    }

    public async Task<Result<UserReadDto>> UpdateUserImageAsync(
        Guid currentUserId,
        Guid targetUserId,
        ImageUploadRequest uploadRequest,
        CancellationToken ct = default)
    {
        if (currentUserId != targetUserId)
            return Result.Failure<UserReadDto>(DomainError.Forbidden("You can only update your own profile image."));

        var imageUrl = await imageStorageService.UploadImageAsync(uploadRequest, ct);
        var updatedUser = await userRepository.UpdateUserImageAsync(targetUserId, imageUrl, ct);
        if (updatedUser is null)
            return Result.Failure<UserReadDto>(DomainError.NotFound("User not found."));

        return Result.Success(mapper.Map<UserReadDto>(updatedUser));
    }
}
