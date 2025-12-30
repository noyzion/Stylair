using Microsoft.EntityFrameworkCore;
using stylair_api.Data;

namespace stylair_api.Repositories;

/// PostgresSavedOutfitStore - Repository for saving and retrieving saved outfits
public class PostgresSavedOutfitStore : ISavedOutfitStore
{
    private readonly StylairDbContext _context;

    public PostgresSavedOutfitStore(StylairDbContext context)
    {
        _context = context;
    }

    /// Add - Saves a new outfit to the database
    public void Add(SavedOutfit outfit)
    {
        try
        {
            // If OutfitId is not set, create a new GUID
            if (outfit.OutfitId == Guid.Empty)
            {
                outfit.OutfitId = Guid.NewGuid();
            }

            // Set the creation time
            outfit.CreatedAt = DateTime.UtcNow;

            // Add the outfit to the DbSet
            _context.SavedOutfits.Add(outfit);

            // Save changes to the database
            _context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PostgresSavedOutfitStore.Add: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }

    /// GetAll - Gets all saved outfits from the database
    public List<SavedOutfit> GetAll()
    {
        // Order by newest first
        return _context.SavedOutfits
            .OrderByDescending(x => x.CreatedAt)
            .ToList();
    }

    /// Delete - Deletes an outfit from the database by outfitId
    public void Delete(Guid outfitId)
    {
        try
        {
            var outfit = _context.SavedOutfits.Find(outfitId);
            if (outfit != null)
            {
                _context.SavedOutfits.Remove(outfit);
                _context.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PostgresSavedOutfitStore.Delete: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }

    /// DeleteOutfitsContainingItem - Deletes all outfits that contain the given item image
    public void DeleteOutfitsContainingItem(string itemImage)
    {
        try
        {
            foreach (var outfit in _context.SavedOutfits)
            {
                foreach (var item in outfit.Items)
                {
                    if (item.ItemImage == itemImage)
                    {
                        _context.SavedOutfits.Remove(outfit);
                    }
                }
            }
            _context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PostgresSavedOutfitStore.DeleteOutfitsContainingItem: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }
}

