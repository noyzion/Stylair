namespace stylair_api.Models;

public class OutfitChatResponse
{
    public List<OutfitSuggestion> Outfits { get; set; } = new();
    public bool Success { get; set; } = true;
    public string? ErrorMessage { get; set; }
}

