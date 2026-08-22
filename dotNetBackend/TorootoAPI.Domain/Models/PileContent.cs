using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TorootoAPI.Domain.Models;

[Table("pile_contents")]
public partial class PileContent
{
    [Key]
    [Column("pile_content_id")]
    public Guid PileContentId { get; set; }

    [Column("pile_id")]
    public Guid PileId { get; set; }

    [Column("card_id")]
    public Guid CardId { get; set; }

    [Column("reversed_card")]
    public bool ReversedCard { get; set; }

    [Column("position")]
    public int Position { get; set; }

    [Column("is_deleted")]
    public bool? IsDeleted { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("CardId")]
    [InverseProperty("PileContents")]
    public virtual Card Card { get; set; } = null!;

    [ForeignKey("PileId")]
    [InverseProperty("PileContents")]
    public virtual Pile Pile { get; set; } = null!;
}
