using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NullzoneStudiosWebsite.Server.Services;
using System.Security.Cryptography;
using System.Text;
using Pomelo.EntityFrameworkCore.MySql;

namespace NullzoneStudiosWebsite.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
#if DEBUG
            string path = $"{Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)}\\NullZoneWebsiteAPI\\config\\.env";
#else
            string path = $"config/.env";
#endif
            Env.Load(path: path);

            var builder = WebApplication.CreateBuilder(args);

            // JWT Authentication
            byte[] jwtKey = SHA256.HashData(Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:KEY"]
                ?? throw new InvalidOperationException("JWT key not configured.")));
            
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:ISSUER"],
                    ValidAudience = builder.Configuration["Jwt:AUDIENCE"],
                    IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = ctx =>
                    {
                        ctx.Token = ctx.Request.Cookies["access_token"];
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = ctx =>
                    {
                        Console.WriteLine($"Auth failed: {ctx.Exception.Message}");
                        return Task.CompletedTask;
                    }
                };
            });

            // Add services to the container.
            builder.Services.AddAuthorization();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddDbContext<DataContext>(options =>
            {
                string connectionString = $"Server={builder.Configuration["Db:SERVER"]};Database={builder.Configuration["Db:DATABASE"]};UserId={builder.Configuration["Db:USER"]};Password={builder.Configuration["Db:PASSWORD"]}";
                options.UseMySql(
                    connectionString,
                    ServerVersion.AutoDetect(connectionString));
            });

            builder.Services.AddScoped<TokenService>();
            builder.Services.AddScoped<EmailService>();
            builder.Services.AddHostedService<TokenCleanupService>();
            builder.Services.AddHostedService<EmailSyncService>();

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.MapStaticAssets();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
