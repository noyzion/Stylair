namespace stylair_api.Models;

public class AIImageAnalysisResponse
{
    public string Category { get; set; } = string.Empty;
    public List<string> Colors { get; set; } = new List<string>();
    public List<string> Styles { get; set; } = new List<string>();
    public List<string> Seasons { get; set; } = new List<string>();
    public double Confidence { get; set; }
    public string? Notes { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}

