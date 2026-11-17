using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Infrastucture.Persistence.Configurations;

public sealed class PileContentConfiguration : IEntityTypeConfiguration<PileContent>
{
    public void Configure(EntityTypeBuilder<PileContent> builder)
    {
        builder.ToTable("pile_contents");

        builder.HasKey(e => e.PileContentId).HasName("pile_contents_pkey");

        builder.Property(e => e.PileContentId)
            .HasColumnName("pile_content_id")
            .ValueGeneratedNever();

        builder.Property(e => e.PileId)
            .HasColumnName("pile_id");

        builder.Property(e => e.CardId)
            .HasColumnName("card_id");

        builder.Property(e => e.ReversedCard)
            .HasColumnName("reversed_card");

        builder.Property(e => e.Position)
            .HasColumnName("position");

        builder.Property(e => e.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        builder.HasOne(d => d.Card)
            .WithMany(p => p.PileContents)
            .HasForeignKey(d => d.CardId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("pile_contents_card_id_fkey");

        builder.HasOne(d => d.Pile)
            .WithMany(p => p.PileContents)
            .HasForeignKey(d => d.PileId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("pile_contents_pile_id_fkey");

        builder.HasQueryFilter(e => e.IsDeleted != true);
    }
}
