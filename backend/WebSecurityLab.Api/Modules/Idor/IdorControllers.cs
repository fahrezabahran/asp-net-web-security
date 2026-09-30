using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSecurityLab.Api.Data;

namespace WebSecurityLab.Api.Modules.Idor;

using WebSecurityLab.Api.Modules;

public record CreateDocumentRequest(string Title, string Content);

// VULNERABLE: returns any document by id as long as the caller is
// authenticated, with no check that the caller actually owns it. Any logged
// in user can enumerate ids (1, 2, 3, ...) and read everyone else's
// documents.
[ApiController]
[Route("api/idor/vulnerable")]
[Authorize]
public class VulnerableController(AppDbContext db) : ControllerBase
{
    [HttpPost("documents")]
    public async Task<IActionResult> Create(CreateDocumentRequest request)
    {
        var document = new Document
        {
            OwnerId = User.RequireUserId(),
            Title = request.Title,
            Content = request.Content
        };
        db.Documents.Add(document);
        await db.SaveChangesAsync();
        return Ok(document);
    }

    [HttpGet("documents/mine")]
    public async Task<IActionResult> Mine()
    {
        var userId = User.RequireUserId();
        var documents = await db.Documents.Where(d => d.OwnerId == userId).ToListAsync();
        return Ok(documents);
    }

    [HttpGet("documents/{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var document = await db.Documents.FindAsync(id);
        if (document is null)
        {
            return NotFound();
        }

        // Bug: no ownership check before returning the resource.
        return Ok(document);
    }
}

// SECURE: the same lookup, but the current user's id is compared against
// the resource's owner before returning it.
[ApiController]
[Route("api/idor/secure")]
[Authorize]
public class SecureController(AppDbContext db) : ControllerBase
{
    [HttpPost("documents")]
    public async Task<IActionResult> Create(CreateDocumentRequest request)
    {
        var document = new Document
        {
            OwnerId = User.RequireUserId(),
            Title = request.Title,
            Content = request.Content
        };
        db.Documents.Add(document);
        await db.SaveChangesAsync();
        return Ok(document);
    }

    [HttpGet("documents/mine")]
    public async Task<IActionResult> Mine()
    {
        var userId = User.RequireUserId();
        var documents = await db.Documents.Where(d => d.OwnerId == userId).ToListAsync();
        return Ok(documents);
    }

    [HttpGet("documents/{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var document = await db.Documents.FindAsync(id);
        if (document is null)
        {
            return NotFound();
        }

        if (document.OwnerId != User.RequireUserId())
        {
            // Respond the same way as "not found" to avoid confirming the
            // resource exists at all (avoids leaking existence via 403 vs 404).
            return NotFound();
        }

        return Ok(document);
    }
}
