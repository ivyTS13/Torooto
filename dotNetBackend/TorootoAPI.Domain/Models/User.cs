namespace TorootoAPI.Domain.Models;

public class User
{
    private User() { }

    public Guid Id { get; private set; }
    public string? Name { get; private set; }
    public DateOnly? Birthday { get; private set; }
    public string? ZodiacSign { get; private set; }
    public string Email { get; private set; } = null!;
    public string HashedPassword { get; private set; } = null!;
    public bool IsActive { get; private set; }
    public bool IsSuperuser { get; private set; }
    public bool IsVerified { get; private set; }
    public string? ImageUrl { get; private set; }

    public virtual ICollection<Pile> Piles { get; private set; } = [];

    public static User Create(
        string email,
        string hashedPassword,
        string? name,
        DateOnly? birthday,
        string? zodiacSign)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.", nameof(email));
        if (string.IsNullOrWhiteSpace(hashedPassword))
            throw new ArgumentException("HashedPassword is required.", nameof(hashedPassword));

        return new User
        {
            Id = Guid.NewGuid(),
            Email = email.Trim().ToLowerInvariant(),
            HashedPassword = hashedPassword,
            Name = name?.Trim(),
            Birthday = birthday,
            ZodiacSign = zodiacSign?.Trim(),
            IsActive = true,
            IsSuperuser = false,
            IsVerified = false
        };
    }

    public void UpdateProfile(string? name, DateOnly? birthday, string? zodiacSign)
    {
        if (name is not null)
            Name = name.Trim();
        if (birthday.HasValue)
            Birthday = birthday;
        if (zodiacSign is not null)
            ZodiacSign = zodiacSign.Trim();
    }

    public void UpdateImage(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("ImageUrl is required.", nameof(imageUrl));

        ImageUrl = imageUrl.Trim();
    }
}
