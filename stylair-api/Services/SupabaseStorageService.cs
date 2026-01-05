using System.Text;
using System.Text.Json;

namespace stylair_api.Services;

/// <summary>
/// Service for uploading and deleting images from Supabase Storage
/// </summary>
public class SupabaseStorageService
{
    private readonly string _supabaseUrl;
    private readonly string _supabaseKey;
    private readonly string _bucketName;
    private readonly HttpClient _httpClient;

    public SupabaseStorageService(IConfiguration configuration)
    {
        _supabaseUrl = configuration["Supabase:Url"] ?? throw new InvalidOperationException("Supabase:Url is required in appsettings.json");
        
        // Get Supabase key from configuration or environment variable
        var configKey = configuration["Supabase:Key"];
        if (configKey != null && configKey.Contains("${SUPABASE_KEY}"))
        {
            var envKey = Environment.GetEnvironmentVariable("SUPABASE_KEY");
            if (string.IsNullOrEmpty(envKey))
            {
                throw new InvalidOperationException("SUPABASE_KEY environment variable is required but not set. Please set it before running the application.");
            }
            _supabaseKey = envKey;
            Console.WriteLine("SUPABASE_KEY environment variable found");
        }
        else
        {
            _supabaseKey = configKey ?? throw new InvalidOperationException("Supabase:Key is required in appsettings.json or SUPABASE_KEY environment variable");
        }
        
        _bucketName = configuration["Supabase:BucketName"] ?? "item-images";
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("apikey", _supabaseKey);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_supabaseKey}");
    }

    /// <summary>
    /// Uploads an image to Supabase Storage and returns the public URL
    /// </summary>
    /// <param name="imageData">Base64 encoded image data or local file URI</param>
    /// <param name="fileName">Optional file name. If not provided, a GUID will be used</param>
    /// <returns>Public URL of the uploaded image</returns>
    public async Task<string> UploadImageAsync(string imageData, string? fileName = null)
    {
        try
        {
            // Generate unique file name if not provided
            if (string.IsNullOrEmpty(fileName))
            {
                fileName = $"{Guid.NewGuid()}.jpg";
            }

            byte[] imageBytes;

            // Handle base64 data
            if (imageData.StartsWith("data:image"))
            {
                // Extract base64 part from data URI (format: data:image/jpeg;base64,...)
                var commaIndex = imageData.IndexOf(',');
                if (commaIndex > 0)
                {
                    var base64Data = imageData.Substring(commaIndex + 1);
                    imageBytes = Convert.FromBase64String(base64Data);
                }
                else
                {
                    throw new ArgumentException("Invalid data URI format");
                }
            }
            else if (imageData.StartsWith("file://") || imageData.StartsWith("/"))
            {
                // Handle local file URI - read the file
                var filePath = imageData.Replace("file://", "");
                if (File.Exists(filePath))
                {
                    imageBytes = await File.ReadAllBytesAsync(filePath);
                }
                else
                {
                    throw new FileNotFoundException($"Image file not found: {imageData}");
                }
            }
            else
            {
                // Try to decode as base64 (pure base64 string)
                try
                {
                    imageBytes = Convert.FromBase64String(imageData);
                }
                catch
                {
                    throw new ArgumentException("Invalid image data format. Expected base64, data URI, or file path.");
                }
            }

            // Upload to Supabase Storage
            var uploadUrl = $"{_supabaseUrl}/storage/v1/object/{_bucketName}/{fileName}";
            
            using var content = new ByteArrayContent(imageBytes);
            content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");

            var response = await _httpClient.PostAsync(uploadUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Failed to upload image to Supabase Storage: {response.StatusCode} - {errorContent}");
            }

            // Return public URL
            var publicUrl = $"{_supabaseUrl}/storage/v1/object/public/{_bucketName}/{fileName}";
            return publicUrl;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error uploading image to Supabase Storage: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Deletes an image from Supabase Storage
    /// </summary>
    /// <param name="imageUrl">Full URL of the image to delete</param>
    public async Task DeleteImageAsync(string imageUrl)
    {
        try
        {
            // Extract file name from URL
            // URL format: https://[project].supabase.co/storage/v1/object/public/item-images/[filename]
            var fileName = imageUrl.Split('/').LastOrDefault();
            
            if (string.IsNullOrEmpty(fileName))
            {
                throw new ArgumentException("Invalid image URL format");
            }

            var deleteUrl = $"{_supabaseUrl}/storage/v1/object/{_bucketName}/{fileName}";

            var response = await _httpClient.DeleteAsync(deleteUrl);

            if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Failed to delete image from Supabase Storage: {response.StatusCode} - {errorContent}");
            }
        }
        catch (Exception ex)
        {
            // Log error but don't throw - deletion from storage is not critical if item is deleted from DB
            Console.WriteLine($"Warning: Failed to delete image from Supabase Storage: {ex.Message}");
        }
    }
}

