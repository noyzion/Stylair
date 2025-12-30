public interface ISavedOutfitStore
{
    void Add(SavedOutfit outfit);
    List<SavedOutfit> GetAll();
    void Delete(Guid outfitId);
    void DeleteOutfitsContainingItem(string itemImage);
}

