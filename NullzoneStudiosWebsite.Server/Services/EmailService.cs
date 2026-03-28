using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace NullzoneStudiosWebsite.Server.Services
{
    public class EmailService(IConfiguration config)
    {
        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(
                config["Email:FROM"]
                ?? throw new InvalidOperationException("Email FROM not configured.")));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html")
            {
                Text = htmlBody
            };

            using SmtpClient smtp = new SmtpClient();
            await smtp.ConnectAsync(
                config["Email:HOST"] ?? throw new InvalidOperationException("Email HOST not configured."),
                int.Parse(config["Email:PORT"] ?? "587"),
                SecureSocketOptions.StartTls);

            await smtp.AuthenticateAsync(
                    config["Email:USERNAME"] ?? throw new InvalidOperationException("Email USERNAME not configured."),
                    config["Email:PASSWORD"] ?? throw new InvalidOperationException("Email PASSWORD not configured.")
                );

            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }

        public string LoadTemplate(string templateName, Dictionary<string, string> replacements)
        {
            var path = Path.Combine(AppContext.BaseDirectory, "EmailTemplates", templateName);
            var template = File.ReadAllText(path);

            foreach (var (key, value) in replacements)
                template = template.Replace($"{{{{{key}}}}}", value);

            return template;
        }
    }
}
