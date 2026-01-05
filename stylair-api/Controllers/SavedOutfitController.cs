using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stylair_api.Extensions;
using stylair_api.Services;

[Authorize] // 👈 דורש authentication לכל ה-endpoints
[ApiController]
[Route("api/saved-outfits")]
public class SavedOutfitController : ControllerBase
{
    private readonly SavedOutfitService _service;

    public SavedOutfitController(SavedOutfitService service)
    {
        _service = service;
    }

    [HttpPost]
    public IActionResult SaveOutfit(OutfitRecommendationResponse outfitResponse)
    {
        try
        {
            var userId = User.GetUserId(); // 👈 מקבלים את ה-user ID מה-token
            var savedOutfit = _service.SaveOutfit(outfitResponse, userId);
            return Ok(new { message = "Outfit saved successfully", outfit = savedOutfit });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving outfit: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = $"Failed to save outfit: {ex.Message}" });
        }
    }

    [HttpGet]
    public IActionResult GetAllSavedOutfits()
    {
        try
        {
            var userId = User.GetUserId(); // 👈 מקבלים את ה-user ID מה-token
            var outfits = _service.GetAllSavedOutfits(userId);
            return Ok(outfits);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting saved outfits: {ex.Message}");
            return StatusCode(500, new { message = $"Failed to get saved outfits: {ex.Message}" });
        }
    }

    [HttpDelete("{outfitId}")]
    public IActionResult DeleteOutfit(string outfitId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(outfitId))
            {
                return BadRequest(new { message = "Outfit ID is required" });
            }

            if (!Guid.TryParse(outfitId, out Guid guidOutfitId))
            {
                return BadRequest(new { message = $"Invalid outfit ID format: {outfitId}" });
            }

            var userId = User.GetUserId(); // 👈 מקבלים את ה-user ID מה-token
            _service.DeleteOutfit(guidOutfitId, userId);
            return Ok(new { message = "Outfit deleted successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting outfit: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = $"Failed to delete outfit: {ex.Message}" });
        }
    }
}

