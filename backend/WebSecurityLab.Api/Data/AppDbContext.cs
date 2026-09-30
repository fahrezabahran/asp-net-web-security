using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace WebSecurityLab.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Account>().Property(a => a.Balance).HasPrecision(18, 2);
        builder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);

        builder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Wireless Mouse", Category = "Electronics", Price = 19.99m },
            new Product { Id = 2, Name = "Mechanical Keyboard", Category = "Electronics", Price = 59.99m },
            new Product { Id = 3, Name = "Standing Desk", Category = "Furniture", Price = 249.00m },
            new Product { Id = 4, Name = "Office Chair", Category = "Furniture", Price = 179.50m },
            new Product { Id = 5, Name = "Notebook", Category = "Stationery", Price = 3.49m }
        );
    }
}
