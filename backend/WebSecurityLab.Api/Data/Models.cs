using Microsoft.AspNetCore.Identity;

namespace WebSecurityLab.Api.Data;

public class AppUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
}

// Used by the XSS modules (stored XSS demo): comments are rendered back to other users.
public class Comment
{
    public int Id { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

// Used by the IDOR module: each document belongs to a single owner.
public class Document
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

// Used by the CSRF module: a simple balance a logged-in user can transfer from.
public class Account
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}

// Used by the SQL Injection module: a simple searchable catalog.
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
