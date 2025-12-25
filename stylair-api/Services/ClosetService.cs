public class ClosetService
{
    private readonly IClosetItemStore _store; //know how to save items

    public ClosetService(IClosetItemStore store)
    {
        _store = store;
    }

    public void AddItem(AddItemRequest request)
    {
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
    }
}
