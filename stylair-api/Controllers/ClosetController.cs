using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stylair_api.Extensions;
using stylair_api.Models;
using stylair_api.Services;

[Authorize]
[ApiController]
[Route("api/closet")]
public class ClosetController : ControllerBase // ControllerBase is the base class for all controllers
{
    private readonly ClosetService _service; // the controller dont do logic alone - it go through the service

    public ClosetController(ClosetService service)
    {
        _service = service;
    }

    [HttpPost("item")]
    public async Task<IActionResult> AddItem(AddItemRequest request)
    {
        try
        {
            // Log the raw request
            Console.WriteLine($"=== AddItem Request Received ===");
            Console.WriteLine($"Size: '{request.size}' (is null: {request.size == null})");
            Console.WriteLine($"Tags: [{string.Join(", ", request.tags ?? new List<string>())}] (is null: {request.tags == null}, count: {request.tags?.Count ?? 0})");
            var userId = User.GetUserId();
            var item = await _service.AddItemAsync(request, userId);
            Console.WriteLine($"=== Item Added Successfully ===");
            return Ok(new { message = "Item added successfully", item = item });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the full error for debugging
            Console.WriteLine($"Error adding item: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = $"Failed to add item: {ex.Message}" });
        }
    }

    [HttpGet("items")]
    public IActionResult GetAllItems()
    {
        var userId = User.GetUserId();
        var items = _service.GetAllItems(userId);
        return Ok(items);
    }

    [HttpPut("item/{itemImage}")]
    public async Task<IActionResult> UpdateItem(string itemImage, [FromBody] AddItemRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(itemImage))
            {
                return BadRequest(new { message = "Item image is required" });
            }

            var userId = User.GetUserId();
            var decodedItemImage = Uri.UnescapeDataString(itemImage);
            var item = await _service.UpdateItemAsync(request, decodedItemImage, userId);
            return Ok(new { message = "Item updated successfully", item = item });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating item: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = $"Failed to update item: {ex.Message}" });
        }
    }

    [HttpDelete("item/{itemImage}")]
    public async Task<IActionResult> DeleteItem(string itemImage)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(itemImage))
            {
                return BadRequest(new { message = "Item image is required" });
            }

            var userId = User.GetUserId();
            var decodedItemImage = Uri.UnescapeDataString(itemImage);
            await _service.DeleteItemAsync(decodedItemImage, userId);
            return Ok(new { message = "Item deleted successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting item: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = $"Failed to delete item: {ex.Message}" });
        }
    }

}
