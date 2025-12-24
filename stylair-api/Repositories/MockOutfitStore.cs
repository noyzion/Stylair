// fake db FOR NOW
using System.Linq;

public class MockOutfitStore : IOutfitStore
{
    // Fake in-memory list of items
    private readonly List<OutfitItem> items = new List<OutfitItem>
    {
        // Outfit 1 - Formal
        new OutfitItem
        {
            itemId = "pants-001",
            itemName = "Elegant black pants",
            itemCategory = "bottom",
            itemImage = "https://example.com/images/pants-001.jpg",
            style = new List<string> { "formal", "elegant" },
            colors = new List<string> { "black" },
            season = "all"
        },
        new OutfitItem
        {
            itemId = "shirt-001",
            itemName = "White formal shirt",
            itemCategory = "top",
            itemImage = "https://example.com/images/shirt-001.jpg",
            style = new List<string> { "formal", "elegant" },
            colors = new List<string> { "white" },
            season = "all"
        },
        new OutfitItem
        {
            itemId = "shoes-001",
            itemName = "Black leather shoes",
            itemCategory = "shoes",
            itemImage = "https://example.com/images/shoes-001.jpg",
            style = new List<string> { "formal", "elegant" },
            colors = new List<string> { "black" },
            season = "all"
        },
        // Outfit 2 - Party/Casual
        new OutfitItem
        {
            itemId = "pants-002",
            itemName = "Blue jeans",
            itemCategory = "bottom",
            itemImage = "https://example.com/images/pants-002.jpg",
            style = new List<string> { "casual", "trendy", "stylish" },
            colors = new List<string> { "blue" },
            season = "all"
        },
        new OutfitItem
        {
            itemId = "shirt-002",
            itemName = "Casual black t‑shirt",
            itemCategory = "top",
            itemImage = "https://example.com/images/shirt-002.jpg",
            style = new List<string> { "casual", "trendy", "stylish" },
            colors = new List<string> { "black" },
            season = "all"
        },
        new OutfitItem
        {
            itemId = "shoes-002",
            itemName = "White sneakers",
            itemCategory = "shoes",
            itemImage = "https://example.com/images/shoes-002.jpg",
            style = new List<string> { "casual", "trendy", "stylish" },
            colors = new List<string> { "white" },
            season = "all"
        },
        // Outfit 3 - Gym/Sporty
        new OutfitItem
        {
            itemId = "pants-003",
            itemName = "Grey joggers",
            itemCategory = "bottom",
            itemImage = "https://example.com/images/pants-003.jpg",
            style = new List<string> { "sporty", "athletic", "comfortable" },
            colors = new List<string> { "gray" },
            season = "all"
        },
        new OutfitItem
        {
            itemId = "shirt-003",
            itemName = "Sport tank top",
            itemCategory = "top",
            itemImage = "https://example.com/images/shirt-003.jpg",
            style = new List<string> { "sporty", "athletic", "comfortable" },
            colors = new List<string> { "black", "white" },
            season = "all"
        },
        new OutfitItem
        {
            itemId = "shoes-003",
            itemName = "Running shoes",
            itemCategory = "shoes",
            itemImage = "https://example.com/images/shoes-003.jpg",
            style = new List<string> { "sporty", "athletic", "comfortable" },
            colors = new List<string> { "black", "white" },
            season = "all"
        },
        // Outfit 4 - Casual/Day
        new OutfitItem
        {
            itemId = "pants-004",
            itemName = "Black jeans",
            itemCategory = "bottom",
            itemImage = "https://example.com/images/pants-004.jpg",
            style = new List<string> { "casual", "comfortable", "relaxed" },
            colors = new List<string> { "black" },
            season = "all"
        },
        new OutfitItem
        {
            itemId = "shirt-004",
            itemName = "Red t‑shirt",
            itemCategory = "top",
            itemImage = "https://example.com/images/shirt-004.jpg",
            style = new List<string> { "casual", "comfortable", "relaxed" },
            colors = new List<string> { "red" },
            season = "all"
        },
        new OutfitItem
        {
            itemId = "shoes-004",
            itemName = "Adidas sneakers",
            itemCategory = "shoes",
            itemImage = "https://example.com/images/shoes-004.jpg",
            style = new List<string> { "casual", "comfortable", "relaxed" },
            colors = new List<string> { "white", "black" },
            season = "all"
        }
    };

    public bool IsClosetEmpty()
    {
        return items.Count == 0;
    }

    public OutfitRecommendationResponse GetOutfitByCriteria(OutfitCriteria criteria)
    {
        var returnedOutfit = new OutfitRecommendationResponse();

        // Filter items based on criteria (style, colors, season)
        // Go through all items and check if they match the criteria
        List<OutfitItem> filteredItems = new List<OutfitItem>();

        foreach (var item in items)
        {
            // Check style: if criteria has no styles, accept all. Otherwise, check if item has matching style
            bool styleMatch = true;
            if (criteria.style.Count > 0)
            {
                styleMatch = false;
                foreach (var itemStyle in item.style)
                {
                    foreach (var requestedStyle in criteria.style)
                    {
                        if (itemStyle == requestedStyle)
                        {
                            styleMatch = true;
                            break;
                        }
                    }
                    if (styleMatch) break;
                }
            }

            // Check colors: if criteria has no colors, accept all. Otherwise, check if item has matching color
            bool colorMatch = true;
            if (criteria.colors.Count > 0)
            {
                colorMatch = false;
                foreach (var itemColor in item.colors)
                {
                    foreach (var requestedColor in criteria.colors)
                    {
                        if (itemColor.ToLower() == requestedColor.ToLower())
                        {
                            colorMatch = true;
                            break;
                        }
                    }
                    if (colorMatch) break;
                }
            }

            // Check season: if criteria season is "all" or item season is "all", accept. Otherwise, must match exactly
            bool seasonMatch = false;
            if (criteria.season == "all" || item.season == "all")
            {
                seasonMatch = true;
            }
            else if (item.season == criteria.season)
            {
                seasonMatch = true;
            }

            // If all three conditions match, add this item to filtered list
            if (styleMatch && colorMatch && seasonMatch)
            {
                filteredItems.Add(item);
            }
        }

        // Group items by category to ensure we have one of each type (bottom, top, shoes)
        // Find one item from each category (bottom, top, shoes)
        OutfitItem? bottomItem = null;
        OutfitItem? topItem = null;
        OutfitItem? shoesItem = null;

        foreach (var item in filteredItems)
        {
            if (item.itemCategory == "bottom" && bottomItem == null)
            {
                bottomItem = item;
            }
            else if (item.itemCategory == "top" && topItem == null)
            {
                topItem = item;
            }
            else if (item.itemCategory == "shoes" && shoesItem == null)
            {
                shoesItem = item;
            }
        }

        // Add one item from each category if we found them
        if (bottomItem != null)
            returnedOutfit.items.Add(bottomItem);
        if (topItem != null)
            returnedOutfit.items.Add(topItem);
        if (shoesItem != null)
            returnedOutfit.items.Add(shoesItem);

        if (returnedOutfit.items.Count == 0)
        {
            returnedOutfit.reasonText = "there are no matching items in the closet";
        }

        return returnedOutfit;
    }
}