using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Infrastucture.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(e => e.Id).HasName("users_pkey");

        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(e => e.Name)
            .HasColumnName("name")
            .HasColumnType("character varying");

        builder.Property(e => e.Birthday)
            .HasColumnName("birthday");

        builder.Property(e => e.ZodiacSign)
            .HasColumnName("zodiac_sign")
            .HasColumnType("character varying");

        builder.Property(e => e.Email)
            .HasColumnName("email")
            .HasMaxLength(320);

        builder.Property(e => e.HashedPassword)
            .HasColumnName("hashed_password")
            .HasMaxLength(1024);

        builder.Property(e => e.IsActive)
            .HasColumnName("is_active");

        builder.Property(e => e.IsSuperuser)
            .HasColumnName("is_superuser");

        builder.Property(e => e.IsVerified)
            .HasColumnName("is_verified");

        builder.Property(e => e.ImageUrl)
            .HasColumnName("image_url")
            .HasColumnType("character varying");
    }
}
