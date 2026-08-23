using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TorootoAPI.Domain.Models;

[Table("piles")]
public partial class Pile
{
    [Key]
    [Column("pile_id")]
    public Guid PileId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("drawn_at")]
    public DateTime? DrawnAt { get; set; }

    [Column("is_deleted")]
    public bool? IsDeleted { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [InverseProperty("Pile")]
    public virtual ICollection<PileContent> PileContents { get; set; } = new List<PileContent>();

    [ForeignKey("UserId")]
    [InverseProperty("Piles")]
    public virtual User User { get; set; } = null!;
}
