using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TorootoAPI.Domain.Models;

[Table("decks")]
public partial class Deck
{
    [Key]
    [Column("deck_id")]
    public Guid DeckId { get; set; }

    [Column("deck_name", TypeName = "character varying")]
    public string DeckName { get; set; } = null!;

    [Column("deck_type", TypeName = "character varying")]
    public string DeckType { get; set; } = null!;

    [Column("deck_content", TypeName = "character varying")]
    public string DeckContent { get; set; } = null!;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("is_deleted")]
    public bool? IsDeleted { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [InverseProperty("Deck")]
    public virtual ICollection<Card> Cards { get; set; } = new List<Card>();
}
