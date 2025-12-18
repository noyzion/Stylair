public class OutfitRecommendationResponse
{
    public string outfitId { get; set; } = string.Empty;
    public List<OutfitItem> items { get; set; } = new();
    public string reasonText { get; set; } = string.Empty;
}