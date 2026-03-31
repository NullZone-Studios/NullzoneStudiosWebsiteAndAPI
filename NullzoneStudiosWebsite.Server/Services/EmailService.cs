using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using MailKit.Net.Imap;
using MailKit;
using NullzoneStudiosWebsite.Server.DataModels;
using NullzoneStudiosWebsite.Server.DataModels.Email;
using Microsoft.EntityFrameworkCore;

namespace NullzoneStudiosWebsite.Server.Services
{
    public class EmailService(IConfiguration config)
    {

        public record EmailStats(int amount, int unread);
        public async Task<EmailStats> GetEmailStats()
        {
            using var client = new ImapClient();
            var incoming = GetIncomingEmailConfig();

            await client.ConnectAsync(incoming.host, incoming.port, true);
            await client.AuthenticateAsync(incoming.mail, incoming.password);

            var inbox = client.Inbox;
            await inbox.OpenAsync(FolderAccess.ReadOnly);
            await client.DisconnectAsync(true);

            return new EmailStats(inbox.Count, inbox.Unread);
        }

        public async Task SyncEmailsAsync(DataContext db)
        {
            using var client = new ImapClient();
            var incoming = GetIncomingEmailConfig();

            await client.ConnectAsync(incoming.host, incoming.port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(incoming.mail, incoming.password);

            var inbox = client.Inbox;
            await inbox.OpenAsync(FolderAccess.ReadOnly);

            var summaries = await inbox.FetchAsync(0, -1, MessageSummaryItems.Envelope | MessageSummaryItems.Flags | MessageSummaryItems.UniqueId);

            foreach (var summary in summaries)
            {
                var messageID = summary.Envelope?.MessageId;
                if (string.IsNullOrEmpty(messageID))
                    continue;

                bool exists = db.Emails.Any(e => e.MessageID == messageID);
                if (exists)
                    continue;

                var message = await inbox.GetMessageAsync(summary.UniqueId);
                var seen = summary.Flags?.HasFlag(MessageFlags.Seen) ?? false;

                var conversation = await ResolveConversation(db, message);

                db.Emails.Add(new Email
                {
                    MessageID = messageID,
                    To = message.To.ToString(),
                    From = message.From.ToString(),
                    Subject = message.Subject ?? "",
                    TextBody = message.TextBody,
                    HtmlBody = message.HtmlBody,
                    Date = message.Date,
                    Seen = seen,
                    ConversationID = conversation.ID

                });

                conversation.LastMessageDate = message.Date;
            }

            await db.SaveChangesAsync();
            await client.DisconnectAsync(true);
        }

        public record EmailCredentials(string mail, string password);
        public async Task SendEmailFromAsync(string toEmail, string subject, string htmlBody, EmailCredentials credentials, string? inReplyTo = null)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(credentials.mail));
            if (inReplyTo is not null) 
                message.Headers.Add(new Header(HeaderId.InReplyTo, inReplyTo));
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
                    credentials.mail,
                    credentials.password
                );

            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }

        public async Task SendNoReplyEmailAsync(string toEmail, string subject, string htmlBody)
        {
            EmailCredentials credentials = new EmailCredentials(
                    config["Email:USERNAME"] ?? throw new InvalidOperationException("Email USERNAME not configured."),
                    config["Email:PASSWORD"] ?? throw new InvalidOperationException("Email PASSWORD not configured.")
                );
            await SendEmailFromAsync(toEmail, subject, htmlBody, credentials);
        }

        public string LoadTemplate(string templateName, Dictionary<string, string> replacements)
        {
            var path = Path.Combine(AppContext.BaseDirectory, "EmailTemplates", templateName);
            var template = File.ReadAllText(path);

            foreach (var (key, value) in replacements)
                template = template.Replace($"{{{{{key}}}}}", value);

            return template;
        }


        private record IncomingEmailConfig(string host, int port, string mail, string password);
        private IncomingEmailConfig GetIncomingEmailConfig()
        {
            var host = config["Incoming_Mail:HOST"] ?? throw new InvalidOperationException("Incoming mail host has not been configure.");
            var port = int.Parse(config["Incoming_Mail:PORT"] ?? throw new InvalidOperationException("Incoming email port has not been configured."));
            var mail = config["Email:SUPPORT_MAIL"] ?? throw new InvalidOperationException("Email SUPPORT_EMAIL has not been configured.");
            var password = config["Email:SUPPORT_PASSWORD"] ?? throw new InvalidOperationException("Email SUPPORT_PASSWORD has not been configured.");

            return new IncomingEmailConfig(host, port, mail, password);
        }

        private async Task<Conversation> ResolveConversation(DataContext db, MimeMessage message)
        {
            if (!string.IsNullOrEmpty(message.InReplyTo))
            {
                var existing = await db.Emails
                    .Include(e => e.Conversation)
                    .FirstOrDefaultAsync(e => e.MessageID == message.InReplyTo);

                if (existing is not null)
                    return existing.Conversation;
            }

            var subject = message.Subject ?? "";
            var convo = await db.Conversations.FirstOrDefaultAsync(c => c.Subject == subject);
            if (convo is not null)
                return convo;

            var newConvo = new Conversation
            {
                Subject = subject,
                LastMessageDate = message.Date
            };

            db.Conversations.Add(newConvo);
            await db.SaveChangesAsync();
            return newConvo;
        }
    }
}
