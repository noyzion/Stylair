using System.Security.Claims;

namespace stylair_api.Extensions;

/// <summary>
/// Extension methods for ClaimsPrincipal to extract user information from JWT tokens
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Gets the user ID from the JWT token claims
    /// Tries to get email first, then falls back to 'sub' (Cognito user ID)
    /// </summary>
    /// <param name="user">The ClaimsPrincipal from the HTTP context</param>
    /// <returns>User ID (email or sub)</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown if user ID cannot be found</exception>
    public static string GetUserId(this ClaimsPrincipal user)
    {
        // Try to get email first (preferred for user identification)
        var email = user.FindFirst(ClaimTypes.Email)?.Value 
            ?? user.FindFirst("email")?.Value;
        
        if (!string.IsNullOrEmpty(email))
        {
            return email;
        }
        
        // Fall back to 'sub' (Cognito user ID) if email is not available
        var sub = user.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? user.FindFirst("sub")?.Value;
        
        if (!string.IsNullOrEmpty(sub))
        {
            return sub;
        }
        
        // If neither email nor sub is found, throw an exception
        throw new UnauthorizedAccessException("User ID not found in token. User must be authenticated.");
    }
    
    /// <summary>
    /// Gets the user's email from the JWT token claims
    /// </summary>
    /// <param name="user">The ClaimsPrincipal from the HTTP context</param>
    /// <returns>User email or null if not found</returns>
    public static string? GetUserEmail(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Email)?.Value 
            ?? user.FindFirst("email")?.Value;
    }
}

