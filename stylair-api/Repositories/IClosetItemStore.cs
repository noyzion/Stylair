public interface IClosetItemStore
{
    void Add(OutfitItem item);
    List<OutfitItem> GetAll();
    void Delete(string itemImage);
    void Update(OutfitItem item);
}
