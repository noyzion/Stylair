namespace stylair_api.Models;

/// <summary>
/// Request model for AI outfit chat
/// Contains user message, weather data, and closet items
/// </summary>
public class OutfitChatRequest
{
    /// User's message describing their day/events
    /// Example: "יש לי פגישה בצהריים ואימון בערב"
    public string UserMessage { get; set; } = string.Empty;

    /// Weather data from frontend
    public WeatherData? Weather { get; set; }
}

/// <summary>
/// Weather data structure
/// </summary>
public class WeatherData
{
    /// Temperature in Celsius
    public double? Temperature { get; set; }

    /// Weather condition: "sun", "cloud", "rain", "storm", "snow", "wind", "hot"
    public string? Condition { get; set; }

    /// Whether it's night time
    public bool? IsNight { get; set; }
}

