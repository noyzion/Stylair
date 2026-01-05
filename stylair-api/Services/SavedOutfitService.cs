using stylair_api.Repositories;

public class SavedOutfitService
{
    private readonly ISavedOutfitStore _store;

    public SavedOutfitService(ISavedOutfitStore store)
    {
        _store = store;
    }

    public SavedOutfit SaveOutfit(OutfitRecommendationResponse outfitResponse, string userId)
    {
        if (outfitResponse.items == null || outfitResponse.items.Count == 0)
            throw new ArgumentException("Outfit must contain at least one item");

        var savedOutfit = new SavedOutfit
        {
            OutfitId = Guid.NewGuid(),
            OccasionLabel = outfitResponse.occasionLabel ?? string.Empty,
            ReasonText = outfitResponse.reasonText ?? string.Empty,
            Items = outfitResponse.items,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _store.Add(savedOutfit, userId);
        return savedOutfit;
    }

    public List<SavedOutfit> GetAllSavedOutfits(string userId)
    {
        return _store.GetAll(userId);
    }

    public void DeleteOutfit(Guid outfitId, string userId)
    {
        if (outfitId == Guid.Empty)
            throw new ArgumentException("Outfit ID is required");

        _store.Delete(outfitId, userId);
    }
}

