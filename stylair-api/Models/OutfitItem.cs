public class OutfitItem
{
    public string itemId { get; set; } = string.Empty;
    public string itemName { get; set; } = string.Empty;
    public string itemCategory { get; set; } = string.Empty;
    public string itemImage { get; set; } = string.Empty;
    public List<string> style { get; set; } = new();
    public List<string> colors { get; set; } = new();
    public string season { get; set; } = string.Empty;
}