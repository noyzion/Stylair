using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace stylair_api.Data;

public class StylairDbContext : DbContext
{
    public StylairDbContext(DbContextOptions<StylairDbContext> options) : base(options)
    {
    }

    public DbSet<OutfitItem> ClosetItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OutfitItem>(entity =>
        {
            entity.ToTable("closet_items");
            
            // Primary key: item_image only
            entity.HasKey(e => e.ItemImage);
            
            entity.Property(e => e.ItemId)
                .HasColumnName("item_id")
                .HasColumnType("uuid");
            
            entity.Property(e => e.ItemName)
                .HasColumnName("item_name")
                .IsRequired();
            
            entity.Property(e => e.ItemCategory)
                .HasColumnName("item_category")
                .IsRequired();
            
            entity.Property(e => e.ItemImage)
                .HasColumnName("item_image")
                .IsRequired();
            
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };
            
            entity.Property(e => e.Style)
                .HasColumnName("style")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null || v.Count == 0 ? "[]" : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());
            
            entity.Property(e => e.Colors)
                .HasColumnName("colors")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null || v.Count == 0 ? "[]" : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());
            
            entity.Property(e => e.Season)
                .HasColumnName("season")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null || v.Count == 0 ? "[]" : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());
            
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp without time zone")
                .HasConversion(
                    v => v.Kind == DateTimeKind.Utc ? v.ToLocalTime() : v,
                    v => DateTime.SpecifyKind(v, DateTimeKind.Unspecified))
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}

