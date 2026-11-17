namespace TorootoAPI.Domain.Models;

public class Card
{
    private Card() { }

    public Guid CardId { get; private set; }
    public Guid DeckId { get; private set; }
    public string CardName { get; private set; } = null!;
    public string CardSuit { get; private set; } = null!;
    public Dictionary<string, object>? CardMetadata { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool? IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }
    public int CardPosition { get; private set; }

    public virtual Deck Deck { get; private set; } = null!;
    public virtual ICollection<PileContent> PileContents { get; private set; } = [];

    public static Card Create(
        Guid deckId,
        string cardName,
        string cardSuit,
        int cardPosition,
        Dictionary<string, object>? cardMetadata = null,
        string? imageUrl = null)
    {
        if (deckId == Guid.Empty)
            throw new ArgumentException("DeckId cannot be empty.", nameof(deckId));
        if (string.IsNullOrWhiteSpace(cardName))
            throw new ArgumentException("CardName is required.", nameof(cardName));
        if (string.IsNullOrWhiteSpace(cardSuit))
            throw new ArgumentException("CardSuit is required.", nameof(cardSuit));

        return new Card
        {
            CardId = Guid.NewGuid(),
            DeckId = deckId,
            CardName = cardName.Trim(),
            CardSuit = cardSuit.Trim(),
            CardPosition = cardPosition,
            CardMetadata = cardMetadata ?? new Dictionary<string, object>(),
            ImageUrl = imageUrl,
            IsDeleted = false,
            DeletedAt = null
        };
    }

    public void UpdateDetails(
        string cardName,
        string cardSuit,
        int? cardPosition,
        Dictionary<string, object>? cardMetadata,
        string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(cardName))
            throw new ArgumentException("CardName is required.", nameof(cardName));
        if (string.IsNullOrWhiteSpace(cardSuit))
            throw new ArgumentException("CardSuit is required.", nameof(cardSuit));

        CardName = cardName.Trim();
        CardSuit = cardSuit.Trim();
        if (cardPosition.HasValue)
            CardPosition = cardPosition.Value;
        if (cardMetadata is not null)
            CardMetadata = cardMetadata;
        if (imageUrl is not null)
            ImageUrl = imageUrl;
    }

    public void UpdateImage(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("ImageUrl is required.", nameof(imageUrl));

        ImageUrl = imageUrl.Trim();
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
