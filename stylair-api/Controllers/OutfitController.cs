using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/outfit")]
public class OutfitController : ControllerBase // ControllerBase is the base class for all controllers
{
    private readonly OutfitRecommendationService _service;
    public OutfitController(OutfitRecommendationService service)
    {
        _service = service;
    }
    //POST request beacuse we are sending a request to the server to get a response and the request containd body of the request
    //it's not a GET request because we are not getting a response from the server, we are sending a request to the server to get a response and the request containd body of the request
    //in a GET request, the request is a URL and the response is a body of the request
    [HttpPost("recommendation")] //attribute to map the method to the http post request
    public IActionResult Recommand(OutfitRecommendationRequest request)
    {
        OutfitRecommendationsListResponse response = _service.ReturnResponse(request);
        return Ok(response);
    }
}
