using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetUserByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetUserByEmailAsync(string email, CancellationToken ct = default);
    Task<User> CreateUserAsync(User user, CancellationToken ct = default);
    Task<User?> UpdateUserAsync(User user, CancellationToken ct = default);
    Task<User?> UpdateUserImageAsync(Guid id, string imageUrl, CancellationToken ct = default);
}
