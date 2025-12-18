//services is in charge of the logic of the parsing between the requst the comes from the controller
//and it returns the response back to the controller
//flow - POST request from the FronEnds -> controller recieves OutfitRecommendationRequest -> calls to Service to handle it ->service analyze the message and create OutfitRecommendationResponse -> return it to the controller -> controller returns response -> ASP.NET make a JSON from it
public class OutfitRecommendationService
{
    public OutfitRecommendationResponse ReturnResponse(OutfitRecommendationRequest request)
    {
        var message = request?.message?.ToLower() ?? string.Empty;
        var response = new OutfitRecommendationResponse();

        if (message.Contains("interview") || message.Contains("meeting") || message.Contains("presentation")
                || message.Contains("conference") || message.Contains("event") || message.Contains("formal"))
        {
            response.outfitId = "1";
            response.items = new List<OutfitItem>{
                                new OutfitItem{itemId = "pants-001", itemName = "elegant black pants", itemCategory = "bottom", itemImage = "...."},
                                new OutfitItem{itemId = "shirt-001", itemName = "elegant white shirt", itemCategory = "top", itemImage = "...."},
                                new OutfitItem{itemId = "shoes-001", itemName = "black leather shoes", itemCategory = "shoes", itemImage = "...."}};
            response.reasonText = "i chose this outfit with nutral colors that reflects proffesional impression";
        }
        else if (message.Contains("party") || message.Contains("date") || message.Contains("night out")
                    || message.Contains("evening") || message.Contains("dinner"))
        {
            response.outfitId = "2";
            response.items = new List<OutfitItem>{
                                new OutfitItem{itemId = "pants-002", itemName = "blue jeans", itemCategory = "bottom", itemImage = "...."},
                                new OutfitItem{itemId = "shirt-002", itemName = "black t-shirt", itemCategory = "top", itemImage = "...."},
                                new OutfitItem{itemId = "shoes-002", itemName = "converse shoes", itemCategory = "shoes", itemImage = "...."}};
            response.reasonText = "i chose this outfit with more casual items for your night out";
        }
        else if (message.Contains("gym") || message.Contains("training") || message.Contains("run")
                    || message.Contains("workout"))
        {
            response.outfitId = "3";
            response.items = new List<OutfitItem>{
                                new OutfitItem{itemId = "pants-003", itemName = "shot joggers", itemCategory = "bottom", itemImage = "...."},
                                new OutfitItem{itemId = "shirt-003", itemName = "tank top", itemCategory = "top", itemImage = "...."},
                                new OutfitItem{itemId = "shoes-003", itemName = "sneakers", itemCategory = "shoes", itemImage = "...."}};
            response.reasonText = "i chose these items for the perfect workout";
        }
        else if (message.Contains("casual") || message.Contains("comfortable") || message.Contains("relaxed")
                    || message.Contains("day") || message.Contains("school"))
        {
            response.outfitId = "4";
            response.items = new List<OutfitItem>{
                                new OutfitItem{itemId = "pants-004", itemName = "black jeans", itemCategory = "bottom", itemImage = "...."},
                                new OutfitItem{itemId = "shirt-004", itemName = "red t-shirt", itemCategory = "top", itemImage = "...."},
                                new OutfitItem{itemId = "shoes-004", itemName = "adidas shoes", itemCategory = "shoes", itemImage = "...."}};
            response.reasonText = "i chose this outfit to the perfect day";
        }
        else
        {
            response.outfitId = "5";
            response.items = new List<OutfitItem>{
                                new OutfitItem{itemId = "pants-005", itemName = "black jeans", itemCategory = "bottom", itemImage = "...."},
                                new OutfitItem{itemId = "shirt-006", itemName = "red t-shirt", itemCategory = "top", itemImage = "...."},
                                new OutfitItem{itemId = "shoes-007", itemName = "adidas shoes", itemCategory = "shoes", itemImage = "...."}};
            response.reasonText = "i chose this outfit to the perfect day";
        }
        return response;
    }
}