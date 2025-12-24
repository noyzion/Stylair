public class OutfitRecommendationResponse
{
    public string occasionLabel { get; set; } = string.Empty; // e.g., "לאימון:", "לפגישה:"
    public List<OutfitItem> items { get; set; } = new();
    public string reasonText { get; set; } = string.Empty;
}


//class to return a list of outfit recommendations (list of OutfitRecommendationResponse)
public class OutfitRecommendationsListResponse
{
    public List<OutfitRecommendationResponse> outfits { get; set; } = new();
}
