using Microsoft.AspNetCore.Mvc;
[ApiController]
[Route("api/outfit")]

public class OutfitController : ControllerBase // ControllerBase is the base class for all controllers
{
    [HttpPost("recommendation")] //attribute to map the method to the http post request
    public IActionResult Recommand(OutfitRecommendationRequest request)
    {
        OutfitRecommendationResponse response = new OutfitRecommendationResponse();
        response.outfitId = "123";
        response.items = new List<OutfitItem>();
        response.items.Add(new OutfitItem { itemId = "1", itemName = "Shirt", itemCategory = "Shirt", itemImage = "https://via.placeholder.com/150" });
        response.items.Add(new OutfitItem { itemId = "2", itemName = "Pants", itemCategory = "Pants", itemImage = "https://via.placeholder.com/150" });
        response.items.Add(new OutfitItem { itemId = "3", itemName = "Shoes", itemCategory = "Shoes", itemImage = "https://via.placeholder.com/150" });
        response.message = "Success";
        return Ok(response);
    }
}