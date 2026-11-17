using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Infrastucture.Persistence.Configurations;

public sealed class CardConfiguration : IEntityTypeConfiguration<Card>
{
    private static readonly JsonSerializerOptions SnakeCaseJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DictionaryKeyPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public void Configure(EntityTypeBuilder<Card> builder)
    {
        builder.ToTable("cards");

        builder.HasKey(e => e.CardId).HasName("cards_pkey");

        builder.Property(e => e.CardId)
            .HasColumnName("card_id")
            .ValueGeneratedNever();

        builder.Property(e => e.DeckId)
            .HasColumnName("deck_id");

        builder.Property(e => e.CardName)
            .HasColumnName("card_name")
            .HasColumnType("character varying");

        builder.Property(e => e.CardSuit)
            .HasColumnName("card_suit")
            .HasColumnType("character varying");

        builder.Property(e => e.ImageUrl)
            .HasColumnName("image_url")
            .HasColumnType("character varying");

        builder.Property(e => e.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(e => e.CardPosition)
            .HasColumnName("card_position");

        var metadataComparer = new ValueComparer<Dictionary<string, object>>(
            (c1, c2) => JsonSerializer.Serialize(c1, SnakeCaseJsonOptions) == JsonSerializer.Serialize(c2, SnakeCaseJsonOptions),
            c => c == null ? 0 : JsonSerializer.Serialize(c, SnakeCaseJsonOptions).GetHashCode(),
            c => JsonSerializer.Deserialize<Dictionary<string, object>>(
                JsonSerializer.Serialize(c, SnakeCaseJsonOptions), SnakeCaseJsonOptions)!);

        builder.Property(e => e.CardMetadata)
            .HasColumnName("card_metadata")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, SnakeCaseJsonOptions),
                v => string.IsNullOrEmpty(v)
                    ? new Dictionary<string, object>()
                    : JsonSerializer.Deserialize<Dictionary<string, object>>(v, SnakeCaseJsonOptions))
            .Metadata.SetValueComparer(metadataComparer);

        builder.HasOne(d => d.Deck)
            .WithMany(p => p.Cards)
            .HasForeignKey(d => d.DeckId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("cards_deck_id_fkey");

        builder.HasQueryFilter(e => e.IsDeleted != true);
    }
}
