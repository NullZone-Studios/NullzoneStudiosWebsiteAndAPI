using Microsoft.EntityFrameworkCore;

namespace NullzoneStudiosWebsite.Server.Services
{
    public class TokenCleanupService(IServiceProvider serviceProvider, ILogger<TokenCleanupService> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                    var cutoff = DateTime.UtcNow;

                    var staleRefreshTokens = await db.RefreshTokens
                        .Where(t => t.RevokedAt != null || t.ExpiresAt <= cutoff)
                        .ToListAsync();
                    db.RefreshTokens.RemoveRange(staleRefreshTokens);

                    var staleResetTokens = await db.PasswordResetTokens
                        .Where(t => t.UsedAt != null || t.ExpiresAt <= cutoff)
                        .ToListAsync();
                    db.PasswordResetTokens.RemoveRange(staleResetTokens);

                    var deleted = staleRefreshTokens.Count + staleResetTokens.Count;
                    if (deleted > 0)
                        logger.LogInformation("Token cleanup: removed {Count} stale tokens.", deleted);

                    await db.SaveChangesAsync();
                } catch (Exception ex)
                {
                    logger.LogError(ex, "Token cleanup failed.");
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}
