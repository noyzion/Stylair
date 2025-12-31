using Microsoft.EntityFrameworkCore;
using stylair_api.Data;
using System.Linq;

namespace stylair_api.Repositories;

/// PostgresClosetItemStore - This is the Repository that connects to PostgreSQL
/// It implements IClosetItemStore and uses StylairDbContext to perform database operations
public class PostgresClosetItemStore : IClosetItemStore, IOutfitStore
{
    /// _context - This is the DbContext that connects us to PostgreSQL
    /// It is injected through Dependency Injection in Program.cs
    private readonly StylairDbContext _context;

    /// Constructor - Receives the DbContext through Dependency Injection
    public PostgresClosetItemStore(StylairDbContext context)
    {
        _context = context;
    }

    /// Add - Adds a new item to the database
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

    /// GetAll - Gets all items from the database
    public List<OutfitItem> GetAll()
    {
        // EF Core translates this to SQL: SELECT * FROM closet_items ORDER BY created_at DESC
        // OrderByDescending - orders from newest to oldest
        // ToList() - executes the query and returns results as List
        return _context.ClosetItems
            .OrderByDescending(x => x.CreatedAt)
            .ToList();
    }

    /// Delete - Deletes an item from the database by itemImage (primary key)
    public void Delete(string itemImage)
    {
        try
        {
            var item = _context.ClosetItems.Find(itemImage);
            if (item != null)
            {
                _context.ClosetItems.Remove(item);
                _context.SaveChanges();
            }
            else
            {
                throw new ArgumentException($"Item with image '{itemImage}' not found");
            }
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

    public bool IsClosetEmpty()
    {
        return _context.ClosetItems.Count() == 0;
    }

    /// Update - Updates an existing item in the database
    public void Update(OutfitItem item)
    {
        try
        {
            var existingItem = _context.ClosetItems.Find(item.ItemImage);
            if (existingItem != null)
            {
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
            else
            {
                throw new ArgumentException($"Item with image '{item.ItemImage}' not found");
            }
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

    public OutfitRecommendationResponse GetOutfitByCriteria(OutfitCriteria criteria)
    {
        List<OutfitItem> items = _context.ClosetItems.ToList();
        var returnedOutfit = new OutfitRecommendationResponse();

        // Filter items based on criteria (style, colors, season)
        // Go through all items and check if they match the criteria
        List<OutfitItem> filteredItems = new List<OutfitItem>();

        foreach (var item in items)
        {
            // Check style: if criteria has no styles, accept all. Otherwise, check if item has matching style
            bool styleMatch = true;
            if (criteria.style.Count > 0)
            {
                styleMatch = false;
                foreach (var itemStyle in item.style)
                {
                    foreach (var requestedStyle in criteria.style)
                    {
                        if (itemStyle == requestedStyle)
                        {
                            styleMatch = true;
                            break;
                        }
                    }
                    if (styleMatch) break;
                }
            }

            // Check colors: if criteria has no colors, accept all. Otherwise, check if item has matching color
            bool colorMatch = true;
            if (criteria.colors.Count > 0)
            {
                colorMatch = false;
                foreach (var itemColor in item.colors)
                {
                    foreach (var requestedColor in criteria.colors)
                    {
                        if (itemColor.ToLower() == requestedColor.ToLower())
                        {
                            colorMatch = true;
                            break;
                        }
                    }
                    if (colorMatch) break;
                }
            }

            // Check season: if criteria season is "all" or item season contains "all", accept. Otherwise, must match
            bool seasonMatch = false;
            if (criteria.season == "all" || item.season.Contains("all"))
            {
                seasonMatch = true;
            }
            else if (item.season.Contains(criteria.season))
            {
                seasonMatch = true;
            }

            // If all three conditions match, add this item to filtered list
            if (styleMatch && colorMatch && seasonMatch)
            {
                filteredItems.Add(item);
            }
        }

        // Group items by category to ensure we have one of each core type (bottom, top, shoes)
        // Note: accessories and dress are optional categories and not included in core outfit recommendations
        // Find one item from each core category (bottom, top, shoes)
        OutfitItem? bottomItem = null;
        OutfitItem? topItem = null;
        OutfitItem? shoesItem = null;

        foreach (var item in filteredItems)
        {
            if (item.itemCategory == "bottom" && bottomItem == null)
            {
                bottomItem = item;
            }
            else if (item.itemCategory == "top" && topItem == null)
            {
                topItem = item;
            }
            else if (item.itemCategory == "shoes" && shoesItem == null)
            {
                shoesItem = item;
            }
        }

        // Add one item from each category if we found them
        if (bottomItem != null)
            returnedOutfit.items.Add(bottomItem);
        if (topItem != null)
            returnedOutfit.items.Add(topItem);
        if (shoesItem != null)
            returnedOutfit.items.Add(shoesItem);

        if (returnedOutfit.items.Count == 0)
        {
            returnedOutfit.reasonText = "there are no matching items in the closet";
        }

        return returnedOutfit;
    }
}

