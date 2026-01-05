namespace stylair_api.Services;

public class ClosetService
{
    private readonly IClosetItemStore _store; //know how to save items
    private readonly ISavedOutfitStore _savedOutfitStore; //know how to save outfits
    private readonly SupabaseStorageService _storageService; //know how to upload images to Supabase Storage

    public ClosetService(IClosetItemStore store, ISavedOutfitStore savedOutfitStore, SupabaseStorageService storageService)
    {
        _store = store;
        _savedOutfitStore = savedOutfitStore;
        _storageService = storageService;
    }

    public async Task<OutfitItem> AddItemAsync(AddItemRequest request, string userId)
    {
        if (string.IsNullOrWhiteSpace(request.itemName))
            throw new ArgumentException("Item name is required");

        if (string.IsNullOrWhiteSpace(request.itemCategory))
            throw new ArgumentException("Item category is required");

        if (string.IsNullOrWhiteSpace(request.itemImage))
            throw new ArgumentException("Item image is required");

        // Upload image to Supabase Storage and get the public URL
        var imageUrl = await _storageService.UploadImageAsync(request.itemImage);

        var item = new OutfitItem  //making outfititem
        {
            ItemId = Guid.NewGuid(),  //id - backend decision 
            ItemName = request.itemName,
            ItemCategory = request.itemCategory,
            ItemImage = imageUrl, // Store the Supabase Storage URL instead of base64/URI
            Style = request.style ?? new List<string>(),
            Colors = request.colors ?? new List<string>(),
            Season = request.season ?? new List<string>(),
            Size = request.size,  // Can be null if not provided
            Tags = request.tags ?? new List<string>(),  // Default to empty list if null/empty
            UserId = userId // 👈 שמירת user_id
        };

        Console.WriteLine($"Adding item with Size: '{item.Size}', Tags: [{string.Join(", ", item.Tags)}]");

        _store.Add(item, userId);
        return item;
    }

    public List<OutfitItem> GetAllItems(string userId)
    {
        var items = _store.GetAll(userId);
        // Filter out "new" tag from items older than 30 days and update database
        foreach (var item in items)
        {
            if (FilterNewTag(item))
            {
                // If tag was removed, update the item in the database
                _store.Update(item);
            }
        }
        return items;
    }

    private bool FilterNewTag(OutfitItem item)
    {
        // If item has "new" tag and is older than 30 days, remove the tag
        if (item.Tags != null && item.Tags.Contains("new", StringComparer.OrdinalIgnoreCase))
        {
            // CreatedAt is stored as local time (Unspecified), so compare with local time
            var now = DateTime.Now;
            var created = item.CreatedAt;
            
            // Handle Unspecified DateTime by treating it as local time
            if (created.Kind == DateTimeKind.Unspecified)
            {
                created = DateTime.SpecifyKind(created, DateTimeKind.Local);
            }
            
            var daysSinceCreation = (now - created).TotalDays;
            if (daysSinceCreation > 30)
            {
                var originalCount = item.Tags.Count;
                item.Tags = item.Tags.Where(t => !t.Equals("new", StringComparison.OrdinalIgnoreCase)).ToList();
                // Return true if tag was actually removed
                return item.Tags.Count < originalCount;
            }
        }
        return false;
    }

    public async Task DeleteItemAsync(string itemImage, string userId)
    {
        if (string.IsNullOrWhiteSpace(itemImage))
            throw new ArgumentException("Item image is required");

        // Delete from database first (this also verifies ownership)
        _store.Delete(itemImage, userId);
        _savedOutfitStore.DeleteOutfitsContainingItem(itemImage, userId);

        // Delete from Supabase Storage (if it's a Supabase URL)
        // This is non-critical - if it fails, the item is already deleted from DB
        if (itemImage.Contains("supabase.co/storage"))
        {
            try
            {
                await _storageService.DeleteImageAsync(itemImage);
            }
            catch (Exception ex)
            {
                // Log warning but don't throw - item is already deleted from DB
                Console.WriteLine($"Warning: Failed to delete image from Supabase Storage: {ex.Message}");
                // Don't rethrow - the item is already deleted from the database
            }
        }
    }

    public async Task<OutfitItem> UpdateItemAsync(AddItemRequest request, string itemImage, string userId)
    {
        if (string.IsNullOrWhiteSpace(itemImage))
            throw new ArgumentException("Item image is required");

        if (string.IsNullOrWhiteSpace(request.itemName))
            throw new ArgumentException("Item name is required");

        if (string.IsNullOrWhiteSpace(request.itemCategory))
            throw new ArgumentException("Item category is required");

        // Get existing item to verify ownership
        var existingItems = _store.GetAll(userId);
        var existingItem = existingItems.FirstOrDefault(i => i.ItemImage == itemImage);
        
        if (existingItem == null)
        {
            throw new ArgumentException($"Item with image '{itemImage}' not found or you don't have permission to edit it");
        }

        // Verify ownership
        if (existingItem.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to edit this item. It belongs to another user.");
        }

        // Handle image update - if new image is provided and different, upload it
        string finalImageUrl = itemImage; // Keep existing image by default
        if (!string.IsNullOrWhiteSpace(request.itemImage) && request.itemImage != itemImage)
        {
            // Check if it's a new image (base64 or different URL)
            if (request.itemImage.StartsWith("data:image") || request.itemImage.StartsWith("file://") || 
                !request.itemImage.Contains("supabase.co/storage"))
            {
                // New image provided - upload it
                finalImageUrl = await _storageService.UploadImageAsync(request.itemImage);
                
                // Delete old image from Supabase Storage if it was stored there
                if (itemImage.Contains("supabase.co/storage"))
                {
                    try
                    {
                        await _storageService.DeleteImageAsync(itemImage);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Warning: Failed to delete old image from Supabase Storage: {ex.Message}");
                        // Don't throw - new image is already uploaded
                    }
                }
            }
            else
            {
                // Same URL or already uploaded image
                finalImageUrl = request.itemImage;
            }
        }

        // Update item properties
        existingItem.ItemName = request.itemName;
        existingItem.ItemCategory = request.itemCategory;
        existingItem.ItemImage = finalImageUrl;
        existingItem.Style = request.style ?? new List<string>();
        existingItem.Colors = request.colors ?? new List<string>();
        existingItem.Season = request.season ?? new List<string>();
        existingItem.Size = request.size;
        existingItem.Tags = request.tags ?? new List<string>();

        Console.WriteLine($"Updating item with Size: '{existingItem.Size}', Tags: [{string.Join(", ", existingItem.Tags)}]");

        _store.Update(existingItem);
        return existingItem;
    }
}