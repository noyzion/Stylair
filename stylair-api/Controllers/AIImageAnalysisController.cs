using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stylair_api.Models;
using stylair_api.Services;

namespace stylair_api.Controllers;

/// Controller for AI-powered image analysis of clothing items
/// Uses OpenAI Vision API to analyze clothing images and extract structured data
[Authorize] // Requires authentication - only logged-in users can use this
[ApiController]
[Route("api/ai")]
public class AIImageAnalysisController : ControllerBase
{
    private readonly OpenAIImageAnalysisService _openAIService;

    /// Constructor - receives OpenAI service via dependency injection
    public AIImageAnalysisController(OpenAIImageAnalysisService openAIService)
    {
        _openAIService = openAIService;
    }
    
    [HttpPost("analyze-image")]
    public async Task<IActionResult> AnalyzeImage([FromBody] AIImageAnalysisRequest request)
    {
        try
        {
            // Validate request
            if (request == null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            // Call OpenAI service to analyze image
            var analysis = await _openAIService.AnalyzeImageAsync(request);

            // Return response
            if (analysis.Success)
            {
                return Ok(analysis);
            }
            else
            {
                return BadRequest(new 
                { 
                    message = analysis.ErrorMessage ?? "Failed to analyze image",
                    analysis = analysis 
                });
            }
        }
        catch (Exception ex)
        {
            // Log error but don't expose internal details
            Console.WriteLine($"Error in AnalyzeImage endpoint: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");

            return StatusCode(500, new 
            { 
                message = "An error occurred while analyzing the image. Please try again." 
            });
        }
    }

    /// Health check endpoint to verify OpenAI API key is configured
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        try
        {
            var isConfigured = OpenAIImageAnalysisService.ValidateApiKey();
            
            if (isConfigured)
            {
                return Ok(new 
                { 
                    status = "healthy",
                    message = "OpenAI API key is configured",
                    configured = true
                });
            }
            else
            {
                return StatusCode(503, new 
                { 
                    status = "unhealthy",
                    message = "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.",
                    configured = false
                });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new 
            { 
                status = "error",
                message = $"Health check failed: {ex.Message}" 
            });
        }
    }
}

