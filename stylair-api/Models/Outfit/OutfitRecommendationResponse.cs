namespace stylair_api.Models;

public class OutfitRecommendationResponse
{
    public string occasionLabel { get; set; } = string.Empty;
    public List<OutfitItem> items { get; set; } = new();
    public string reasonText { get; set; } = string.Empty;
}

