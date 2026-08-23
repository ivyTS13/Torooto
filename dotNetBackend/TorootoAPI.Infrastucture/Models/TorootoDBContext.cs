using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Text.Json;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Infrastucture.Models;

public partial class TorootoDBContext : DbContext
{
    public TorootoDBContext(DbContextOptions<TorootoDBContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AlembicVersion> AlembicVersions { get; set; }

    public virtual DbSet<Card> Cards { get; set; }

    public virtual DbSet<Deck> Decks { get; set; }

    public virtual DbSet<Pile> Piles { get; set; }

    public virtual DbSet<PileContent> PileContents { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "oauth_authorization_status", new[] { "pending", "approved", "denied", "expired" })
            .HasPostgresEnum("auth", "oauth_client_type", new[] { "public", "confidential" })
            .HasPostgresEnum("auth", "oauth_registration_type", new[] { "dynamic", "manual" })
            .HasPostgresEnum("auth", "oauth_response_type", new[] { "code" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in", "like", "ilike", "is", "match", "imatch", "isdistinct" })
            .HasPostgresEnum("storage", "buckettype", new[] { "STANDARD", "ANALYTICS", "VECTOR" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("vault", "supabase_vault");
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            DictionaryKeyPolicy = JsonNamingPolicy.SnakeCaseLower
        };
        modelBuilder.Entity<AlembicVersion>(entity =>
        {
            entity.HasKey(e => e.VersionNum).HasName("alembic_version_pkc");
        });

        modelBuilder.Entity<Card>(entity =>
        {
            entity.HasKey(e => e.CardId).HasName("cards_pkey");

            entity.Property(e => e.CardId).ValueGeneratedNever();

            entity.HasOne(d => d.Deck).WithMany(p => p.Cards)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("cards_deck_id_fkey");
            // NEW CODE: The metadata configuration starts here
            entity.Property(e => e.CardMetadata)
                .HasColumnType("jsonb") // Tells Postgres to use its native JSONB type
                .HasConversion(
                    v => JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v)
                            ? new Dictionary<string, object>()
                            : JsonSerializer.Deserialize<Dictionary<string, object>>(v, jsonOptions)
                );

            var metadataComparer = new ValueComparer<Dictionary<string, object>>(
                (c1, c2) => JsonSerializer.Serialize(c1, jsonOptions) == JsonSerializer.Serialize(c2, jsonOptions),
                c => c == null ? 0 : JsonSerializer.Serialize(c, jsonOptions).GetHashCode(),
                c => JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(c, jsonOptions), jsonOptions)!
            );

            entity.Property(e => e.CardMetadata)
                .Metadata.SetValueComparer(metadataComparer);
            // NEW CODE: The metadata configuration ends here
        });

        modelBuilder.Entity<Deck>(entity =>
        {
            entity.HasKey(e => e.DeckId).HasName("decks_pkey");

            entity.Property(e => e.DeckId).ValueGeneratedNever();
        });

        modelBuilder.Entity<Pile>(entity =>
        {
            entity.HasKey(e => e.PileId).HasName("piles_pkey");

            entity.Property(e => e.PileId).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.Piles)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("piles_user_id_fkey");
        });

        modelBuilder.Entity<PileContent>(entity =>
        {
            entity.HasKey(e => e.PileContentId).HasName("pile_contents_pkey");

            entity.Property(e => e.PileContentId).ValueGeneratedNever();

            entity.HasOne(d => d.Card).WithMany(p => p.PileContents)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("pile_contents_card_id_fkey");

            entity.HasOne(d => d.Pile).WithMany(p => p.PileContents)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("pile_contents_pile_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
