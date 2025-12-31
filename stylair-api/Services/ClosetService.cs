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

    public async Task<OutfitItem> AddItemAsync(AddItemRequest request)
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
            Tags = request.tags ?? new List<string>()  // Default to empty list if null/empty
        };

        Console.WriteLine($"Adding item with Size: '{item.Size}', Tags: [{string.Join(", ", item.Tags)}]");

        _store.Add(item);
        return item;
    }

    public List<OutfitItem> GetAllItems()
    {
        var items = _store.GetAll();
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

    public async Task DeleteItemAsync(string itemImage)
    {
        if (string.IsNullOrWhiteSpace(itemImage))
            throw new ArgumentException("Item image is required");

        // Delete from database first
        _store.Delete(itemImage);
        _savedOutfitStore.DeleteOutfitsContainingItem(itemImage);

        // Delete from Supabase Storage (if it's a Supabase URL)
        if (itemImage.Contains("supabase.co/storage"))
        {
            await _storageService.DeleteImageAsync(itemImage);
        }
    }
}