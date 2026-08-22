
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace TorootoAPI.Domain.Models;

[Table("cards")]
public partial class Card
{
    [Key]
    [Column("card_id")]
    public Guid CardId { get; set; }

    [Column("deck_id")]
    public Guid DeckId { get; set; }

    [Column("card_name", TypeName = "character varying")]
    public string CardName { get; set; } = null!;

    [Column("card_suit", TypeName = "character varying")]
    public string CardSuit { get; set; } = null!;

    [Column("card_metadata", TypeName = "jsonb")]
    public Dictionary<string, object>? CardMetadata { get; set; } = null!;

    [Column("image_url", TypeName = "character varying")]
    public string? ImageUrl { get; set; }

    [Column("is_deleted")]
    public bool? IsDeleted { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("card_position")]
    public int CardPosition { get; set; }

    [ForeignKey("DeckId")]
    [InverseProperty("Cards")]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual Deck Deck { get; set; } = null!;

    [InverseProperty("Card")]
    public virtual ICollection<PileContent> PileContents { get; set; } = new List<PileContent>();
}
