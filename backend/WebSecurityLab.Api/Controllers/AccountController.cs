using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebSecurityLab.Api.Data;

namespace WebSecurityLab.Api.Controllers;

public record RegisterRequest(string Email, string Password, string DisplayName);
public record LoginRequest(string Email, string Password);

// Shared, non-vulnerable session management used by the other modules
// (CSRF, IDOR, etc) so they have a real logged-in user to work with.
// The Auth module's own Vulnerable/Secure controllers demonstrate
// session-security-specific bugs separately.
[ApiController]
[Route("api/account")]
public class AccountController(
    UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var user = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        await signInManager.SignInAsync(user, isPersistent: true);
        return Ok(new { user.Id, user.Email, user.DisplayName });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await signInManager.PasswordSignInAsync(
            request.Email, request.Password, isPersistent: true, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        return Ok(new { message = "Logged in." });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return Ok(new { message = "Logged out." });
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Unauthorized();
        }

        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new { user.Id, user.Email, user.DisplayName });
    }
}
