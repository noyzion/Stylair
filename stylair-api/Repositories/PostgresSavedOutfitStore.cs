using Microsoft.EntityFrameworkCore;
using stylair_api.Data;
using stylair_api.Models;

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
    public void Add(SavedOutfit outfit, string userId)
    {
        try
        {
            // If OutfitId is not set, create a new GUID
            if (outfit.OutfitId == Guid.Empty)
            {
                outfit.OutfitId = Guid.NewGuid();
            }

            // Set the user ID (required for multi-user support)
            outfit.UserId = userId;

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

    /// GetAll - Gets all saved outfits from the database for a specific user
    public List<SavedOutfit> GetAll(string userId)
    {
        // Filter by user_id and order by newest first
        return _context.SavedOutfits
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToList();
    }

    /// Delete - Deletes an outfit from the database by outfitId
    /// Also verifies that the user owns the outfit before deleting
    public void Delete(Guid outfitId, string userId)
    {
        try
        {
            var outfit = _context.SavedOutfits.Find(outfitId);
            if (outfit == null)
            {
                throw new ArgumentException($"Outfit with ID '{outfitId}' not found");
            }
            
            // Verify that the user owns this outfit
            if (outfit.UserId != userId)
            {
                throw new UnauthorizedAccessException("You don't have permission to delete this outfit. It belongs to another user.");
            }
            
            _context.SavedOutfits.Remove(outfit);
            _context.SaveChanges();
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

    /// DeleteOutfitsContainingItem - Deletes all outfits that contain the given item image (for a specific user)
    public void DeleteOutfitsContainingItem(string itemImage, string userId)
    {
        try
        {
            // Load all outfits for the user first
            var allOutfits = _context.SavedOutfits
                .Where(x => x.UserId == userId)
                .ToList();
            
            // Filter outfits that contain the item image
            var outfitsToDelete = allOutfits
                .Where(outfit => outfit.Items != null && outfit.Items.Any(item => item.ItemImage == itemImage))
                .ToList();
            
            foreach (var outfit in outfitsToDelete)
            {
                _context.SavedOutfits.Remove(outfit);
            }
            
            if (outfitsToDelete.Count > 0)
            {
                _context.SaveChanges();
            }
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

