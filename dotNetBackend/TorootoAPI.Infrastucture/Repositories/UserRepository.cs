using Microsoft.EntityFrameworkCore;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.Infrastucture.Repositories;

internal sealed class UserRepository(TorootoDBContext context) : IUserRepository
{
    public async Task<User?> GetUserByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public async Task<User?> GetUserByEmailAsync(string email, CancellationToken ct = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalized, ct);
    }

    public async Task<User> CreateUserAsync(User user, CancellationToken ct = default)
    {
        await context.Users.AddAsync(user, ct);
        await context.SaveChangesAsync(ct);
        return user;
    }

    public async Task<User?> UpdateUserAsync(User user, CancellationToken ct = default)
    {
        context.Users.Update(user);
        await context.SaveChangesAsync(ct);
        return user;
    }

    public async Task<User?> UpdateUserImageAsync(Guid id, string imageUrl, CancellationToken ct = default)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return null;

        user.UpdateImage(imageUrl);
        await context.SaveChangesAsync(ct);
        return user;
    }
}
