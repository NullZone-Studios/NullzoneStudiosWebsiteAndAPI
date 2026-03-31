using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NullzoneStudiosWebsite.Server.DataModels.Email;
using NullzoneStudiosWebsite.Server.Requests;
using NullzoneStudiosWebsite.Server.Services;
using static NullzoneStudiosWebsite.Server.Services.EmailService;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    [ApiController]
    [Route("api/admin/email")]
    public class EmailController(DataContext database, IConfiguration config) : AdminControllerBase(database)
    {
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetEmails()
        {
            if (!await IsAdminAsync()) return Forbid();

            var emails = await Db.Emails
                .OrderByDescending(e => e.Date)
                .Take(20)
                .Select(email => new
                {
                    email.MessageID,
                    email.From,
                    email.Subject,
                    TextBodyPreview = email.TextBody != null
                        ? email.TextBody.Length > 200
                            ? email.TextBody.Substring(0, 200).Concat("...")
                            : email.TextBody
                        : "",
                    email.Date,
                    email.Seen
                })
                .ToListAsync();

            return Ok(emails);
        }

        [Authorize]
        [HttpGet("conversation/count")]
        public async Task<IActionResult> GetConversationsCount()
        {
            int count = Db.Conversations.Count();
            return Ok(new
            {
                Count = count
            });
        }

        [Authorize]
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations([FromQuery] int page = 0, [FromQuery] int pageSize = 20)
        {
            if (!await IsAdminAsync()) return Forbid();
            var conversations = await Db.Conversations
                .Select(c => new
                {
                    c.ID,
                    c.Subject,
                    LastMessage = c.Emails.OrderByDescending(e => e.Date)
                        .Select(e => new {
                            e.From,
                            e.Subject,
                            TextBodyPreview = e.TextBody != null
                                ? e.TextBody.Length > 200 
                                    ? e.TextBody.Substring(0, 200).Concat("...") 
                                    : e.TextBody
                                : "",
                            e.Date
                        })
                        .FirstOrDefault(),
                    UnreadCount = c.Emails.Count(e => !e.Seen),
                    c.LastMessageDate
                })
                .OrderByDescending(c => c.UnreadCount)
                .ThenByDescending(c => c.LastMessageDate)
                .Skip(page * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return Ok(conversations);
        }

        [Authorize]
        [HttpGet("conversations/{id}")]
        public async Task<IActionResult> GetConversation(Guid id, [FromQuery] int page = 0, [FromQuery] int pageSize = 10)
        {
            if (!await IsAdminAsync()) return Forbid();
            var conversation = await Db.Conversations
                .Include(c => c.Emails)
                .FirstOrDefaultAsync(c => c.ID == id);

            if (conversation is null)
                return NotFound();

            var emails = conversation.Emails.OrderBy(e => e.Date)
                .Skip(page * pageSize)
                .Take(pageSize)
                .ToList();
            foreach (var email in emails.Where(e => !e.Seen))
                email.Seen = true;

            await Db.SaveChangesAsync();

            return Ok(new
            {
                conversation.ID,
                conversation.Subject,
                Emails = emails
            });
        }

        [Authorize]
        [HttpPost("reply")]
        public async Task<IActionResult> Reply([FromServices] EmailService emailService, [FromBody] ReplyEmailRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var original = await Db.Emails
                .Include(e => e.Conversation)
                .FirstOrDefaultAsync(e => e.ID == request.emailID);

            if (original == null)
                return NotFound("Original email not found");

            var toEmail = request.to ?? original.From;

            var replySubject = original.Subject?.StartsWith("Re:") == true
                ? original.Subject
                : "Re: " + original.Subject;

            await emailService.SendEmailFromAsync(
                    toEmail,
                    replySubject,
                    request.body,
                    new EmailCredentials(
                            config["Email:SUPPORT_MAIL"] ?? throw new InvalidOperationException("Email SUPPORT_MAIL is not configured."),
                            config["Email:SUPPORT_PASSWORD"] ?? throw new InvalidOperationException("Email SUPPORT PASSWORD is not configured.")),
                    original.MessageID
                );

            var sentEmail = new Email
            {
                MessageID = Guid.NewGuid().ToString(),
                InReplyTo = original.MessageID,
                From = config["Email:SUPPORT_MAIL"] ?? throw new InvalidOperationException("Email SUPPORT_MAIL is not configured"),
                To = toEmail,
                Subject = replySubject,
                TextBody = request.body,
                HtmlBody = request.body,
                Date = DateTimeOffset.UtcNow,
                Seen = true,
                ConversationID = original.ConversationID
            };

            original.Seen = true;
            Db.Emails.Add(sentEmail);
            await Db.SaveChangesAsync();

            return Ok(sentEmail);
        }
    }
}
