using Microsoft.AspNetCore.Mvc;

namespace WebSecurityLab.Api.Modules.Misconfiguration;

// VULNERABLE: leaks internal implementation details in error responses and
// sends no defensive security headers, so a caller learns far more about
// the server than it should be able to.
[ApiController]
[Route("api/misconfiguration/vulnerable")]
public class VulnerableController(IWebHostEnvironment env, IConfiguration configuration) : ControllerBase
{
    [HttpGet("crash")]
    public IActionResult Crash()
    {
        try
        {
            throw new InvalidOperationException("Simulated failure reaching the payments service.");
        }
        catch (Exception ex)
        {
            // Bug: returns the full exception, including stack trace and
            // .NET/framework details, straight to the client.
            return StatusCode(500, new
            {
                error = ex.Message,
                stackTrace = ex.StackTrace,
                exceptionType = ex.GetType().FullName,
                environment = env.EnvironmentName
            });
        }
    }

    [HttpGet("info")]
    public IActionResult Info()
    {
        // Bug: exposes configuration/connection details that should never
        // leave the server.
        return Ok(new
        {
            environment = env.EnvironmentName,
            connectionString = configuration.GetConnectionString("DefaultConnection"),
            frameworkVersion = Environment.Version.ToString(),
            machineName = Environment.MachineName
        });
    }
}

// SECURE: returns a generic error to the client (the real details would go
// to server-side logs instead), and adds standard defensive headers.
[ApiController]
[Route("api/misconfiguration/secure")]
public class SecureController(ILogger<SecureController> logger) : ControllerBase
{
    [HttpGet("crash")]
    public IActionResult Crash()
    {
        try
        {
            throw new InvalidOperationException("Simulated failure reaching the payments service.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Simulated failure in secure crash endpoint");
            return StatusCode(500, new { error = "An unexpected error occurred. Please try again later." });
        }
    }

    [HttpGet("info")]
    public IActionResult Info()
    {
        AddSecurityHeaders();
        return Ok(new { message = "No internal details are exposed by this endpoint." });
    }

    private void AddSecurityHeaders()
    {
        Response.Headers.Append("X-Content-Type-Options", "nosniff");
        Response.Headers.Append("X-Frame-Options", "DENY");
        Response.Headers.Append("Referrer-Policy", "no-referrer");
        Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
}
