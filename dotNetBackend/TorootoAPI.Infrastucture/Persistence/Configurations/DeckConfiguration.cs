using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Infrastucture.Persistence.Configurations;

public sealed class DeckConfiguration : IEntityTypeConfiguration<Deck>
{
    public void Configure(EntityTypeBuilder<Deck> builder)
    {
        builder.ToTable("decks");

        builder.HasKey(e => e.DeckId).HasName("decks_pkey");

        builder.Property(e => e.DeckId)
            .HasColumnName("deck_id")
            .ValueGeneratedNever();

        builder.Property(e => e.DeckName)
            .HasColumnName("deck_name")
            .HasColumnType("character varying");

        builder.Property(e => e.DeckType)
            .HasColumnName("deck_type")
            .HasColumnType("character varying");

        builder.Property(e => e.DeckContent)
            .HasColumnName("deck_content")
            .HasColumnType("character varying");

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(e => e.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        builder.HasQueryFilter(e => e.IsDeleted != true);
    }
}
