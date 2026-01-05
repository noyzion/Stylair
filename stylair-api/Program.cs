using System.ComponentModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using stylair_api.Data;
using stylair_api.Repositories;
using stylair_api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
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
// JWT Authentication Configuration
// ============================================
var cognitoAuthority = builder.Configuration["Cognito:Authority"] 
    ?? throw new InvalidOperationException("Cognito:Authority is required in appsettings.json");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Authority = cognitoAuthority;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        // Cognito signing keys handled automatically by JwtBearer middleware
    };
    
    // Handle token validation events
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine($"Token validated for user: {context.Principal?.Identity?.Name}");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ============================================
// PostgreSQL Connection Configuration
var connectionString = builder.Configuration.GetConnectionString("Postgres");
if (connectionString != null && connectionString.Contains("${DB_PASSWORD}"))
{
    var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
    if (string.IsNullOrEmpty(dbPassword))
    {
        throw new InvalidOperationException("DB_PASSWORD environment variable is required but not set. Please set it before running the application.");
    }
    Console.WriteLine($"DB_PASSWORD environment variable found: {dbPassword}");
    connectionString = connectionString.Replace("${DB_PASSWORD}", dbPassword);
}


// Register DbContext with PostgreSQL
builder.Services.AddDbContext<StylairDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register services
builder.Services.AddScoped<IClosetItemStore, PostgresClosetItemStore>();
builder.Services.AddScoped<ClosetService>();
builder.Services.AddScoped<ISavedOutfitStore, PostgresSavedOutfitStore>();
builder.Services.AddScoped<SavedOutfitService>();
builder.Services.AddScoped<SupabaseStorageService>();

// OpenAI Configuration - requires OPENAI_API_KEY environment variable

// Validate OpenAI API key on startup
var openAiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
if (string.IsNullOrWhiteSpace(openAiApiKey))
{
    Console.WriteLine("WARNING: OPENAI_API_KEY environment variable is not set!");
    Console.WriteLine("AI image analysis features will not work until OPENAI_API_KEY is configured.");
    Console.WriteLine("To set: $env:OPENAI_API_KEY=\"sk-your-key-here\" (PowerShell)");
    Console.WriteLine("NEVER commit API keys to GitHub!");
}
else if (!openAiApiKey.StartsWith("sk-", StringComparison.OrdinalIgnoreCase))
{
    Console.WriteLine("WARNING: OPENAI_API_KEY format appears invalid (should start with 'sk-')");
}
else
{
    Console.WriteLine("OPENAI_API_KEY environment variable found and validated");
}

// Register OpenAI services
try
{
    builder.Services.AddScoped<OpenAIImageAnalysisService>();
    builder.Services.AddScoped<OutfitChatService>();
}
catch (Exception ex)
{
    Console.WriteLine($"Failed to register OpenAI service: {ex.Message}");
    Console.WriteLine("AI endpoints will not be available until OPENAI_API_KEY is configured.");
}

var app = builder.Build();

// Test database connection on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<StylairDbContext>();
    try
    {
        var canConnect = dbContext.Database.CanConnect();
        if (canConnect)
        {
            Console.WriteLine("Database connection successful!");
        }
        else
        {
            Console.WriteLine("Database connection failed: CanConnect() returned false");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database connection failed: {ex.Message}");
    }

    // Test OpenAI configuration
    try
    {
        var isOpenAIConfigured = OpenAIImageAnalysisService.ValidateApiKey();
        if (isOpenAIConfigured)
        {
            Console.WriteLine("OpenAI API key is configured and ready");
        }
        else
        {
            Console.WriteLine("OpenAI API key is not configured - AI features will not work");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"OpenAI configuration check failed: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(); // Enable CORS
//app.UseHttpsRedirection();

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
