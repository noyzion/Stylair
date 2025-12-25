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
            itemId = Guid.NewGuid().ToString(),  //id - backend decision 
            itemName = request.itemName,
            itemCategory = request.itemCategory,
            itemImage = request.itemImage,
            style = request.style,
            colors = request.colors,
            season = request.season
        };

        _store.Add(item);
        return item;
    }
    
    public List<OutfitItem> GetAllItems()
    {
        return _store.GetAll();
    }

}
