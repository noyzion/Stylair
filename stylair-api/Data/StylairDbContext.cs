using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace stylair_api.Data;

/// <summary>
/// DbContext - This class connects the code to PostgreSQL
/// It inherits from Entity Framework Core's DbContext and defines the mapping between C# models and database tables
/// </summary>
public class StylairDbContext : DbContext
{
    /// <summary>
    /// Constructor - Receives connection options (connection string) through Dependency Injection
    /// The connection string is defined in Program.cs and passed here
    /// </summary>
    public StylairDbContext(DbContextOptions<StylairDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// DbSet - This represents the closet_items table in the database
    /// Through this, you can perform CRUD operations (Create, Read, Update, Delete) on the table
    /// </summary>
    public DbSet<OutfitItem> ClosetItems { get; set; }

    /// <summary>
    /// OnModelCreating - This function is called once during DbContext initialization
    /// Here we define the mapping between the C# model and the PostgreSQL table structure
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Define the mapping for the closet_items table
        modelBuilder.Entity<OutfitItem>(entity =>
        {
            // Define the table name in the database (without this, EF Core would look for "ClosetItems")
            entity.ToTable("closet_items");
            
            // Define the primary key - item_image is the only primary key
            // This means each row must be unique by item_image
            entity.HasKey(e => e.ItemImage);
            
            // Map item_id column - UUID in the database
            // This is not the primary key, just a regular column
            entity.Property(e => e.ItemId)
                .HasColumnName("item_id")  // Column name in PostgreSQL (snake_case)
                .HasColumnType("uuid");  // Data type in the database
            
            // Map item_name column - required text
            entity.Property(e => e.ItemName)
                .HasColumnName("item_name")  // Column name in PostgreSQL
                .IsRequired();  // Required - cannot be null
            
            // Map item_category column - required text
            entity.Property(e => e.ItemCategory)
                .HasColumnName("item_category")  // Column name in PostgreSQL
                .IsRequired();  // Required - cannot be null
            
            // Map item_image column - required text (this is the primary key)
            entity.Property(e => e.ItemImage)
                .HasColumnName("item_image")  // Column name in PostgreSQL
                .IsRequired();  // Required - cannot be null
            
            // Define JSON options - used for converting List<string> to JSONB
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,  // Property names in camelCase
                WriteIndented = false  // Compact JSON (no spaces)
            };
            
            // Map style column - JSONB in database, List<string> in C#
            // HasConversion automatically converts:
            // - When saving: List<string> → JSON string → JSONB
            // - When reading: JSONB → JSON string → List<string>
            entity.Property(e => e.Style)
                .HasColumnName("style")
                .HasColumnType("jsonb")  // Data type in PostgreSQL
                .HasConversion(
                    // Conversion when saving to database: if null or empty, save "[]", otherwise save as JSON
                    v => v == null || v.Count == 0 ? "[]" : JsonSerializer.Serialize(v, jsonOptions),
                    // Conversion when reading from database: if empty, return empty list, otherwise parse from JSON
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());
            
            // Map colors column - JSONB in database, List<string> in C#
            entity.Property(e => e.Colors)
                .HasColumnName("colors")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null || v.Count == 0 ? "[]" : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());
            
            // Map season column - JSONB in database, List<string> in C#
            entity.Property(e => e.Season)
                .HasColumnName("season")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null || v.Count == 0 ? "[]" : JsonSerializer.Serialize(v, jsonOptions),
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());
            
            // Map created_at column - timestamp in database, DateTime in C#
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp without time zone")  // Data type in PostgreSQL
                .HasConversion(
                    // Conversion when saving: if UTC, convert to local time (because table doesn't support UTC)
                    v => v.Kind == DateTimeKind.Utc ? v.ToLocalTime() : v,
                    // Conversion when reading: set as Unspecified (no timezone)
                    v => DateTime.SpecifyKind(v, DateTimeKind.Unspecified))
                .HasDefaultValueSql("CURRENT_TIMESTAMP");  // If no value is specified, PostgreSQL will insert current time
        });
    }
}

