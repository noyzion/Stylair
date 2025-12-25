public class MockClosetItemStore : IClosetItemStore
{
    private readonly List<OutfitItem> _items = new(); //our db

    public void Add(OutfitItem item)
    {
        _items.Add(item);
    }

    public List<OutfitItem> GetAll()
    {
        return _items;
    }
}
