using Isopoh.Cryptography.Argon2;
using TorootoAPI.Application.Interfaces;

namespace TorootoAPI.Infrastucture.Services;

public sealed class Argon2PasswordHasher : IPasswordHasher
{
    public string Hash(string plainPassword) => Argon2.Hash(plainPassword);

    public bool Verify(string hashedPassword, string plainPassword)
    {
        try
        {
            return Argon2.Verify(hashedPassword, plainPassword);
        }
        catch (Exception)
        {
            return false;
        }
    }
}
