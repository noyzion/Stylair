using stylair_api.Repositories;

public class SavedOutfitService
{
    private readonly ISavedOutfitStore _store;

    public SavedOutfitService(ISavedOutfitStore store)
    {
        _store = store;
    }

    public SavedOutfit SaveOutfit(OutfitRecommendationResponse outfitResponse)
    {
        if (outfitResponse.items == null || outfitResponse.items.Count == 0)
            throw new ArgumentException("Outfit must contain at least one item");

        var savedOutfit = new SavedOutfit
        {
            OutfitId = Guid.NewGuid(),
            OccasionLabel = outfitResponse.occasionLabel ?? string.Empty,
            ReasonText = outfitResponse.reasonText ?? string.Empty,
            Items = outfitResponse.items,
            CreatedAt = DateTime.UtcNow
        };

        _store.Add(savedOutfit);
        return savedOutfit;
    }

    public List<SavedOutfit> GetAllSavedOutfits()
    {
        return _store.GetAll();
    }

    public void DeleteOutfit(Guid outfitId)
    {
        if (outfitId == Guid.Empty)
            throw new ArgumentException("Outfit ID is required");

        _store.Delete(outfitId);
    }
}

