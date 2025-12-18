using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/outfit")]
public class OutfitController : ControllerBase // ControllerBase is the base class for all controllers
{
    [HttpPost("recommendation")] //attribute to map the method to the http post request
    public IActionResult Recommand(OutfitRecommendationRequest request)
    {
        var message = request?.message?.ToLower() ?? string.Empty;
        var response = new OutfitRecommendationResponse();

        if (message.Contains("interview") || message.Contains("meeting") || message.Contains("presentation")
                || message.Contains("conference") || message.Contains("event") || message.Contains("formal"))
        {
            // TODO: set response for formal scenarios
        }
        else if (message.Contains("party") || message.Contains("date") || message.Contains("night out")
                    || message.Contains("evening") || message.Contains("dinner"))
        {
            // TODO: set response for party/evening scenarios
        }
        else if (message.Contains("casual") || message.Contains("comfortable") || message.Contains("relaxed")
                    || message.Contains("day") || message.Contains("school"))
        {
            // TODO: set response for casual scenarios
        }
        else if (message.Contains("gym") || message.Contains("training") || message.Contains("run")
                    || message.Contains("workout"))
        {

        }
        return Ok(response);
    }
}