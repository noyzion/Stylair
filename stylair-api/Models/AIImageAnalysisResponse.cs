namespace stylair_api.Models;

/// <summary>
/// Response model for AI image analysis
/// Contains structured analysis of clothing item from OpenAI
/// </summary>
public class AIImageAnalysisResponse
{
    /// Category of the clothing item (must be from predefined list)
    /// Examples: "Shirt", "Pants", "Dress", "Jacket", etc.
    public string Category { get; set; } = string.Empty;

    /// Colors of the item (must be from predefined list)
    /// Can contain multiple colors if the item has multiple colors
    /// Examples: ["Black"], ["White", "Blue"], ["Red", "Yellow", "Green"]
    /// IMPORTANT: If item has multiple colors, list ALL colors. Do NOT use "Multicolor" - list each color separately.
    public List<string> Colors { get; set; } = new List<string>();
    
    /// Styles/Type of the item (must be from predefined list)
    /// Can contain multiple styles if applicable
    /// Examples: ["Casual"], ["Formal", "Business"], ["Sporty", "Athletic"]
    public List<string> Styles { get; set; } = new List<string>();
    
    /// Season appropriateness (must be from predefined list)
    /// Can contain multiple seasons if applicable
    /// Examples: ["Spring"], ["Summer", "Fall"], ["All Season"]
    public List<string> Seasons { get; set; } = new List<string>();
    /// Confidence level (0.0 to 1.0)
    /// Lower confidence indicates uncertainty in identification
    public double Confidence { get; set; }
    /// Additional notes or warnings
    /// Examples: "Multiple items detected in image", "Uncertain identification"
    public string? Notes { get; set; }
    /// Indicates if the analysis was successful
    public bool Success { get; set; }
    /// Error message if analysis failed
    public string? ErrorMessage { get; set; }
}

