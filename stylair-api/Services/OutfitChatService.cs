using System;
using System.Text.Json;
using System.Text;
using System.Linq;
using stylair_api.Models;
using stylair_api.Repositories;

namespace stylair_api.Services;

/// <summary>
/// Service for AI-powered outfit chat using OpenAI Chat API
/// Generates outfit suggestions based on user message, weather, and closet items
/// </summary>
public class OutfitChatService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;
    private readonly IClosetItemStore _closetStore;
    private readonly ISavedOutfitStore _savedOutfitStore;

    /// Constructor - validates API key and initializes OpenAI client
    public OutfitChatService(IConfiguration configuration, IClosetItemStore closetStore, ISavedOutfitStore savedOutfitStore)
    {
        // Get API key from environment variable (SECURE - never hardcode!)
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
            ?? throw new InvalidOperationException(
                "OPENAI_API_KEY environment variable is required but not set. " +
                "Please set it before running the application. " +
                "NEVER commit API keys to GitHub - OpenAI will disable them!");

        // Validate API key format (starts with 'sk-')
        if (!_apiKey.StartsWith("sk-", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Invalid OPENAI_API_KEY format. API key should start with 'sk-'");
        }

        // Initialize HTTP client for OpenAI API
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

        _closetStore = closetStore;
        _savedOutfitStore = savedOutfitStore;
    }

    /// Generates outfit suggestions based on user message, weather, and closet items
    public async Task<OutfitChatResponse> GenerateOutfitSuggestionsAsync(
        OutfitChatRequest request, 
        string userId)
    {
        try
        {
            // Check for thank you messages first - return a friendly response
            if (IsThankYouMessage(request.UserMessage))
            {
                var thankYouResponses = new[]
                {
                    "You're so welcome! I'm here whenever you need outfit help!",
                    "Happy to help! Feel free to ask me anytime about outfits!",
                    "You're welcome! I'm always here to help you look amazing!",
                    "My pleasure! Can't wait to help you with your next outfit!",
                    "You're welcome! I love helping you create perfect looks!"
                };
                var random = new Random();
                return new OutfitChatResponse
                {
                    Success = false,
                    ErrorMessage = thankYouResponses[random.Next(thankYouResponses.Length)]
                };
            }

            // SEMANTIC RELEVANCE DETECTION - Check BEFORE generating outfits
            var isRelevant = IsMessageRelevant(request.UserMessage);
            if (!isRelevant)
            {
                return new OutfitChatResponse
                {
                    Success = false,
                    ErrorMessage = "I'm a fashion stylist assistant and I can only help with outfit suggestions or outfit-related changes. Please tell me about your events or ask me about outfits, clothing, or styling!"
                };
            }

            // Get user's closet items
            var closetItems = _closetStore.GetAll(userId);

            if (closetItems == null || closetItems.Count == 0)
            {
                return new OutfitChatResponse
                {
                    Success = false,
                    ErrorMessage = "Your closet is empty. Please add items to your closet first."
                };
            }

            // Get recently saved outfits to avoid repeating them
            var savedOutfits = _savedOutfitStore.GetAll(userId)
                .OrderByDescending(o => o.CreatedAt)
                .Take(10) // Get last 10 saved outfits
                .ToList();

            // Prepare items data for AI (only essential fields)
            var itemsForAI = closetItems.Select(item => new
            {
                id = item.ItemId.ToString(),
                category = item.ItemCategory,
                colors = item.Colors ?? new List<string>(),
                season = item.Season ?? new List<string>(),
                style = item.Style ?? new List<string>()
            }).ToList();

            // Prepare saved outfits data for AI (to avoid repetition)
            var savedOutfitsForAI = savedOutfits.Select(outfit => new
            {
                eventName = outfit.OccasionLabel,
                itemIds = outfit.Items?.Select(i => i.ItemId.ToString()).ToList() ?? new List<string>(),
                savedAt = outfit.CreatedAt.ToString("yyyy-MM-dd")
            }).ToList();

            // Create system prompt
            var systemPrompt = CreateSystemPrompt();

            // Create user message with context
            var userMessage = CreateUserMessage(request, itemsForAI, savedOutfitsForAI);

            // Build messages list with chat history
            var messages = new List<object>
            {
                new { role = "system", content = systemPrompt }
            };

            // Add chat history if provided (for context)
            if (request.ChatHistory != null && request.ChatHistory.Count > 0)
            {
                foreach (var historyMsg in request.ChatHistory)
                {
                    messages.Add(new { role = historyMsg.Role, content = historyMsg.Content });
                }
            }

            // Add current user message
            messages.Add(new { role = "user", content = userMessage });

            // Prepare request body for OpenAI API
            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = messages,
                max_tokens = 1500, // Increased to allow more detailed responses
                response_format = new { type = "json_object" },
                temperature = 0.7
            };

            // Call OpenAI API
            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
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

            // Check if response is valid JSON
            var trimmedResponse = responseText.Trim();
            if (!trimmedResponse.StartsWith("{") && !trimmedResponse.StartsWith("```json"))
            {
                // Text response, not JSON
                var lowerResponse = trimmedResponse.ToLower();
                if (lowerResponse.Contains("i'm a fashion") || 
                    lowerResponse.Contains("i can only help") || 
                    lowerResponse.Contains("fashion stylist") ||
                    lowerResponse.Contains("tell me about your day") ||
                    lowerResponse.Contains("tell me about your events"))
                {
                    // Text response
                    return new OutfitChatResponse
                    {
                        Success = false,
                        ErrorMessage = trimmedResponse
                    };
                }
                // Try to parse or return error
                return new OutfitChatResponse
                {
                    Success = false,
                    ErrorMessage = "The AI response was not in the expected format. Please try again."
                };
            }

            // Parse JSON response
            var chatResponse = ParseOpenAIResponse(responseText, closetItems);

            // Validate that we got at least some items
            if (chatResponse.Success && chatResponse.Outfits.Count > 0)
            {
                var hasAnyItems = chatResponse.Outfits.Any(o => o.Items.Count > 0);
                if (!hasAnyItems)
                {
                    return new OutfitChatResponse
                    {
                        Success = false,
                        ErrorMessage = "The AI did not return any items. This might be because: (1) No items match your request, (2) Items are missing from your closet, or (3) There was an issue processing the request. Please try rephrasing your request or check your closet items."
                    };
                }
            }

            return chatResponse;
        }
        catch (Exception ex)
        {
            // Log error
            Console.WriteLine($"Error in OutfitChatService: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            
            return new OutfitChatResponse
            {
                Success = false,
                ErrorMessage = "Failed to generate outfit suggestions. Please try again."
            };
        }
    }

    /// Creates system prompt with strict rules for OpenAI
    private string CreateSystemPrompt()
    {
        return @"You are an expert professional fashion stylist AI assistant with deep knowledge of color theory, style matching, and outfit coordination. Your job is to create PERFECT outfit suggestions that are:

CRITICAL: You have already been validated that this message is relevant to outfits. The user message has passed semantic relevance detection, so you MUST generate outfit suggestions.

CONTEXT-AWARE FEEDBACK HANDLING:
- If the user gives feedback on a previous outfit (""I didn't like it"", ""this doesn't work"", ""change the shoes""):
  * Analyze the chat history to understand which outfit they're referring to
  * If they mention a SPECIFIC item category (shoes, shirt, pants, jacket, accessories, top, bottom) → Replace ONLY that item category, keep all other items unchanged
  * If feedback is general (""I didn't like it"", ""this doesn't work"", ""another one"", ""different"") → Generate a completely new outfit
  * Maintain style, event context, and color harmony when making partial changes
- NEVER change unrelated items unless explicitly required
- When replacing a specific item, use the SAME item IDs for all other items from the previous outfit

ITEM-SPECIFIC MODIFICATION RULES (CRITICAL - NO RANDOMNESS):
- If user says: ""change the shoes"" / ""different shirt"" / ""replace the jacket"" / ""I don't like the pants"":
  * Identify the category mentioned (shoes = ""shoes"", shirt = ""top"", jacket = ""top"", pants = ""bottom"")
  * Look at the previous assistant message in chat history to find the outfit they're referring to
  * Copy ALL item IDs from that outfit EXCEPT for the category mentioned
  * Replace ONLY the item in that specific category
  * Ensure the new item coordinates with existing items (colors, style, formality)
  * Do NOT change any other items - this is critical for user trust
- If user says: ""I didn't like it"" / ""this doesn't work"" / ""another one"" / ""different"" (without specifying an item):
  * Generate a completely new outfit for the same event/context
  * Do NOT reuse any items from the previous outfit

1. HIGHLY RELEVANT to the user's specific message and events
2. WEATHER-APPROPRIATE based on temperature and conditions
3. STYLISTICALLY COHESIVE with matching colors, styles, and formality levels
4. UNIQUE - avoiding repetition of recently saved outfits

CRITICAL RULES FOR ITEM SELECTION:

1. YOU MUST ONLY use items that exist in the provided closet items list - NEVER invent items
2. Match items to the user's message context:
   - If user says ""meeting"" or ""work"" → choose formal/business items
   - If user says ""gym"" or ""workout"" → choose sporty/athletic items
   - If user says ""party"" or ""date"" → choose stylish/trendy items
   - If user says ""casual"" → choose comfortable everyday items
   - READ THE USER'S MESSAGE CAREFULLY and select items that match the context

3. Category matching is CRITICAL:
   - ""top"" category includes: shirts, t-shirts, blouses, sweaters, hoodies, jackets, coats, cardigans, vests
   - ""bottom"" category includes: pants, jeans, shorts, skirts
   - ""shoes"" category includes: sneakers, boots, heels, sandals, flats
   - ""accessories"" category includes: hats, bags, jewelry, belts
   - ""dress"" is a complete outfit (counts as both top and bottom)

4. Each outfit MUST include at minimum:
   - One top item (category: ""top"")
   - One bottom item (category: ""bottom"") OR one dress (category: ""dress"")
   - One shoes item (category: ""shoes"")
   - Accessories are optional but recommended

5. Color matching and coordination:
   - Colors can be: Black, White, Gray, Grey, Navy, Blue, Light Blue, Dark Blue, Red, Pink, Purple, Green, Light Green, Dark Green, Yellow, Orange, Brown, Beige, Tan, Cream, Ivory, Burgundy, Maroon, Teal, Turquoise, Coral, Lavender, Olive, Khaki, Gold, Silver, Bronze, Copper, Rose Gold, Multicolor
   - Match complementary colors (e.g., navy with white, black with any color)
   - Consider color harmony and avoid clashing combinations
   - If an item has multiple colors listed, use all of them in your matching decision

6. Style matching:
   - Match formality levels: formal with formal, casual with casual
   - Match aesthetic styles: sporty with sporty, elegant with elegant
   - Consider the overall look coherence

7. Weather considerations:
   - Hot weather (25°C+): Choose light fabrics, short sleeves, breathable materials
   - Cold weather (<15°C): Choose warm layers, long sleeves, jackets/coats
   - Rain: Suggest items that can handle moisture (avoid delicate fabrics)
   - Wind: Suggest items that won't be problematic in wind

8. AVOID REPETITION:
   - You will receive a list of recently saved outfits
   - DO NOT suggest the same combination of items that were recently saved
   - Try to create NEW and DIFFERENT outfit combinations
   - If you must use similar items, combine them differently or add different accessories

9. If you cannot create a complete outfit:
   - List the missing required items in the 'missingItems' array
   - Be specific about what category is missing (e.g., ""shoes"", ""jacket"", ""pants"")
   - Still try to suggest what you can with available items

10. Multiple events handling:
    - If user mentions multiple events, analyze if one outfit can work for all
    - If events are very different (e.g., meeting + gym), create separate outfits
    - If events are similar (e.g., meeting + dinner), one outfit might work
    - Clearly label each outfit with the event name

OUTPUT FORMAT (JSON ONLY, no additional text or explanations):
{
  ""outfits"": [
    {
      ""event"": ""meeting"",
      ""items"": [
        {
          ""id"": ""exact-item-id-from-closet-list"",
          ""category"": ""top"",
          ""reason"": ""Brief explanation: why this specific item matches the event, weather, and coordinates with other items""
        },
        {
          ""id"": ""exact-item-id-from-closet-list"",
          ""category"": ""bottom"",
          ""reason"": ""Brief explanation: why this specific item matches""
        },
        {
          ""id"": ""exact-item-id-from-closet-list"",
          ""category"": ""shoes"",
          ""reason"": ""Brief explanation: why this specific item matches""
        }
      ],
      ""missingItems"": [],
      ""notes"": ""2-3 sentences explaining: (1) why this outfit perfectly matches the user's event/request, (2) how it fits the weather, (3) the color/style coordination""
    }
  ]
}

VALIDATION CHECKLIST BEFORE RESPONDING:
✓ Every item ID exists in the provided closet items list
✓ Each outfit has at least top + bottom/dress + shoes
✓ Colors and styles are well-coordinated
✓ Outfit matches the user's event description
✓ Outfit is appropriate for the weather
✓ This combination is different from recently saved outfits
✓ All explanations are clear and relevant

If you cannot find suitable items, be honest in the missingItems array and notes.";
    }

    /// Creates user message with context
    private string CreateUserMessage(OutfitChatRequest request, object itemsForAI, object savedOutfitsForAI)
    {
        var message = new StringBuilder();
        
        // Add chat history context
        if (request.ChatHistory != null && request.ChatHistory.Count > 0)
        {
            message.AppendLine("=== CONVERSATION CONTEXT ===");
            message.AppendLine("Previous messages in this conversation (for understanding feedback and context):");
            foreach (var histMsg in request.ChatHistory.TakeLast(10))
            {
                var content = histMsg.Content;
                // Truncate very long messages
                if (content.Length > 200)
                {
                    content = content.Substring(0, 200) + "...";
                }
                message.AppendLine($"{histMsg.Role}: {content}");
            }
            message.AppendLine();
            message.AppendLine("IMPORTANT: If the user is giving feedback or requesting changes:");
            message.AppendLine("- Analyze the previous messages to understand which outfit they're referring to");
            message.AppendLine("- If they mention a SPECIFIC item (shoes, shirt, pants, jacket, accessories) → Replace ONLY that item, keep all other items unchanged");
            message.AppendLine("- If feedback is general (\"I didn't like it\", \"this doesn't work\") → Generate a completely new outfit");
            message.AppendLine("- Maintain style, event context, and color harmony when making partial changes");
            message.AppendLine();
        }
        
        message.AppendLine("=== CURRENT USER REQUEST ===");
        message.AppendLine($"User message: \"{request.UserMessage}\"");
        message.AppendLine();
        message.AppendLine("Please analyze this message carefully and understand:");
        message.AppendLine("- What events/activities the user mentioned (or from context if giving feedback)");
        message.AppendLine("- The formality level needed");
        message.AppendLine("- The style/aesthetic appropriate for these events");
        message.AppendLine("- If this is feedback on a previous outfit, identify which items to change");
        message.AppendLine();

        // Add weather information
        if (request.Weather != null)
        {
            message.AppendLine("=== WEATHER CONDITIONS ===");
            if (request.Weather.Temperature.HasValue)
            {
                message.AppendLine($"Temperature: {request.Weather.Temperature}°C");
                if (request.Weather.Temperature >= 25)
                {
                    message.AppendLine("→ HOT WEATHER: Choose light, breathable fabrics, short sleeves, avoid heavy layers");
                }
                else if (request.Weather.Temperature >= 18)
                {
                    message.AppendLine("→ WARM WEATHER: Choose comfortable, moderate-weight items");
                }
                else if (request.Weather.Temperature >= 10)
                {
                    message.AppendLine("→ COOL WEATHER: Choose warmer items, consider light layers");
                }
                else
                {
                    message.AppendLine("→ COLD WEATHER: Choose warm items, layers, jackets/coats are essential");
                }
            }
            if (!string.IsNullOrEmpty(request.Weather.Condition))
            {
                message.AppendLine($"Condition: {request.Weather.Condition}");
                if (request.Weather.Condition == "rain" || request.Weather.Condition == "storm")
                {
                    message.AppendLine("→ RAINY: Avoid delicate fabrics, consider waterproof/resistant items");
                }
                else if (request.Weather.Condition == "wind")
                {
                    message.AppendLine("→ WINDY: Avoid loose, flowing items that could be problematic");
                }
            }
            if (request.Weather.IsNight.HasValue)
            {
                message.AppendLine($"Time of day: {(request.Weather.IsNight.Value ? "Night" : "Day")}");
            }
            message.AppendLine();
        }

        // Add recently saved outfits to avoid repetition
        if (savedOutfitsForAI is List<object> savedOutfits && savedOutfits.Count > 0)
        {
            message.AppendLine("=== RECENTLY SAVED OUTFITS (AVOID REPEATING THESE) ===");
            message.AppendLine("These outfits were recently saved. DO NOT suggest the same item combinations:");
            message.AppendLine(JsonSerializer.Serialize(savedOutfitsForAI, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            }));
            message.AppendLine();
            message.AppendLine("IMPORTANT: Create NEW and DIFFERENT outfit combinations. If you must use some of the same items, combine them differently or add different accessories.");
            message.AppendLine();
        }

        // Add closet items with detailed information
        message.AppendLine("=== AVAILABLE ITEMS IN CLOSET ===");
        message.AppendLine("You MUST only use items from this list. Each item has:");
        message.AppendLine("- id: The exact ID you must use in your response");
        message.AppendLine("- category: The item category (top, bottom, shoes, accessories, dress)");
        message.AppendLine("- colors: List of colors this item has (use ALL colors when matching)");
        message.AppendLine("- season: When this item is appropriate");
        message.AppendLine("- style: The style/aesthetic of this item");
        message.AppendLine();
        message.AppendLine(JsonSerializer.Serialize(itemsForAI, new JsonSerializerOptions 
        { 
            WriteIndented = true 
        }));
        message.AppendLine();
        message.AppendLine("=== YOUR TASK ===");
        message.AppendLine("Based on the user's message, weather, and available items:");
        message.AppendLine("1. Identify the specific events/activities mentioned");
        message.AppendLine("2. Select items that PERFECTLY match the event context and formality level");
        message.AppendLine("3. Ensure colors coordinate well together");
        message.AppendLine("4. Ensure styles are cohesive");
        message.AppendLine("5. Make sure the outfit is appropriate for the weather");
        message.AppendLine("6. Create a UNIQUE combination different from recently saved outfits");
        message.AppendLine("7. Provide clear explanations for each item choice");
        message.AppendLine();
        message.AppendLine("Return your response in the exact JSON format specified in the system prompt.");

        return message.ToString();
    }

    /// Checks if the message is a thank you message
    private bool IsThankYouMessage(string userMessage)
    {
        if (string.IsNullOrWhiteSpace(userMessage))
            return false;

        var lowerMessage = userMessage.ToLower().Trim();
        
        var thankYouPhrases = new[]
        {
            "thank you", "thanks", "תודה", "תודה רבה", "תודה לך", "תודה לך מאוד",
            "appreciate it", "i appreciate", "much appreciated", "grateful",
            "תודה על העזרה", "תודה על הכל", "תודה רבה לך"
        };

        // Check if message is a thank you
        var isThankYou = thankYouPhrases.Any(phrase => lowerMessage.Contains(phrase));
        
            // Check if combined with outfit request
        if (isThankYou)
        {
            var outfitKeywords = new[] { "outfit", "clothing", "clothes", "wear", "suggest", "recommend", "help", "need", "want" };
            var hasOutfitRequest = outfitKeywords.Any(keyword => lowerMessage.Contains(keyword));
            
            // Return true if just a thank you
            if (!hasOutfitRequest)
            {
                return true;
            }
        }

        return false;
    }

    /// Checks if user message is semantically relevant to outfit creation/modification
    private bool IsMessageRelevant(string userMessage)
    {
        if (string.IsNullOrWhiteSpace(userMessage))
            return false;

        var lowerMessage = userMessage.ToLower();

        // Keywords indicating relevance
        var relevantKeywords = new[] {
            "outfit", "clothing", "clothes", "fashion", "style", "styling", "wear", "dress", "shirt", "pants", "shoes", "jacket", "skirt", "top", "bottom", "accessories", "look",
            "meeting", "workout", "gym", "party", "date", "event", "work", "casual", "formal", "evening", "day", "weather", "cold", "hot", "rain", "wind", "snow",
            "change", "replace", "different", "another", "suggest", "recommend", "give me", "show me", "what to wear", "help me"
        };

        // Keywords indicating irrelevance
        var irrelevantKeywords = new[] {
            "hi", "hello", "hey", "how are you", "what's up", "good morning", "good evening", "good night", "מה נשמע", "שלום", "היי",
            "what time is it", "tell me a joke", "do you like", "i'm bored", "today is", "i had a bad day", "animals", "food", "emotions", "life", "general question",
            "i love you", "love you", "i like you", "like you", "miss you", "thinking of you", "you're beautiful", "you're amazing"
        };

        // Check for irrelevant phrases
        var irrelevantPhrases = new[] {
            "hi how are you", "what's going on", "i'm bored", "do you like dogs", "what time is it", "tell me a joke", "today is a weird day", "i had a bad day at work",
            "i love you", "love you", "i like you", "miss you", "thinking of you", "you're beautiful", "you're amazing", "you're cute", "you're sweet"
        };

        if (irrelevantPhrases.Any(phrase => lowerMessage.Contains(phrase)))
        {
            return false;
        }

        // Check for relevant keywords
        if (relevantKeywords.Any(keyword => lowerMessage.Contains(keyword)))
        {
            return true;
        }

        // Check for irrelevant keywords
        if (irrelevantKeywords.Any(keyword => lowerMessage.Contains(keyword)))
        {
            return false;
        }

        // Check if message is too short
        if (lowerMessage.Length < 10 && !relevantKeywords.Any(keyword => lowerMessage.Contains(keyword)))
        {
            return false;
        }

        return true; // Default to relevant if no strong indicators either way
    }

    /// Parses OpenAI response and validates against actual closet items
    private OutfitChatResponse ParseOpenAIResponse(string responseText, List<OutfitItem> closetItems)
    {
        try
        {
            // Clean response text
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

            // Extract outfits
            var outfits = new List<OutfitSuggestion>();
            
            if (root.TryGetProperty("outfits", out var outfitsElement) && 
                outfitsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var outfitElement in outfitsElement.EnumerateArray())
                {
                    var outfit = new OutfitSuggestion();

                    // Extract event
                    if (outfitElement.TryGetProperty("event", out var eventElement))
                    {
                        outfit.Event = eventElement.GetString() ?? string.Empty;
                    }

                    // Extract items
                    if (outfitElement.TryGetProperty("items", out var itemsElement) && 
                        itemsElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var itemElement in itemsElement.EnumerateArray())
                        {
                            var itemId = itemElement.TryGetProperty("id", out var idElement) 
                                ? idElement.GetString() 
                                : null;
                            
                            var category = itemElement.TryGetProperty("category", out var catElement) 
                                ? catElement.GetString() 
                                : null;
                            
                            var reason = itemElement.TryGetProperty("reason", out var reasonElement) 
                                ? reasonElement.GetString() 
                                : string.Empty;

                            // Validate that item exists in closet
                            if (!string.IsNullOrEmpty(itemId) && 
                                Guid.TryParse(itemId, out var itemGuid))
                            {
                                var exists = closetItems.Any(item => item.ItemId == itemGuid);
                                if (exists)
                                {
                                    outfit.Items.Add(new OutfitItemSuggestion
                                    {
                                        Id = itemId,
                                        Category = category ?? string.Empty,
                                        Reason = reason ?? string.Empty
                                    });
                                }
                            }
                        }
                    }

                    // Extract missing items
                    if (outfitElement.TryGetProperty("missingItems", out var missingElement) && 
                        missingElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var missingItem in missingElement.EnumerateArray())
                        {
                            var missing = missingItem.GetString();
                            if (!string.IsNullOrEmpty(missing))
                            {
                                outfit.MissingItems.Add(missing);
                            }
                        }
                    }

                    // Extract notes
                    if (outfitElement.TryGetProperty("notes", out var notesElement))
                    {
                        outfit.Notes = notesElement.GetString() ?? string.Empty;
                    }

                    outfits.Add(outfit);
                }
            }

            return new OutfitChatResponse
            {
                Success = true,
                Outfits = outfits
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing OpenAI response: {ex.Message}");
            Console.WriteLine($"Response text: {responseText}");
            
            // Provide more detailed error message
            var errorDetails = new StringBuilder();
            errorDetails.AppendLine("Failed to parse AI response. This could be due to:");
            errorDetails.AppendLine("1. Invalid JSON format in AI response");
            errorDetails.AppendLine("2. Missing required fields in the response");
            errorDetails.AppendLine("3. Item IDs that don't exist in your closet");
            errorDetails.AppendLine();
            errorDetails.AppendLine("Please try again. If the problem persists, try rephrasing your request.");
            
            return new OutfitChatResponse
            {
                Success = false,
                ErrorMessage = errorDetails.ToString()
            };
        }
    }
}

