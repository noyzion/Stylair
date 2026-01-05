public class SavedOutfit
{
    public Guid OutfitId { get; set; }
    public string OccasionLabel { get; set; } = string.Empty;
    public string ReasonText { get; set; } = string.Empty;
    public List<OutfitItem> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty; // User ID from Cognito (email or sub)
}