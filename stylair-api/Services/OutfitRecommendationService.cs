//services is in charge of the logic of the parsing between the requst the comes from the controller
//and it returns the response back to the controller
//flow - POST request from the FronEnds -> controller recieves OutfitRecommendationRequest -> calls to Service to handle it ->service analyze the message and create OutfitRecommendationResponse -> return it to the controller -> controller returns response -> ASP.NET make a JSON from it
public class OutfitRecommendationService
{
    private readonly IOutfitStore _store;
    public OutfitRecommendationService(IOutfitStore store)
    {
        _store = store;
    }
    public OutfitRecommendationResponse ReturnResponse(OutfitRecommendationRequest request)
    {
        var message = request?.message?.ToLower() ?? string.Empty;
        string outfitId;

        if (message.Contains("interview") || message.Contains("meeting") || message.Contains("presentation")
                || message.Contains("conference") || message.Contains("event") || message.Contains("formal"))
        {
            outfitId = "1";
        }
        else if (message.Contains("party") || message.Contains("date") || message.Contains("night out")
                    || message.Contains("evening") || message.Contains("dinner"))
        {
            outfitId = "2";
        }
        else if (message.Contains("gym") || message.Contains("training") || message.Contains("run")
                    || message.Contains("workout"))
        {
            outfitId = "3";
        }
        else if (message.Contains("casual") || message.Contains("comfortable") || message.Contains("relaxed")
                    || message.Contains("day") || message.Contains("school"))
        {
            outfitId = "4";
        }
        else
        {
            outfitId = "5";
        }
        var response = _store.GetOutfitById(outfitId);
        return response;
    }
}