namespace stylair_api.Models;

/// Request model for AI image analysis
/// Contains either image URL or base64 image data
public class AIImageAnalysisRequest
{
    /// Image URL (publicly accessible URL to the image)
    /// Either ImageUrl or ImageBase64 must be provided
    public string? ImageUrl { get; set; }
    /// Base64 encoded image data (format: data:image/jpeg;base64,...)
    /// Either ImageUrl or ImageBase64 must be provided
    public string? ImageBase64 { get; set; }
}

