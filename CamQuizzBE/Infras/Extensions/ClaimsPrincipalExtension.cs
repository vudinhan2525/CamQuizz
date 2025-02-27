namespace CamQuizzBE.Infras.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string? GetEmail(this ClaimsPrincipal user)
    {
        var email = user.FindFirstValue(ClaimTypes.Email);

        return email;
    }

  public static int GetUserId(this ClaimsPrincipal user)
    {
        Console.WriteLine("🔍 Debugging Claims in GetUserId(): " + user);
        foreach (var claim in user.Claims)
        {
            Console.WriteLine($"🔹 Claim Type: {claim.Type}, Value: {claim.Value}");
        }

        var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier) 
                        ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub) 
                        ?? user.FindFirstValue(JwtRegisteredClaimNames.NameId) 
                        ?? throw new Exception("Cannot get user id from token");

        Console.WriteLine($"✅ Extracted User ID: {userIdClaim}");
        return int.Parse(userIdClaim);
    }
}
