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

    [HttpPost("items")]
    public IActionResult AddItem(AddItemRequest request)
    {
        _service.AddItem(request);
        return Ok(new { message = "Item added successfully" });
    }
    [HttpGet("items")]
    public IActionResult GetAllItems()
    {
        var items = _service.GetAllItems();
        return Ok(items);
    }

}
