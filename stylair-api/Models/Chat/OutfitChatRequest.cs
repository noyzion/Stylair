namespace stylair_api.Models;

public class OutfitChatRequest
{
    public string UserMessage { get; set; } = string.Empty;
    public WeatherData? Weather { get; set; }
    public List<ChatHistoryMessage>? ChatHistory { get; set; }
}

