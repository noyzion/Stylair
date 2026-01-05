using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stylair_api.Extensions;
using stylair_api.Services;

[Authorize] // 👈 דורש authentication לכל ה-endpoints
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
        var userId = User.GetUserId(); // 👈 מקבלים את ה-user ID מה-token
        OutfitRecommendationsListResponse response = _service.ReturnResponse(request, userId);
        return Ok(response);
    }
}