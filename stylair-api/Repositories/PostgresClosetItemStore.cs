using Microsoft.EntityFrameworkCore;
using stylair_api.Data;

namespace stylair_api.Repositories;

public class PostgresClosetItemStore : IClosetItemStore
{
    private readonly StylairDbContext _context;

    public PostgresClosetItemStore(StylairDbContext context)
    {
        _context = context;
    }

    public void Add(OutfitItem item)
    {
        try
        {
            if (item.ItemId == Guid.Empty)
            {
                item.ItemId = Guid.NewGuid();
            }
            
            item.CreatedAt = DateTime.Now;
            _context.ClosetItems.Add(item);
            _context.SaveChanges();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in PostgresClosetItemStore.Add: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw; // Re-throw to be handled by the service/controller
        }
    }

    public List<OutfitItem> GetAll()
    {
        return _context.ClosetItems.OrderByDescending(x => x.CreatedAt).ToList();
    }
}

