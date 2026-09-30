using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSecurityLab.Api.Data;

namespace WebSecurityLab.Api.Modules.Csrf;

using WebSecurityLab.Api.Modules;

public record TransferRequest(decimal Amount);

// VULNERABLE: a state-changing POST that relies only on the ambient auth
// cookie, with no anti-forgery token and no SameSite protection. Any page
// on the internet can make the logged-in user's browser send this request
// (e.g. an auto-submitting <form> or fetch with credentials) and it will
// succeed, because the browser attaches the cookie automatically.
[ApiController]
[Route("api/csrf/vulnerable")]
[Authorize]
public class VulnerableController(AppDbContext db) : ControllerBase
{
    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer(TransferRequest request)
    {
        var userId = User.RequireUserId();
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.OwnerId == userId)
            ?? await SeedAccount(userId);

        account.Balance -= request.Amount;
        await db.SaveChangesAsync();

        return Ok(new { account.Balance, message = "Transfer executed with no CSRF protection." });
    }

    [HttpGet("balance")]
    public async Task<IActionResult> Balance()
    {
        var userId = User.RequireUserId();
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.OwnerId == userId)
            ?? await SeedAccount(userId);
        return Ok(new { account.Balance });
    }

    private async Task<Account> SeedAccount(string userId)
    {
        var account = new Account { OwnerId = userId, Balance = 1000m };
        db.Accounts.Add(account);
        await db.SaveChangesAsync();
        return account;
    }
}

// SECURE: requires a custom header carrying a per-session anti-CSRF token
// (double-submit cookie pattern), which a cross-origin attacker page cannot
// read or set because of the browser's same-origin policy. The Identity
// auth cookie is also SameSite=Lax (configured in Program.cs), which is a
// second layer of defense.
[ApiController]
[Route("api/csrf/secure")]
[Authorize]
public class SecureController(AppDbContext db) : ControllerBase
{
    private const string CsrfCookieName = "XSRF-TOKEN";
    private const string CsrfHeaderName = "X-XSRF-TOKEN";

    [HttpGet("csrf-token")]
    public IActionResult GetToken()
    {
        var token = Guid.NewGuid().ToString("N");
        Response.Cookies.Append(CsrfCookieName, token, new CookieOptions
        {
            HttpOnly = false, // must be readable by JS so it can be echoed back in the header
            Secure = true,
            SameSite = SameSiteMode.Strict
        });
        return Ok(new { token });
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer(TransferRequest request)
    {
        var cookieToken = Request.Cookies[CsrfCookieName];
        var headerToken = Request.Headers[CsrfHeaderName].ToString();

        if (string.IsNullOrEmpty(cookieToken) || string.IsNullOrEmpty(headerToken) || cookieToken != headerToken)
        {
            return BadRequest(new { message = "Missing or invalid CSRF token." });
        }

        var userId = User.RequireUserId();
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.OwnerId == userId)
            ?? await SeedAccount(userId);

        account.Balance -= request.Amount;
        await db.SaveChangesAsync();

        return Ok(new { account.Balance, message = "Transfer executed after CSRF token validation." });
    }

    [HttpGet("balance")]
    public async Task<IActionResult> Balance()
    {
        var userId = User.RequireUserId();
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.OwnerId == userId)
            ?? await SeedAccount(userId);
        return Ok(new { account.Balance });
    }

    private async Task<Account> SeedAccount(string userId)
    {
        var account = new Account { OwnerId = userId, Balance = 1000m };
        db.Accounts.Add(account);
        await db.SaveChangesAsync();
        return account;
    }
}
