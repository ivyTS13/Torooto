namespace TorootoAPI.Domain.Models;

public class Pile
{
    private readonly List<PileContent> _pileContents = [];

    private Pile() { }

    public Guid PileId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime? DrawnAt { get; private set; }
    public bool? IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    public virtual IReadOnlyCollection<PileContent> PileContents => _pileContents.AsReadOnly();
    public virtual User User { get; private set; } = null!;

    public static Pile Create(
        Guid userId,
        DateTime utcNow,
        IEnumerable<(Guid CardId, int Position, bool ReversedCard)> drawnCards)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId cannot be empty.", nameof(userId));

        var items = drawnCards.ToList();
        if (items.Count == 0)
            throw new ArgumentException("A pile must contain at least one card.", nameof(drawnCards));

        if (items.Select(x => x.CardId).Distinct().Count() != items.Count)
            throw new ArgumentException("A pile cannot contain duplicate cards.", nameof(drawnCards));

        var pile = new Pile
        {
            PileId = Guid.NewGuid(),
            UserId = userId,
            DrawnAt = utcNow,
            IsDeleted = false,
            DeletedAt = null
        };

        foreach (var (cardId, position, reversedCard) in items.OrderBy(x => x.Position))
        {
            pile._pileContents.Add(PileContent.Create(pile.PileId, cardId, position, reversedCard));
        }

        return pile;
    }

    public void SoftDelete(DateTime utcNow)
    {
        IsDeleted = true;
        DeletedAt = utcNow;
    }
}
