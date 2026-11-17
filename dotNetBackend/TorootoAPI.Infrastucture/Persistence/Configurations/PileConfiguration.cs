using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Infrastucture.Persistence.Configurations;

public sealed class PileConfiguration : IEntityTypeConfiguration<Pile>
{
    public void Configure(EntityTypeBuilder<Pile> builder)
    {
        builder.ToTable("piles");

        builder.HasKey(e => e.PileId).HasName("piles_pkey");

        builder.Property(e => e.PileId)
            .HasColumnName("pile_id")
            .ValueGeneratedNever();

        builder.Property(e => e.UserId)
            .HasColumnName("user_id");

        builder.Property(e => e.DrawnAt)
            .HasColumnName("drawn_at");

        builder.Property(e => e.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Navigation(e => e.PileContents)
            .HasField("_pileContents")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasOne(d => d.User)
            .WithMany(p => p.Piles)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("piles_user_id_fkey");

        builder.HasQueryFilter(e => e.IsDeleted != true);
    }
}
