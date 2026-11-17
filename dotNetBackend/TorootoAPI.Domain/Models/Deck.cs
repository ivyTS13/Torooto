namespace TorootoAPI.Domain.Models;

public class Deck
{
    private Deck() { }

    public Guid DeckId { get; private set; }
    public string DeckName { get; private set; } = null!;
    public string DeckType { get; private set; } = null!;
    public string DeckContent { get; private set; } = null!;
    public DateTime? CreatedAt { get; private set; }
    public bool? IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    public virtual ICollection<Card> Cards { get; private set; } = [];

    public static Deck Create(string deckName, string deckType, string deckContent, DateTime utcNow)
    {
        if (string.IsNullOrWhiteSpace(deckName))
            throw new ArgumentException("DeckName is required.", nameof(deckName));
        if (string.IsNullOrWhiteSpace(deckType))
            throw new ArgumentException("DeckType is required.", nameof(deckType));

        return new Deck
        {
            DeckId = Guid.NewGuid(),
            DeckName = deckName.Trim(),
            DeckType = deckType.Trim(),
            DeckContent = deckContent?.Trim() ?? string.Empty,
            CreatedAt = utcNow,
            IsDeleted = false,
            DeletedAt = null
        };
    }

    public void Update(string deckName, string deckContent)
    {
        if (string.IsNullOrWhiteSpace(deckName))
            throw new ArgumentException("DeckName is required.", nameof(deckName));

        DeckName = deckName.Trim();
        DeckContent = deckContent?.Trim() ?? string.Empty;
    }

    public void SoftDelete(DateTime utcNow)
    {
        IsDeleted = true;
        DeletedAt = utcNow;
    }

    public void Restore()
    {
        IsDeleted = false;
        DeletedAt = null;
    }
}
