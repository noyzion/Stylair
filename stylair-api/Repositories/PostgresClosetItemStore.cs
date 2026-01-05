using Microsoft.EntityFrameworkCore;
using stylair_api.Data;
using stylair_api.Models;
using System.Linq;

namespace stylair_api.Repositories;

/// PostgresClosetItemStore - This is the Repository that connects to PostgreSQL
/// It implements IClosetItemStore and uses StylairDbContext to perform database operations
public class PostgresClosetItemStore : IClosetItemStore
{
    /// DbContext for PostgreSQL
    private readonly StylairDbContext _context;

    /// Constructor
    public PostgresClosetItemStore(StylairDbContext context)
    {
        _context = context;
    }

    /// Add - Adds a new item to the database
    public void Add(OutfitItem item, string userId)
    {
        try
        {
            // If ItemId is not set, create a new GUID (but this is not the primary key, just a regular column)
            if (item.ItemId == Guid.Empty)
            {
                item.ItemId = Guid.NewGuid();
            }

            // Set the user ID (required for multi-user support)
            item.UserId = userId;

            // Set the creation time (if not set, the database will insert it automatically)
            item.CreatedAt = DateTime.Now;

            // Log before saving
            Console.WriteLine($"=== PostgresClosetItemStore.Add ===");
            Console.WriteLine($"Item Size: '{item.Size}' (is null: {item.Size == null})");
            Console.WriteLine($"Item Tags: [{string.Join(", ", item.Tags ?? new List<string>())}] (is null: {item.Tags == null}, count: {item.Tags?.Count ?? 0})");

            // Add the item to the DbSet (this doesn't save to database yet)
            _context.ClosetItems.Add(item);

            // Save changes to the database - this is where the actual operation happens in PostgreSQL
            // EF Core translates this to SQL: INSERT INTO closet_items ...
            _context.SaveChanges();
            
            Console.WriteLine($"=== Item Saved to Database ===");
        }
        catch (Exception ex)
        {
            // In case of error, print details to console
            Console.WriteLine($"Error in PostgresClosetItemStore.Add: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw; // Re-throw the error to Service/Controller to handle it
        }
    }

    /// GetAll - Gets all items from the database for a specific user
    public List<OutfitItem> GetAll(string userId)
    {
        // EF Core translates this to SQL: SELECT * FROM closet_items WHERE user_id = @userId ORDER BY created_at DESC
        // Filters by user_id to ensure users only see their own items
        return _context.ClosetItems
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToList();
    }

    /// Delete - Deletes an item from the database by itemImage (primary key)
    /// Also verifies that the user owns the item before deleting
    public void Delete(string itemImage, string userId)
    {
        try
        {
            var item = _context.ClosetItems.Find(itemImage);
            if (item == null)
            {
                throw new ArgumentException($"Item with image '{itemImage}' not found");
            }
            
            // Verify that the user owns this item
            if (item.UserId != userId)
            {
                throw new UnauthorizedAccessException("You don't have permission to delete this item. It belongs to another user.");
            }
            
            _context.ClosetItems.Remove(item);
            _context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PostgresClosetItemStore.Delete: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }

    /// Update - Updates an existing item in the database
    public void Update(OutfitItem item)
    {
        try
        {
            var existingItem = _context.ClosetItems.Find(item.ItemImage);
            if (existingItem == null)
            {
                throw new ArgumentException($"Item with image '{item.ItemImage}' not found");
            }
            
            // Update all properties
            existingItem.ItemName = item.ItemName;
            existingItem.ItemCategory = item.ItemCategory;
            existingItem.Style = item.Style;
            existingItem.Colors = item.Colors;
            existingItem.Season = item.Season;
            existingItem.Size = item.Size;
            existingItem.Tags = item.Tags;
            
            _context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PostgresClosetItemStore.Update: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }
}

