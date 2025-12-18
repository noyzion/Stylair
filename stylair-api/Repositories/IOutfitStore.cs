//interface that says "u can ask me for an outfit"
//we are using interface beacuse of the future change from mockDB to DynamoDB
public interface IOutfitStore
{
    OutfitRecommendationResponse GetOutfitById(string outfitId);
}