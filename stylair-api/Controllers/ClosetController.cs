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
    }

    [HttpGet("items")]
    public IActionResult GetAllItems()
    {
        var items = _service.GetAllItems();
        return Ok(items);
    }

}
