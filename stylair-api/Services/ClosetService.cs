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
            Season = request.season ?? new List<string>()
        };

        _store.Add(item);
        return item;
    }

    public List<OutfitItem> GetAllItems()
    {
        return _store.GetAll();
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