namespace TorootoAPI.Domain.Models;

public class PileContent
{
    private PileContent() { }

    public Guid PileContentId { get; private set; }
    public Guid PileId { get; private set; }
    public Guid CardId { get; private set; }
    public bool ReversedCard { get; private set; }
    public int Position { get; private set; }
    public bool? IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    public virtual Card Card { get; private set; } = null!;
    public virtual Pile Pile { get; private set; } = null!;

    public static PileContent Create(Guid pileId, Guid cardId, int position, bool reversedCard)
    {
        if (pileId == Guid.Empty)
            throw new ArgumentException("PileId cannot be empty.", nameof(pileId));
        if (cardId == Guid.Empty)
            throw new ArgumentException("CardId cannot be empty.", nameof(cardId));
        if (position < 0)
            throw new ArgumentOutOfRangeException(nameof(position), "Position must be non-negative.");

        return new PileContent
        {
            PileContentId = Guid.NewGuid(),
            PileId = pileId,
            CardId = cardId,
            Position = position,
            ReversedCard = reversedCard,
            IsDeleted = false,
            DeletedAt = null
        };
    }

    public void SoftDelete(DateTime utcNow)
    {
        IsDeleted = true;
        DeletedAt = utcNow;
    }
}
