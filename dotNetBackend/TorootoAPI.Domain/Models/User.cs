using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TorootoAPI.Domain.Models;

[Table("users")]
public partial class User
{
    [Column("profile_image_url", TypeName = "character varying")]
    public string? ProfileImageUrl { get; set; }

    [Column("name", TypeName = "character varying")]
    public string? Name { get; set; }

    [Column("birthday")]
    public DateOnly? Birthday { get; set; }

    [Column("zodiac_sign", TypeName = "character varying")]
    public string? ZodiacSign { get; set; }

    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("email")]
    [StringLength(320)]
    public string Email { get; set; } = null!;

    [Column("hashed_password")]
    [StringLength(1024)]
    public string HashedPassword { get; set; } = null!;

    [Column("is_active")]
    public bool IsActive { get; set; }

    [Column("is_superuser")]
    public bool IsSuperuser { get; set; }

    [Column("is_verified")]
    public bool IsVerified { get; set; }

    [Column("image_url", TypeName = "character varying")]
    public string? ImageUrl { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Pile> Piles { get; set; } = new List<Pile>();
}
