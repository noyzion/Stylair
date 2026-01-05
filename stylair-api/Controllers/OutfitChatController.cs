using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stylair_api.Extensions;
using stylair_api.Models;
using stylair_api.Services;

namespace stylair_api.Controllers;

/// <summary>
/// Controller for AI-powered outfit chat
/// Generates outfit suggestions based on user message, weather, and closet items
/// </summary>
[Authorize] // Requires authentication - only logged-in users can use this
[ApiController]
[Route("api/outfit-chat")]
public class OutfitChatController : ControllerBase
{
    private readonly OutfitChatService _outfitChatService;

    /// Constructor - receives OutfitChatService via dependency injection
    public OutfitChatController(OutfitChatService outfitChatService)
    {
        _outfitChatService = outfitChatService;
    }

    /// <summary>
    /// Generates outfit suggestions based on user message, weather, and closet items
    /// 
    /// POST /api/outfit-chat/suggest
    /// 
    /// Request body:
    /// {
    ///   "userMessage": "יש לי פגישה בצהריים ואימון בערב",
    ///   "weather": {
    ///     "temperature": 25,
    ///     "condition": "sun",
    ///     "isNight": false
    ///   }
    /// }
    /// 
    /// Response:
    /// {
    ///   "success": true,
    ///   "outfits": [
    ///     {
    ///       "event": "meeting",
    ///       "items": [
    ///         {
    ///           "id": "item-id",
    ///           "category": "top",
    ///           "reason": "short explanation"
    ///         }
    ///       ],
    ///       "missingItems": [],
    ///       "notes": "why this outfit fits"
    ///     }
    ///   ]
    /// }
    /// </summary>
    [HttpPost("suggest")]
    public async Task<IActionResult> SuggestOutfit([FromBody] OutfitChatRequest request)
    {
        try
        {
            // Validate request
            if (request == null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            if (string.IsNullOrWhiteSpace(request.UserMessage))
            {
                return BadRequest(new { message = "User message is required" });
            }

            // Get user ID from token
            var userId = User.GetUserId();

            // Call service to generate outfit suggestions
            var response = await _outfitChatService.GenerateOutfitSuggestionsAsync(request, userId);

            // Return response
            if (response.Success)
            {
                return Ok(response);
            }
            else
            {
                return BadRequest(new 
                { 
                    message = response.ErrorMessage ?? "Failed to generate outfit suggestions",
                    response = response 
                });
            }
        }
        catch (Exception ex)
        {
            // Log error but don't expose internal details
            Console.WriteLine($"Error in OutfitChatController.SuggestOutfit: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");

            return StatusCode(500, new 
            { 
                message = "An error occurred while generating outfit suggestions. Please try again." 
            });
        }
    }
}

