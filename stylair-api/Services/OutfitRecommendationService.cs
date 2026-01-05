//services is in charge of the logic of the parsing between the requst the comes from the controller
//and it returns the response back to the controller
//flow - POST request from the FronEnds -> controller recieves OutfitRecommendationRequest -> calls to Service to handle it ->service analyze the message and create OutfitRecommendationResponse -> return it to the controller -> controller returns response -> ASP.NET make a JSON from it
using System.Linq;

public class OutfitRecommendationService
{
    private readonly IOutfitStore _store;

    public OutfitRecommendationService(IOutfitStore store)
    {
        _store = store;
    }

    // Helper function to get the label based on which word was found
    private string GetLabelForFormal(string message)
    {
        if (message.Contains("interview")) return "For interview:";
        if (message.Contains("presentation")) return "For presentation:";
        if (message.Contains("conference")) return "For conference:";
        if (message.Contains("meeting")) return "For meeting:";
        if (message.Contains("event")) return "For event:";
        return "For meeting:"; // default
    }

    private string GetLabelForParty(string message)
    {
        if (message.Contains("party")) return "For party:";
        if (message.Contains("dinner")) return "For dinner:";
        if (message.Contains("night out")) return "For night out:";
        if (message.Contains("evening")) return "For evening:";
        if (message.Contains("date")) return "For date:";
        return "For dinner:"; // default
    }

    private string GetLabelForGym(string message)
    {
        if (message.Contains("workout")) return "For workout:";
        if (message.Contains("gym")) return "For gym:";
        if (message.Contains("training")) return "For training:";
        if (message.Contains("run")) return "For run:";
        return "For workout:"; // default
    }

    private string GetLabelForCasual(string message)
    {
        if (message.Contains("school")) return "For school:";
        if (message.Contains("casual")) return "For casual day:";
        return "For day:"; // default
    }

    public OutfitRecommendationsListResponse ReturnResponse(OutfitRecommendationRequest request, string userId)
    {
        var message = request?.message?.ToLower() ?? string.Empty;
        var response = new OutfitRecommendationsListResponse();

        // Check if the closet is empty - if so, return immediately with a single message
        if (_store.IsClosetEmpty(userId))
        {
            var emptyOutfit = new OutfitRecommendationResponse
            {
                occasionLabel = "",
                reasonText = "The closet is empty and we couldn't find any outfits to suggest. Please add items to your closet first."
            };
            response.outfits.Add(emptyOutfit);
            return response;
        }

        // Check for formal/interview events
        if (message.Contains("interview") || message.Contains("meeting") || message.Contains("presentation")
                || message.Contains("conference") || message.Contains("event") || message.Contains("formal"))
        {
            var criteria = new OutfitCriteria
            {
                style = new List<string> { "formal", "elegant" },
                occasion = new List<string> { "interview", "meeting", "presentation", "conference", "event" },
                season = "all",
                colors = new List<string> { "black", "white", "navy", "gray" }
            };
            var outfit = _store.GetOutfitByCriteria(criteria, userId);
            outfit.occasionLabel = GetLabelForFormal(message);
            // Only set reasonText if outfit has items (otherwise store already set an empty closet message)
            if (outfit.items.Count > 0)
            {
                outfit.reasonText = "I chose this outfit with neutral, elegant colors that reflect professionalism and create a confident, polished impression for your formal event.";
            }
            response.outfits.Add(outfit);
        }

        // Check for party/date events
        if (message.Contains("party") || message.Contains("date") || message.Contains("night out")
                    || message.Contains("evening") || message.Contains("dinner"))
        {
            var criteria = new OutfitCriteria
            {
                style = new List<string> { "casual", "trendy", "stylish" },
                occasion = new List<string> { "party", "date", "night out", "evening", "dinner" },
                season = "all",
                colors = new List<string> { "black", "blue", "red", "white" }
            };
            var outfit = _store.GetOutfitByCriteria(criteria, userId);
            outfit.occasionLabel = GetLabelForParty(message);
            if (outfit.items.Count > 0)
            {
                outfit.reasonText = "I chose this outfit with trendy, stylish pieces that balance comfort and fashion, perfect for a fun and memorable evening out.";
            }
            response.outfits.Add(outfit);
        }

        // Check for gym/workout events
        if (message.Contains("gym") || message.Contains("training") || message.Contains("run")
                    || message.Contains("workout"))
        {
            var criteria = new OutfitCriteria
            {
                style = new List<string> { "sporty", "athletic", "comfortable" },
                occasion = new List<string> { "gym", "training", "run", "workout", "exercise" },
                season = "all",
                colors = new List<string> { "black", "gray", "white", "blue" }
            };
            var outfit = _store.GetOutfitByCriteria(criteria, userId);
            outfit.occasionLabel = GetLabelForGym(message);
            if (outfit.items.Count > 0)
            {
                outfit.reasonText = "I selected these athletic pieces for optimal comfort, breathability, and performance to support your workout and keep you moving freely.";
            }
            response.outfits.Add(outfit);
        }

        // Check for casual/day events
        if (message.Contains("casual") || message.Contains("comfortable") || message.Contains("relaxed")
                     || message.Contains("school"))
        {
            var criteria = new OutfitCriteria
            {
                style = new List<string> { "casual", "comfortable", "relaxed" },
                occasion = new List<string> { "casual", "day", "school", "everyday" },
                season = "all",
                colors = new List<string> { "blue", "black", "white", "gray", "red" }
            };
            var outfit = _store.GetOutfitByCriteria(criteria, userId);
            outfit.occasionLabel = GetLabelForCasual(message);
            if (outfit.items.Count > 0)
            {
                outfit.reasonText = "I picked this relaxed, comfortable outfit that's perfect for your day-to-day activities, combining style with ease and versatility.";
            }
            response.outfits.Add(outfit);
        }

        // If no conditions matched, set default values
        if (response.outfits.Count == 0)
        {
            var criteria = new OutfitCriteria
            {
                style = new List<string> { "casual", "versatile" },
                occasion = new List<string> { "general", "default" },
                season = "all",
                colors = new List<string> { "black", "white", "blue", "gray" }
            };
            var outfit = _store.GetOutfitByCriteria(criteria, userId);
            outfit.occasionLabel = "Default:";
            if (outfit.items.Count > 0)
            {
                outfit.reasonText = "I selected this versatile outfit that works well for various occasions, offering a balanced combination of style and comfort.";
            }
            response.outfits.Add(outfit);
        }

        return response;
    }
}