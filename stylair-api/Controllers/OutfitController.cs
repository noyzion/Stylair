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

    [HttpPost("recommendation")] //attribute to map the method to the http post request
    public IActionResult Recommand(OutfitRecommendationRequest request)
    {
        OutfitRecommendationsListResponse response = _service.ReturnResponse(request);
        return Ok(response);
    }
}