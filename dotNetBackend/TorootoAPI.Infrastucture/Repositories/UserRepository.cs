using Isopoh.Cryptography.Argon2;
using Microsoft.EntityFrameworkCore;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;

namespace TorootoAPI.Infrastucture.Repositories
{
    internal class UserRepository : IUserRepository
    {
        private readonly TorootoDBContext _context;

        public UserRepository(TorootoDBContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(User user, string plainPassword)
        {
            user.Id = Guid.NewGuid();
            // Assuming your User model has a HashedPassword property. Adjust if named differently.
            user.HashedPassword = Argon2.Hash(plainPassword);
            user.IsActive = true;
            user.IsVerified = false;

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> UpdateUserImageAsync(Guid id, string imageUrl)
        {
            var user = await GetUserByIdAsync(id);
            if (user == null) return null;

            user.ImageUrl = imageUrl;
            await _context.SaveChangesAsync();
            return user;
        }
    }
}
