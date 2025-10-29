using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models; // Add this
using System.Text;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Repositories.Implementations;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Implementations;
using SprintEvaluationProjectCropDeal.Services;
using SprintEvaluationProjectCropDeal.Models;
using IAuthService = SprintEvaluationProjectCropDeal.Services.Interfaces.IAuthorizationService;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT Bearer Authentication
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CropDeal API",
        Version = "v1",
        Description = "API for CropDeal Platform - Connecting Farmers and Dealers",
        Contact = new OpenApiContact
        {
            Name = "CropDeal Support",
            Email = "support@cropdeal.com"
        }
    });

    // Add JWT Bearer Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token.\n\nExample: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Email Settings Configuration
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

// Register Repositories
builder.Services.AddScoped<IFarmerRepository, FarmerRepository>();
builder.Services.AddScoped<IDealerRepository, DealerRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<ICropsRepository, CropsRepository>();
builder.Services.AddScoped<ICropPurchaseRepository, CropPurchaseRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();

// Register Services
builder.Services.AddScoped<IFarmerService, FarmerService>();
builder.Services.AddScoped<IDealerService, DealerService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ICropsService, CropsService>();
builder.Services.AddScoped<ICropPurchaseService, CropPurchaseService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthorizationService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Headers["Authorization"].ToString()?.Replace("Bearer ", "");
            if (!string.IsNullOrEmpty(accessToken))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            var te = context.Exception;
            return Task.CompletedTask;
        }
    };
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer is not configured"),
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience is not configured"),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };
});

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("FarmerOnly", policy => policy.RequireRole("Farmer"));
    options.AddPolicy("DealerOnly", policy => policy.RequireRole("Dealer"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("FarmerOrDealer", policy => policy.RequireRole("Farmer", "Dealer"));
    options.AddPolicy("AdminOrDealer", policy => policy.RequireRole("Admin", "Dealer"));
    options.AddPolicy("AdminOrFarmer", policy => policy.RequireRole("Admin", "Farmer"));
    options.AddPolicy("AdminOrDealerOrFarmer", policy => policy.RequireRole("Admin", "Farmer", "Dealer"));
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder =>
        {
            builder.SetIsOriginAllowed(_ => true)
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .WithExposedHeaders("Authorization", "Content-Type")
                   .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "CropDeal API v1");
        options.DocumentTitle = "CropDeal API Documentation";
    });
}

app.UseCors("AllowAngularApp"); // Must come before UseAuthentication
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection(); // Only redirect to HTTPS in production
}
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();