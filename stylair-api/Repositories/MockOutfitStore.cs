// fake db FOR NOW
using System.Linq;

public class MockOutfitStore : IOutfitStore
{
    // Fake in-memory list of items
    private readonly List<OutfitItem> items = new List<OutfitItem>
    {
        new OutfitItem
        {
            itemId = "pants-001",
            itemName = "Elegant black pants",
            itemCategory = "bottom",
            itemImage = "https://example.com/images/pants-001.jpg"
        },
        new OutfitItem
        {
            itemId = "shirt-001",
            itemName = "White formal shirt",
            itemCategory = "top",
            itemImage = "https://example.com/images/shirt-001.jpg"
        },
        new OutfitItem
        {
            itemId = "shoes-001",
            itemName = "Black leather shoes",
            itemCategory = "shoes",
            itemImage = "https://example.com/images/shoes-001.jpg"
        },
        new OutfitItem
        {
            itemId = "pants-002",
            itemName = "Blue jeans",
            itemCategory = "bottom",
            itemImage = "https://example.com/images/pants-002.jpg"
        },
        new OutfitItem
        {
            itemId = "shirt-002",
            itemName = "Casual black t‑shirt",
            itemCategory = "top",
            itemImage = "https://example.com/images/shirt-002.jpg"
        },
        new OutfitItem
        {
            itemId = "shoes-002",
            itemName = "White sneakers",
            itemCategory = "shoes",
            itemImage = "https://example.com/images/shoes-002.jpg"
        },
        new OutfitItem
        {
            itemId = "pants-003",
            itemName = "Grey joggers",
            itemCategory = "bottom",
            itemImage = "https://example.com/images/pants-003.jpg"
        },
        new OutfitItem
        {
            itemId = "shirt-003",
            itemName = "Sport tank top",
            itemCategory = "top",
            itemImage = "https://example.com/images/shirt-003.jpg"
        },
        new OutfitItem
        {
            itemId = "shoes-003",
            itemName = "Running shoes",
            itemCategory = "shoes",
            itemImage = "https://example.com/images/shoes-003.jpg"
        },
        new OutfitItem
        {
            itemId = "pants-004",
            itemName = "Black jeans",
            itemCategory = "bottom",
            itemImage = "https://example.com/images/pants-004.jpg"
        },
        new OutfitItem
        {
            itemId = "shirt-004",
            itemName = "Red t‑shirt",
            itemCategory = "top",
            itemImage = "https://example.com/images/shirt-004.jpg"
        },
        new OutfitItem
        {
            itemId = "shoes-004",
            itemName = "Adidas sneakers",
            itemCategory = "shoes",
            itemImage = "https://example.com/images/shoes-004.jpg"
        }
    };

    // Mapping between outfitId and the itemIds that belong to that outfit
    private readonly Dictionary<string, List<string>> outfitItemIds = new()
    {
        { "1", new List<string> { "pants-001", "shirt-001", "shoes-001" } },
        { "2", new List<string> { "pants-002", "shirt-002", "shoes-002" } },
        { "3", new List<string> { "pants-003", "shirt-003", "shoes-003" } },
        { "4", new List<string> { "pants-004", "shirt-004", "shoes-004" } },
    };

    public OutfitRecommendationResponse GetOutfitById(string outfitId)
    {
        var returnedOutfit = new OutfitRecommendationResponse
        {
            outfitId = outfitId
        };

        //searching the key in the dictionery and returns the value of the key (list of items)
        if (!outfitItemIds.TryGetValue(outfitId, out var itemIds))
        {
            returnedOutfit.reasonText = "Outfit not found in mock store";
            return returnedOutfit;
        }

        //in the returned list, we are searching the items in the store
        foreach (var itemId in itemIds)
        {
            OutfitItem? matchingItem = null;

            //searching the item in the store
            foreach (var outfitItem in items)
            {
                if (outfitItem.itemId == itemId)
                {
                    matchingItem = outfitItem;
                    break; //found, can break and add it to the look (response)
                }
            }

            if (matchingItem != null)
            {
                returnedOutfit.items.Add(matchingItem);
            }
        }

        returnedOutfit.reasonText = "Mock outfit built from mock store items";
        return returnedOutfit; //return the final look
    }
}