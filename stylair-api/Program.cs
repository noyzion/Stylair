using System.ComponentModel;
using Microsoft.EntityFrameworkCore;
using stylair_api.Data;
using stylair_api.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi(); ////maybe delete
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Add CORS to allow requests from the frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ============================================
// PostgreSQL Connection Configuration
// ============================================
// Read the connection string from appsettings.json file
// The connection string contains: Host, Port, Database, Username, Password
// DB_PASSWORD environment variable will replace ${DB_PASSWORD} in the connection string
var connectionString = builder.Configuration.GetConnectionString("Postgres");
if (connectionString != null && connectionString.Contains("${DB_PASSWORD}"))
{
    var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
    if (string.IsNullOrEmpty(dbPassword))
    {
        Console.WriteLine("❌ DB_PASSWORD environment variable is not set!");
        Console.WriteLine("   Please set it with: export DB_PASSWORD=\"your_password\"");
        Console.WriteLine("   The application will not start without this variable.");
        throw new InvalidOperationException("DB_PASSWORD environment variable is required but not set. Please set it before running the application.");
    }
    Console.WriteLine("✅ DB_PASSWORD environment variable found");
    connectionString = connectionString.Replace("${DB_PASSWORD}", dbPassword);
}

// Register the DbContext in the Dependency Injection system
// UseNpgsql - tells EF Core to use Npgsql (the PostgreSQL driver)
// The DbContext will be automatically injected to anyone who needs it (like PostgresClosetItemStore)
builder.Services.AddDbContext<StylairDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register services
builder.Services.AddScoped<OutfitRecommendationService>();
builder.Services.AddScoped<IOutfitStore, MockOutfitStore>();
builder.Services.AddScoped<IClosetItemStore, PostgresClosetItemStore>();
builder.Services.AddScoped<ClosetService>();

var app = builder.Build();

// Test database connection on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<StylairDbContext>();
    try
    {
        // Just test the connection without creating tables
        var canConnect = dbContext.Database.CanConnect();
        if (canConnect)
        {
            Console.WriteLine("✅ Database connection successful!");
        }
        else
        {
            Console.WriteLine("⚠️ Database connection test returned false");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database connection failed: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"   Inner exception: {ex.InnerException.Message}");
        }
        // Don't throw - let the app start anyway, connection will be tested on first request
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.MapOpenApi(); ////maybe delete
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(); // Enable CORS
//app.UseHttpsRedirection();
app.MapControllers();

// var summaries = new[]
// {
//     "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
// };

// app.MapGet("/weatherforecast", () =>
// {
//     var forecast = Enumerable.Range(1, 5).Select(index =>
//         new WeatherForecast
//         (
//             DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
//             Random.Shared.Next(-20, 55),
//             summaries[Random.Shared.Next(summaries.Length)]
//         ))
//         .ToArray();
//     return forecast;
// })
// .WithName("GetWeatherForecast");

app.Run();

// record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
// {
//     public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
// }
