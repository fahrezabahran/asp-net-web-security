using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using WebSecurityLab.Api.Data;

namespace WebSecurityLab.Api.Modules.SqlInjection;

// VULNERABLE: builds a SQL string by concatenating/interpolating the raw
// user input directly into the query text. A search term like
// ' OR '1'='1 returns every row regardless of the intended filter, and a
// term like '; DROP TABLE Products;-- demonstrates destructive potential.
[ApiController]
[Route("api/sql-injection/vulnerable")]
public class VulnerableController(IConfiguration configuration) : ControllerBase
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string term = "")
    {
        using var connection = new SqlConnection(configuration.GetConnectionString("DefaultConnection"));

        // NOTE: string interpolation directly into SQL text is the bug.
        var sql = $"SELECT Id, Name, Category, Price FROM Products WHERE Name LIKE '%{term}%'";

        var results = await connection.QueryAsync(sql);
        return Ok(new { sql, results });
    }
}

// SECURE: the same query, but the user input is always passed as a bound
// parameter, so the database treats it as literal data — never as SQL
// syntax — no matter what characters it contains.
[ApiController]
[Route("api/sql-injection/secure")]
public class SecureController(IConfiguration configuration) : ControllerBase
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string term = "")
    {
        using var connection = new SqlConnection(configuration.GetConnectionString("DefaultConnection"));

        const string sql = "SELECT Id, Name, Category, Price FROM Products WHERE Name LIKE @Pattern";
        var results = await connection.QueryAsync(sql, new { Pattern = $"%{term}%" });

        return Ok(new { sql, results });
    }
}
