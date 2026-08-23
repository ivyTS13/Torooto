using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetUserByIdAsync(Guid id);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(User user, string plainPassword);
        Task<User?> UpdateUserAsync(User user);
        Task<User?> UpdateUserImageAsync(Guid id, string imageUrl);
    }
}
