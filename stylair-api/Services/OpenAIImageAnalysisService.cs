using System.Text.Json;
using System.Text;
using System.Linq;
using stylair_api.Models;

namespace stylair_api.Services;

/// <summary>
/// Service for analyzing clothing images using OpenAI Vision API
/// Handles secure API key management and structured response parsing
/// </summary>
public class OpenAIImageAnalysisService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;

    // Predefined lists - OpenAI must choose only from these values
    private static readonly string[] ValidCategories = new[]
    {
        "Shirt", "T-Shirt", "Blouse", "Top", "Pants", "Jeans", "Shorts", "Dress", "Skirt",
        "Jacket", "Coat", "Sweater", "Hoodie", "Cardigan", "Vest", "Suit",
        "Shoes", "Boots", "Sneakers", "Sandals", "Heels", "Accessories", "Hat", "Bag"
    };

    private static readonly string[] ValidColors = new[]
    {
        "Black", "White", "Gray", "Grey", "Navy", "Blue", "Light Blue", "Dark Blue",
        "Red", "Pink", "Purple", "Green", "Light Green", "Dark Green", "Yellow",
        "Orange", "Brown", "Beige", "Tan", "Cream", "Ivory", "Burgundy", "Maroon",
        "Teal", "Turquoise", "Coral", "Lavender", "Olive", "Khaki", "Gold", "Silver",
        "Bronze", "Copper", "Rose Gold", "Champagne", "Peach", "Salmon", "Mint",
        "Emerald", "Ruby", "Sapphire", "Amber", "Charcoal", "Slate", "Multicolor"
    };

    private static readonly string[] ValidStyles = new[]
    {
        "Casual", "Formal", "Business", "Sporty", "Elegant", "Vintage", "Modern",
        "Classic", "Bohemian", "Minimalist", "Streetwear", "Athletic", "Romantic"
    };

    private static readonly string[] ValidSeasons = new[]
    {
        "Spring", "Summer", "Fall", "Winter", "All Season"
    };

    /// Constructor - validates API key and initializes OpenAI client
    public OpenAIImageAnalysisService(IConfiguration configuration)
    {
        // Get API key from environment variable (SECURE - never hardcode!)
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
            ?? throw new InvalidOperationException(
                "OPENAI_API_KEY environment variable is required but not set. " +
                "Please set it before running the application. " +
                "⚠️ NEVER commit API keys to GitHub - OpenAI will disable them!");

        // Validate API key format (starts with 'sk-')
        if (!_apiKey.StartsWith("sk-", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Invalid OPENAI_API_KEY format. API key should start with 'sk-'");
        }

        // Initialize HTTP client for OpenAI API
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
    }

    /// Analyzes a clothing image using OpenAI Vision API
    public async Task<AIImageAnalysisResponse> AnalyzeImageAsync(AIImageAnalysisRequest request)
    {
        try
        {
            // Validate request - must have either URL or base64
            if (string.IsNullOrWhiteSpace(request.ImageUrl) && 
                string.IsNullOrWhiteSpace(request.ImageBase64))
            {
                return new AIImageAnalysisResponse
                {
                    Success = false,
                    ErrorMessage = "Either ImageUrl or ImageBase64 must be provided"
                };
            }

            // Prepare image content for OpenAI
            var imageUrl = await PrepareImageUrlAsync(request);

            // Create system prompt with strict rules
            var systemPrompt = CreateSystemPrompt();

            // Prepare request body for OpenAI API
            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = new List<object>
                {
                    new { role = "system", content = systemPrompt },
                    new
                    {
                        role = "user",
                        content = new List<object>
                        {
                            new { type = "text", text = "Analyze this clothing item and return the analysis in JSON format." },
                            new
                            {
                                type = "image_url",
                                image_url = new { url = imageUrl }
                            }
                        }
                    }
                },
                max_tokens = 150,
                response_format = new { type = "json_object" }
            };

            // Call OpenAI API
            var jsonContent = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(
                "https://api.openai.com/v1/chat/completions",
                jsonContent
            );

            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            var responseDoc = JsonDocument.Parse(responseJson);
            var responseText = responseDoc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? string.Empty;

            // Parse JSON response
            var analysis = ParseOpenAIResponse(responseText);

            return analysis;
        }
        catch (Exception ex)
        {
            // Log error but don't expose internal details to client
            Console.WriteLine($"Error in OpenAI analysis: {ex.Message}");
            
            return new AIImageAnalysisResponse
            {
                Success = false,
                ErrorMessage = "Failed to analyze image. Please try again."
            };
        }
    }

    /// Prepares image content from URL or base64 for OpenAI API
    private async Task<string> PrepareImageUrlAsync(AIImageAnalysisRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            // Use image URL directly
            return request.ImageUrl;
        }
        else if (!string.IsNullOrWhiteSpace(request.ImageBase64))
        {
            // Extract base64 data (remove data:image/jpeg;base64, prefix if present)
            var base64Data = request.ImageBase64;
            if (base64Data.Contains(','))
            {
                base64Data = base64Data.Split(',')[1];
            }

            // Return base64 image URL format
            // OpenAI-DotNet expects data:image/jpeg;base64,{base64} format
            var mimeType = "image/jpeg"; // Default, could be detected from base64 prefix
            if (request.ImageBase64.StartsWith("data:image/"))
            {
                var parts = request.ImageBase64.Split(';');
                if (parts.Length > 0)
                {
                    mimeType = parts[0].Substring(5); // Remove "data:" prefix
                }
            }
            
            return $"data:{mimeType};base64,{base64Data}";
        }
        else
        {
            throw new ArgumentException("Either ImageUrl or ImageBase64 must be provided");
        }
    }

    /// Creates system prompt with strict rules for OpenAI
    private string CreateSystemPrompt()
    {
        return $@"You are a clothing item analyzer. Analyze the image and return ONLY valid values from the predefined lists.

REQUIRED OUTPUT FORMAT (JSON):
{{
  ""category"": ""[MUST be from categories list - single value]"",
  ""colors"": [""[MUST be from colors list - array of colors]"", ...],
  ""styles"": [""[MUST be from styles list - array of styles]"", ...],
  ""seasons"": [""[MUST be from seasons list - array of seasons]"", ...],
  ""confidence"": [0.0-1.0],
  ""notes"": ""[optional: warnings or additional info]""
}}

VALID CATEGORIES (choose ONLY ONE from this list):
{string.Join(", ", ValidCategories)}

CATEGORY GUIDELINES:
- For any type of top/shirt/upper body garment: Use ""Top"", ""Shirt"", ""T-Shirt"", ""Blouse"", ""Sweater"", ""Hoodie"", ""Cardigan"", ""Jacket"", ""Coat"", or ""Vest"" depending on the specific type
- If unsure about the exact type of top, use ""Top"" as a safe default
- For sportswear tops, use ""Top"" or ""T-Shirt"" depending on the style
- For formal tops, use ""Shirt"" or ""Blouse""

VALID COLORS (choose ALL applicable colors from this list - use array):
{string.Join(", ", ValidColors)}

VALID STYLES (choose ALL applicable styles from this list - use array):
{string.Join(", ", ValidStyles)}

VALID SEASONS (choose ALL applicable seasons from this list - use array):
{string.Join(", ", ValidSeasons)}

CRITICAL RULES FOR COLORS:
- If the item has MULTIPLE colors, list ALL colors in the array (e.g., [""Red"", ""White"", ""Blue""])
- DO NOT use ""Multicolor"" - instead, list each individual color you can see
- If the item has a pattern with multiple colors, list all the distinct colors
- Minimum 1 color, maximum all colors you can identify
- Example: A red and white striped shirt should return [""Red"", ""White""], NOT [""Multicolor""]

RULES FOR STYLES AND SEASONS:
- You can select MULTIPLE styles if the item fits multiple categories (e.g., [""Casual"", ""Sporty""])
- You can select MULTIPLE seasons if the item is appropriate for multiple seasons (e.g., [""Spring"", ""Summer""])
- CRITICAL: If you select ""All Season"", DO NOT include any other specific seasons (Spring, Summer, Fall, Winter) - ""All Season"" already means it fits all seasons
- If the item fits specific seasons, list only those specific seasons (e.g., [""Spring"", ""Summer""]) - do NOT add ""All Season""
- Use ""All Season"" ONLY if the item truly fits all four seasons equally
- Minimum 1 value for each, maximum all applicable values

GENERAL RULES:
1. You MUST choose values ONLY from the provided lists - DO NOT invent new categories, colors, styles, or seasons
2. For colors: Be flexible and match similar shades (e.g., ""golden"" → ""Gold"", ""silvery"" → ""Silver"", ""navy blue"" → ""Navy"")
3. For categories: If you see a top/shirt/upper garment and unsure of exact type, use ""Top"" as a safe default
4. If you're not certain about identification, set confidence to 0.5 or lower
5. If multiple items are detected in the image, mention it in the 'notes' field
6. If the image doesn't contain a clothing item, set confidence to 0.0 and explain in notes
7. Return ONLY valid JSON, no additional text or explanations
8. Confidence scale: 1.0 = very certain, 0.5 = somewhat certain, 0.0 = uncertain
9. IMPORTANT: When in doubt about a color or category, choose the closest match from the lists rather than inventing new values";
    }

    private AIImageAnalysisResponse ParseOpenAIResponse(string responseText)
    {
        try
        {
            // Clean response text (remove markdown code blocks if present)
            var cleanText = responseText.Trim();
            if (cleanText.StartsWith("```json"))
            {
                cleanText = cleanText.Substring(7);
            }
            if (cleanText.StartsWith("```"))
            {
                cleanText = cleanText.Substring(3);
            }
            if (cleanText.EndsWith("```"))
            {
                cleanText = cleanText.Substring(0, cleanText.Length - 3);
            }
            cleanText = cleanText.Trim();

            // Parse JSON
            var jsonDoc = JsonDocument.Parse(cleanText);
            var root = jsonDoc.RootElement;

            // Extract values - support both old format (single values) and new format (arrays)
            var category = root.GetProperty("category").GetString() ?? string.Empty;
            
            // Extract colors - support both "color" (single) and "colors" (array)
            var colors = new List<string>();
            if (root.TryGetProperty("colors", out var colorsElement) && colorsElement.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var colorElement in colorsElement.EnumerateArray())
                {
                    var colorValue = colorElement.GetString();
                    if (!string.IsNullOrWhiteSpace(colorValue))
                    {
                        colors.Add(colorValue);
                    }
                }
            }
            else if (root.TryGetProperty("color", out var colorElement))
            {
                // Backward compatibility: support single "color" field
                var colorValue = colorElement.GetString();
                if (!string.IsNullOrWhiteSpace(colorValue))
                {
                    colors.Add(colorValue);
                }
            }

            // Extract styles - support both "style" (single) and "styles" (array)
            var styles = new List<string>();
            if (root.TryGetProperty("styles", out var stylesElement) && stylesElement.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var styleElement in stylesElement.EnumerateArray())
                {
                    var styleValue = styleElement.GetString();
                    if (!string.IsNullOrWhiteSpace(styleValue))
                    {
                        styles.Add(styleValue);
                    }
                }
            }
            else if (root.TryGetProperty("style", out var styleElement))
            {
                // Backward compatibility: support single "style" field
                var styleValue = styleElement.GetString();
                if (!string.IsNullOrWhiteSpace(styleValue))
                {
                    styles.Add(styleValue);
                }
            }

            // Extract seasons - support both "season" (single) and "seasons" (array)
            var seasons = new List<string>();
            if (root.TryGetProperty("seasons", out var seasonsElement) && seasonsElement.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var seasonElement in seasonsElement.EnumerateArray())
                {
                    var seasonValue = seasonElement.GetString();
                    if (!string.IsNullOrWhiteSpace(seasonValue))
                    {
                        seasons.Add(seasonValue);
                    }
                }
            }
            else if (root.TryGetProperty("season", out var seasonElement))
            {
                // Backward compatibility: support single "season" field
                var seasonValue = seasonElement.GetString();
                if (!string.IsNullOrWhiteSpace(seasonValue))
                {
                    seasons.Add(seasonValue);
                }
            }

            var confidence = root.TryGetProperty("confidence", out var confElement) 
                ? confElement.GetDouble() 
                : 0.5;
            var notes = root.TryGetProperty("notes", out var notesElement) 
                ? notesElement.GetString() 
                : null;

            // Validate category - try to find close match first
            string validatedCategory = category;
            if (!ValidCategories.Contains(category, StringComparer.OrdinalIgnoreCase))
            {
                // Try to find a close match for common variations
                var categoryLower = category.ToLowerInvariant();
                if (categoryLower.Contains("top") || categoryLower.Contains("shirt") || 
                    categoryLower.Contains("blouse") || categoryLower.Contains("tank") ||
                    categoryLower.Contains("tee") || categoryLower.Contains("sweater"))
                {
                    // Try to match to a specific top category
                    if (categoryLower.Contains("hoodie") || categoryLower.Contains("sweatshirt"))
                        validatedCategory = "Hoodie";
                    else if (categoryLower.Contains("sweater") || categoryLower.Contains("pullover"))
                        validatedCategory = "Sweater";
                    else if (categoryLower.Contains("cardigan"))
                        validatedCategory = "Cardigan";
                    else if (categoryLower.Contains("jacket") || categoryLower.Contains("blazer"))
                        validatedCategory = "Jacket";
                    else if (categoryLower.Contains("coat"))
                        validatedCategory = "Coat";
                    else if (categoryLower.Contains("vest"))
                        validatedCategory = "Vest";
                    else if (categoryLower.Contains("tee") || categoryLower.Contains("t-shirt"))
                        validatedCategory = "T-Shirt";
                    else if (categoryLower.Contains("blouse") || categoryLower.Contains("shirt"))
                        validatedCategory = "Shirt";
                    else
                        validatedCategory = "Top"; // Default fallback for tops
                }
                else if (categoryLower.Contains("pant") || categoryLower.Contains("trouser"))
                {
                    validatedCategory = categoryLower.Contains("jean") ? "Jeans" : "Pants";
                }
                else if (categoryLower.Contains("short"))
                {
                    validatedCategory = "Shorts";
                }
                else if (categoryLower.Contains("dress"))
                {
                    validatedCategory = "Dress";
                }
                else if (categoryLower.Contains("skirt"))
                {
                    validatedCategory = "Skirt";
                }
                else if (categoryLower.Contains("shoe") || categoryLower.Contains("sneaker") || 
                         categoryLower.Contains("boot") || categoryLower.Contains("heel") ||
                         categoryLower.Contains("sandal"))
                {
                    if (categoryLower.Contains("sneaker") || categoryLower.Contains("trainer"))
                        validatedCategory = "Sneakers";
                    else if (categoryLower.Contains("boot"))
                        validatedCategory = "Boots";
                    else if (categoryLower.Contains("heel"))
                        validatedCategory = "Heels";
                    else if (categoryLower.Contains("sandal"))
                        validatedCategory = "Sandals";
                    else
                        validatedCategory = "Shoes";
                }
                else if (categoryLower.Contains("accessor") || categoryLower.Contains("hat") ||
                         categoryLower.Contains("bag") || categoryLower.Contains("belt"))
                {
                    if (categoryLower.Contains("hat") || categoryLower.Contains("cap"))
                        validatedCategory = "Hat";
                    else if (categoryLower.Contains("bag") || categoryLower.Contains("purse"))
                        validatedCategory = "Bag";
                    else
                        validatedCategory = "Accessories";
                }
                
                // Final validation - if still not valid, return error with helpful message
                if (!ValidCategories.Contains(validatedCategory, StringComparer.OrdinalIgnoreCase))
                {
                    return new AIImageAnalysisResponse
                    {
                        Success = false,
                        ErrorMessage = $"Could not identify the clothing category. The AI detected '{category}', but this doesn't match our categories. " +
                                     $"Please try: (1) Use a clearer image, (2) Make sure the item is clearly visible, or (3) Add the item manually. " +
                                     $"Valid categories are: {string.Join(", ", ValidCategories)}"
                    };
                }
            }
            
            category = validatedCategory;

            // Validate colors - filter out "Multicolor" and try to match similar colors
            var validColors = new List<string>();
            var invalidColors = new List<string>();
            
            foreach (var color in colors)
            {
                // Skip "Multicolor" - we want individual colors instead
                if (color.Equals("Multicolor", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (ValidColors.Contains(color, StringComparer.OrdinalIgnoreCase))
                {
                    validColors.Add(color);
                }
                else
                {
                    // Try to find a close match
                    var colorLower = color.ToLowerInvariant();
                    string? matchedColor = null;
                    
                    // Common color variations
                    if (colorLower.Contains("gold") || colorLower.Contains("golden"))
                        matchedColor = "Gold";
                    else if (colorLower.Contains("silver") || colorLower.Contains("silvery"))
                        matchedColor = "Silver";
                    else if (colorLower.Contains("bronze") || colorLower.Contains("bronzy"))
                        matchedColor = "Bronze";
                    else if (colorLower.Contains("copper") || colorLower.Contains("coppery"))
                        matchedColor = "Copper";
                    else if (colorLower.Contains("rose gold") || colorLower.Contains("rose-gold"))
                        matchedColor = "Rose Gold";
                    else if (colorLower.Contains("champagne"))
                        matchedColor = "Champagne";
                    else if (colorLower.Contains("peach"))
                        matchedColor = "Peach";
                    else if (colorLower.Contains("salmon"))
                        matchedColor = "Salmon";
                    else if (colorLower.Contains("mint"))
                        matchedColor = "Mint";
                    else if (colorLower.Contains("emerald"))
                        matchedColor = "Emerald";
                    else if (colorLower.Contains("ruby"))
                        matchedColor = "Ruby";
                    else if (colorLower.Contains("sapphire"))
                        matchedColor = "Sapphire";
                    else if (colorLower.Contains("amber"))
                        matchedColor = "Amber";
                    else if (colorLower.Contains("charcoal"))
                        matchedColor = "Charcoal";
                    else if (colorLower.Contains("slate"))
                        matchedColor = "Slate";
                    else if (colorLower.Contains("navy") || colorLower.Contains("navy blue"))
                        matchedColor = "Navy";
                    else if (colorLower.Contains("light blue") || colorLower.Contains("sky"))
                        matchedColor = "Light Blue";
                    else if (colorLower.Contains("dark blue") || colorLower.Contains("midnight"))
                        matchedColor = "Dark Blue";
                    else if (colorLower.Contains("light green") || colorLower.Contains("lime"))
                        matchedColor = "Light Green";
                    else if (colorLower.Contains("dark green") || colorLower.Contains("forest"))
                        matchedColor = "Dark Green";
                    else if (colorLower == "gray" || colorLower == "grey")
                        matchedColor = "Gray";
                    
                    if (matchedColor != null && ValidColors.Contains(matchedColor, StringComparer.OrdinalIgnoreCase))
                    {
                        validColors.Add(matchedColor);
                    }
                    else
                    {
                        invalidColors.Add(color);
                    }
                }
            }

            // If we have some valid colors but also invalid ones, warn but don't fail
            if (validColors.Count == 0)
            {
                return new AIImageAnalysisResponse
                {
                    Success = false,
                    ErrorMessage = $"Could not identify any valid colors. The AI detected: {string.Join(", ", colors)}. " +
                                 $"Please try: (1) Use a clearer image with better lighting, (2) Make sure the item's color is clearly visible, or (3) Add the item manually with the correct color."
                };
            }
            
            // If we have invalid colors but also valid ones, include a note
            if (invalidColors.Count > 0 && notes == null)
            {
                notes = $"Note: Some colors could not be identified ({string.Join(", ", invalidColors)}). Using detected colors: {string.Join(", ", validColors)}.";
            }

            // Validate styles
            var validStyles = new List<string>();
            foreach (var style in styles)
            {
                if (ValidStyles.Contains(style, StringComparer.OrdinalIgnoreCase))
                {
                    validStyles.Add(style);
                }
                else
                {
                    return new AIImageAnalysisResponse
                    {
                        Success = false,
                        ErrorMessage = $"Invalid style '{style}'. Must be from predefined list."
                    };
                }
            }

            if (validStyles.Count == 0)
            {
                return new AIImageAnalysisResponse
                {
                    Success = false,
                    ErrorMessage = "At least one valid style is required."
                };
            }

            // Validate seasons
            var validSeasons = new List<string>();
            foreach (var season in seasons)
            {
                if (ValidSeasons.Contains(season, StringComparer.OrdinalIgnoreCase))
                {
                    validSeasons.Add(season);
                }
                else
                {
                    return new AIImageAnalysisResponse
                    {
                        Success = false,
                        ErrorMessage = $"Invalid season '{season}'. Must be from predefined list."
                    };
                }
            }

            if (validSeasons.Count == 0)
            {
                return new AIImageAnalysisResponse
                {
                    Success = false,
                    ErrorMessage = "At least one valid season is required."
                };
            }

            // Check if all 4 seasons are selected - if so, convert to "All Season"
            var hasSpring = validSeasons.Any(s => s.Equals("Spring", StringComparison.OrdinalIgnoreCase));
            var hasSummer = validSeasons.Any(s => s.Equals("Summer", StringComparison.OrdinalIgnoreCase));
            var hasFall = validSeasons.Any(s => s.Equals("Fall", StringComparison.OrdinalIgnoreCase));
            var hasWinter = validSeasons.Any(s => s.Equals("Winter", StringComparison.OrdinalIgnoreCase));
            
            if (hasSpring && hasSummer && hasFall && hasWinter && validSeasons.Count == 4)
            {
                // All 4 seasons selected - convert to "All Season"
                validSeasons = new List<string> { "All Season" };
            }
            else
            {
                // Remove "All Season" if there are specific seasons - "All Season" means it fits all, so specific seasons are redundant
                var hasAllSeason = validSeasons.Any(s => s.Equals("All Season", StringComparison.OrdinalIgnoreCase));
                var hasSpecificSeasons = validSeasons.Any(s => !s.Equals("All Season", StringComparison.OrdinalIgnoreCase));
                
                if (hasAllSeason && hasSpecificSeasons)
                {
                    // Remove "All Season" and keep only specific seasons
                    validSeasons = validSeasons
                        .Where(s => !s.Equals("All Season", StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }
            }

            // Return validated response
            return new AIImageAnalysisResponse
            {
                Category = category,
                Colors = validColors,
                Styles = validStyles,
                Seasons = validSeasons,
                Confidence = confidence,
                Notes = notes,
                Success = true
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing OpenAI response: {ex.Message}");
            Console.WriteLine($"Response text: {responseText}");
            
            return new AIImageAnalysisResponse
            {
                Success = false,
                ErrorMessage = "Failed to parse OpenAI response. Response may be invalid."
            };
        }
    }

    /// Validates that OpenAI API key is set and accessible
    /// Called during application startup
    public static bool ValidateApiKey()
    {
        var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return false;
        }

        // Basic format validation
        return apiKey.StartsWith("sk-", StringComparison.OrdinalIgnoreCase);
    }
}

