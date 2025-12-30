using Microsoft.AspNetCore.Mvc;

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
    public IActionResult AddItem(AddItemRequest request)
    {
        try
        {
            var item = _service.AddItem(request);
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
        var items = _service.GetAllItems();
        return Ok(items);
    }

    [HttpDelete("item/{itemImage}")]
    public IActionResult DeleteItem(string itemImage)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(itemImage))
            {
                return BadRequest(new { message = "Item image is required" });
            }

            var decodedItemImage = Uri.UnescapeDataString(itemImage);
            _service.DeleteItem(decodedItemImage);
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
