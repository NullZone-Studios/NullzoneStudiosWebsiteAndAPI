namespace NullzoneStudiosWebsite.Server.Services
{
    public class EmailSyncService(IServiceProvider provider, ILogger<EmailSyncService> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = provider.CreateScope();
                var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();
                var db = scope.ServiceProvider.GetRequiredService<DataContext>();

                try
                {
                    await emailService.SyncEmailsAsync(db);
                } catch (Exception ex)
                {
                    logger.LogError(ex, "Email sync failed.");
                }

                await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
            }
        }
    }
}
