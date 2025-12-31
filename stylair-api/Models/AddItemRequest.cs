public class AddItemRequest
{
    public string itemName { get; set; } = string.Empty;
    public string itemCategory { get; set; } = string.Empty;
    public string itemImage { get; set; } = string.Empty;
    public List<string> style { get; set; } = new();
    public List<string> colors { get; set; } = new();
    public List<string> season { get; set; } = new();
    public string? size { get; set; }
    public List<string> tags { get; set; } = new();
}
