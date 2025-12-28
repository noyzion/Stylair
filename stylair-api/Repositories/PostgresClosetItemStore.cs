using Microsoft.EntityFrameworkCore;
using stylair_api.Data;

namespace stylair_api.Repositories;

/// <summary>
/// PostgresClosetItemStore - This is the Repository that connects to PostgreSQL
/// It implements IClosetItemStore and uses StylairDbContext to perform database operations
/// </summary>
public class PostgresClosetItemStore : IClosetItemStore
{
    /// <summary>
    /// _context - This is the DbContext that connects us to PostgreSQL
    /// It is injected through Dependency Injection in Program.cs
    /// </summary>
    private readonly StylairDbContext _context;

    /// <summary>
    /// Constructor - Receives the DbContext through Dependency Injection
    /// </summary>
    public PostgresClosetItemStore(StylairDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Add - Adds a new item to the database
    /// </summary>
    public void Add(OutfitItem item)
    {
        try
        {
            // If ItemId is not set, create a new GUID (but this is not the primary key, just a regular column)
            if (item.ItemId == Guid.Empty)
            {
                item.ItemId = Guid.NewGuid();
            }
            
            // Set the creation time (if not set, the database will insert it automatically)
            item.CreatedAt = DateTime.Now;
            
            // Add the item to the DbSet (this doesn't save to database yet)
            _context.ClosetItems.Add(item);
            
            // Save changes to the database - this is where the actual operation happens in PostgreSQL
            // EF Core translates this to SQL: INSERT INTO closet_items ...
            _context.SaveChanges();
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

    /// <summary>
    /// GetAll - Gets all items from the database
    /// </summary>
    public List<OutfitItem> GetAll()
    {
        // EF Core translates this to SQL: SELECT * FROM closet_items ORDER BY created_at DESC
        // OrderByDescending - orders from newest to oldest
        // ToList() - executes the query and returns results as List
        return _context.ClosetItems
            .OrderByDescending(x => x.CreatedAt)
            .ToList();
    }
}

