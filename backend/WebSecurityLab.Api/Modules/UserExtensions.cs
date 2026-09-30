using System.Security.Claims;

namespace WebSecurityLab.Api.Modules;

public static class UserExtensions
{
    public static string RequireUserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("User id claim missing.");
}
