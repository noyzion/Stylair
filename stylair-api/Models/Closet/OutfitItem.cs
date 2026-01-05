using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace stylair_api.Models;

public class OutfitItem
{
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string ItemCategory { get; set; } = string.Empty;
    public string ItemImage { get; set; } = string.Empty;
    public List<string> Style { get; set; } = new();
    public List<string> Colors { get; set; } = new();
    public List<string> Season { get; set; } = new();
    public string? Size { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
    
    [NotMapped]
    [JsonIgnore]
    public string itemId 
    { 
        get => ItemId.ToString(); 
        set => ItemId = Guid.TryParse(value, out var guid) ? guid : Guid.NewGuid(); 
    }
    
    [NotMapped]
    [JsonIgnore]
    public string itemName 
    { 
        get => ItemName; 
        set => ItemName = value; 
    }
    
    [NotMapped]
    [JsonIgnore]
    public string itemCategory 
    { 
        get => ItemCategory; 
        set => ItemCategory = value; 
    }
    
    [NotMapped]
    [JsonIgnore]
    public string itemImage 
    { 
        get => ItemImage; 
        set => ItemImage = value; 
    }
    
    [NotMapped]
    [JsonIgnore]
    public List<string> style 
    { 
        get => Style; 
        set => Style = value ?? new List<string>(); 
    }
    
    [NotMapped]
    [JsonIgnore]
    public List<string> colors 
    { 
        get => Colors; 
        set => Colors = value ?? new List<string>(); 
    }
    
    [NotMapped]
    [JsonIgnore]
    public List<string> season 
    { 
        get => Season; 
        set => Season = value ?? new List<string>(); 
    }
    
    [NotMapped]
    [JsonIgnore]
    public string? size 
    { 
        get => Size; 
        set => Size = value; 
    }
    
    [NotMapped]
    [JsonIgnore]
    public List<string> tags 
    { 
        get => Tags; 
        set => Tags = value ?? new List<string>(); 
    }
}

