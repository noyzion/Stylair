using stylair_api.Models;

public interface ISavedOutfitStore
{
    void Add(SavedOutfit outfit, string userId);
    List<SavedOutfit> GetAll(string userId);
    void Delete(Guid outfitId, string userId);
    void DeleteOutfitsContainingItem(string itemImage, string userId);
}

