namespace stylair_api.Models;

public class OutfitSuggestion
{
    public string Event { get; set; } = string.Empty;
    public List<OutfitItemSuggestion> Items { get; set; } = new();
    public List<string> MissingItems { get; set; } = new();
    public string Notes { get; set; } = string.Empty;
}

