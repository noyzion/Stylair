public class ClosetService
{
    private readonly IClosetItemStore _store; //know how to save items

    public ClosetService(IClosetItemStore store)
    {
        _store = store;
    }

    public OutfitItem AddItem(AddItemRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.itemName))
            throw new ArgumentException("Item name is required");

        if (string.IsNullOrWhiteSpace(request.itemCategory))
            throw new ArgumentException("Item category is required");

        if (string.IsNullOrWhiteSpace(request.itemImage))
            throw new ArgumentException("Item image is required");

        var item = new OutfitItem  //making outfititem
        {
            ItemId = Guid.NewGuid(),  //id - backend decision 
            ItemName = request.itemName,
            ItemCategory = request.itemCategory,
            ItemImage = request.itemImage,
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

}
