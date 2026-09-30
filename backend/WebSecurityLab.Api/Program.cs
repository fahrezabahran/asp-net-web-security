using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebSecurityLab.Api.Data;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendCorsPolicy";

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cookie-based auth is used deliberately (rather than JWT) so the CSRF and
// session-security modules can demonstrate real cookie behavior (SameSite,
// HttpOnly, Secure, session fixation, etc).
builder.Services
    .AddIdentity<AppUser, IdentityRole>(options =>
    {
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "WebSecurityLab.Auth";
    // These are the "secure by default" cookie settings for the app-wide
    // Identity cookie. The vulnerable/secure *comparison* for cookie flags
    // lives in the Auth module's own endpoints, not here.
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
});

var allowedOrigin = builder.Configuration["Cors:AllowedOrigin"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    // Explicit origin + AllowCredentials so the browser will actually send
    // the auth cookie cross-origin from the Next.js dev server — this is
    // also what makes the CSRF module's "attack from another origin" demo
    // realistic instead of blocked at the network layer.
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            // Exposes these response headers to the frontend's JS, purely so
            // the lab UI can display and compare security headers (this
            // would not be done in a real API). Note: a "*" wildcard here is
            // NOT honored by browsers once AllowCredentials() is set, so the
            // headers the demo cares about are listed explicitly.
            .WithExposedHeaders(
                "X-Content-Type-Options",
                "X-Frame-Options",
                "Referrer-Policy",
                "Strict-Transport-Security",
                "Content-Security-Policy");
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
