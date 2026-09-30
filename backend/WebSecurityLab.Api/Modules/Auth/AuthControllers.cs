using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebSecurityLab.Api.Data;

namespace WebSecurityLab.Api.Modules.Auth;

public record DemoLoginRequest(string Email, string Password);

// These two controllers issue their own hand-rolled session cookie (instead
// of the app-wide Identity cookie configured in Program.cs) purely so the
// vulnerable/secure contrast in cookie *attributes* and session handling is
// visible and self-contained, independent of the shared login used by the
// other modules.
[ApiController]
[Route("api/auth/vulnerable")]
public class VulnerableController(UserManager<AppUser> userManager) : ControllerBase
{
    private const string CookieName = "session_vulnerable";

    // In-memory session store for the demo only.
    private static readonly Dictionary<string, string> Sessions = new();

    [HttpPost("login")]
    public async Task<IActionResult> Login(DemoLoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            // No lockout / rate limiting: this endpoint can be brute-forced.
            return Unauthorized(new { message = "Invalid credentials." });
        }

        // Session fixation bug: if the caller already had a session_vulnerable
        // cookie, it's reused/kept alive rather than rotated on privilege
        // change (login), so a pre-set attacker session id remains valid.
        var existingSessionId = Request.Cookies[CookieName];
        var sessionId = existingSessionId ?? Guid.NewGuid().ToString("N");
        Sessions[sessionId] = user.Id;

        Response.Cookies.Append(CookieName, sessionId, new CookieOptions
        {
            HttpOnly = false, // readable by JavaScript -> stealable via XSS
            Secure = false,   // sent over plain HTTP -> stealable via network sniffing
            SameSite = SameSiteMode.None
        });

        return Ok(new { message = "Logged in (vulnerable session handling).", sessionId });
    }

    [HttpGet("whoami")]
    public IActionResult WhoAmI()
    {
        var sessionId = Request.Cookies[CookieName];
        if (sessionId is null || !Sessions.TryGetValue(sessionId, out var userId))
        {
            return Unauthorized();
        }

        return Ok(new { userId });
    }
}

[ApiController]
[Route("api/auth/secure")]
public class SecureController(UserManager<AppUser> userManager) : ControllerBase
{
    private const string CookieName = "session_secure";
    private static readonly Dictionary<string, (string UserId, DateTime ExpiresUtc)> Sessions = new();
    private static readonly Dictionary<string, int> FailedAttempts = new();

    [HttpPost("login")]
    public async Task<IActionResult> Login(DemoLoginRequest request)
    {
        FailedAttempts.TryGetValue(request.Email, out var attempts);
        if (attempts >= 5)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests,
                new { message = "Too many failed attempts. Try again later." });
        }

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            FailedAttempts[request.Email] = attempts + 1;
            return Unauthorized(new { message = "Invalid credentials." });
        }

        FailedAttempts.Remove(request.Email);

        // Session rotation: always issue a brand-new, cryptographically
        // random session id on login, invalidating whatever session (if any)
        // the browser presented beforehand. This defeats session fixation.
        var oldSessionId = Request.Cookies[CookieName];
        if (oldSessionId is not null)
        {
            Sessions.Remove(oldSessionId);
        }

        var sessionId = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        Sessions[sessionId] = (user.Id, DateTime.UtcNow.AddMinutes(30));

        Response.Cookies.Append(CookieName, sessionId, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMinutes(30)
        });

        return Ok(new { message = "Logged in (secure session handling)." });
    }

    [HttpGet("whoami")]
    public IActionResult WhoAmI()
    {
        var sessionId = Request.Cookies[CookieName];
        if (sessionId is null ||
            !Sessions.TryGetValue(sessionId, out var session) ||
            session.ExpiresUtc < DateTime.UtcNow)
        {
            return Unauthorized();
        }

        return Ok(new { userId = session.UserId });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var sessionId = Request.Cookies[CookieName];
        if (sessionId is not null)
        {
            Sessions.Remove(sessionId);
        }

        Response.Cookies.Delete(CookieName);
        return Ok(new { message = "Logged out." });
    }
}
