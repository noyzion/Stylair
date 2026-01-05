public interface IClosetItemStore
{
    void Add(OutfitItem item, string userId);
    List<OutfitItem> GetAll(string userId);
    void Delete(string itemImage, string userId);
    void Update(OutfitItem item);
}
