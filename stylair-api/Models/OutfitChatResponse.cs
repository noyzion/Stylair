namespace stylair_api.Models;

/// Response model for AI outfit chat
/// Contains AI-generated outfit suggestions
public class OutfitChatResponse
{
    /// List of outfit suggestions
    public List<OutfitSuggestion> Outfits { get; set; } = new();

    /// Indicates if the request was successful
    public bool Success { get; set; } = true;

    /// Error message if request failed
    public string? ErrorMessage { get; set; }
}

/// Single outfit suggestion
public class OutfitSuggestion
{
    /// Event name this outfit is for
    /// Example: "meeting", "workout", "party"
    public string Event { get; set; } = string.Empty;

    /// List of items in this outfit
    public List<OutfitItemSuggestion> Items { get; set; } = new();

    /// List of missing required items (if any)
    public List<string> MissingItems { get; set; } = new();

    /// Notes explaining why this outfit fits the event and weather
    public string Notes { get; set; } = string.Empty;
}

/// Single item suggestion within an outfit
public class OutfitItemSuggestion
{
    /// Item ID from the database (must exist in user's closet)
    public string Id { get; set; } = string.Empty;

    /// Item category
    public string Category { get; set; } = string.Empty;

    /// Short explanation why this item was chosen
    public string Reason { get; set; } = string.Empty;
}

