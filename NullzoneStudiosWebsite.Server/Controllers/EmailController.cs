using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NullzoneStudiosWebsite.Server.DataModels.Email;
using NullzoneStudiosWebsite.Server.Requests;
using NullzoneStudiosWebsite.Server.Services;
using Org.BouncyCastle.Bcpg.Sig;
using System.Text.RegularExpressions;
using static NullzoneStudiosWebsite.Server.Services.EmailService;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    [ApiController]
    [Route("api/admin/email")]
    public class EmailController(DataContext database, IConfiguration config, ILogger<EmailController> logger) : AdminControllerBase(database)
    {
        [Authorize]
        [HttpPost("sync")]
        public async Task<IActionResult> SyncEmails([FromServices] EmailService emailService)
        {
            if (!await IsAdminAsync()) return Forbid();
            await emailService.SyncEmailsAsync(Db);
            return NoContent();
        }


        [Authorize]
        [HttpGet("conversation/count")]
        public async Task<IActionResult> GetConversationsCount()
        {
            if (!await IsAdminAsync()) return Forbid();

            int count = await Db.Conversations.CountAsync();
            return Ok(new
            {
                Count = count
            });
        }

        [Authorize]
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations([FromQuery] int page = 0, [FromQuery] int pageSize = 20)
        {
            pageSize = Math.Clamp(pageSize, 1, 50);

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
                                    ? e.TextBody.Substring(0, 200) + "..." 
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
            return Ok(new
            {
                Conversations = conversations,
                Total = conversations.Count,
                TotalCount = (int)(conversations.Count / pageSize),
            });
        }

        [Authorize]
        [HttpGet("conversations/{id}")]
        public async Task<IActionResult> GetConversation(Guid id, [FromQuery] int page = 0, [FromQuery] int pageSize = 10)
        {
            pageSize = Math.Clamp(pageSize, 1, 50);

            if (!await IsAdminAsync()) return Forbid();
            var conversation = await Db.Conversations
                .Where(c => c.ID == id)
                .Select(c => new
                {
                    c.ID,
                    c.Subject,
                    TotalEmails = c.Emails.Count(),
                    Emails = c.Emails
                        .OrderBy(e => e.Date)
                        .Skip(page * pageSize)
                        .Take(pageSize)
                        .Select(e => new
                        {
                            e.ID,
                            e.From,
                            e.To,
                            e.Subject,
                            e.TextBody,
                            e.Date,
                            Seen = true
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (conversation is null)
                return NotFound();

            var unreadIDs = conversation.Emails
                .Where(e => !e.Seen)
                .Select(e => e.ID)
                .ToList();

            if (unreadIDs.Count > 0)
            {
                await Db.Emails
                    .Where(e => unreadIDs.Contains(e.ID))
                    .ExecuteUpdateAsync(s => s.SetProperty(e => e.Seen, true));
            }

            return Ok(new
            {
                conversation.ID,
                conversation.Subject,
                conversation.TotalEmails,
                conversation.Emails
            });
        }

        [Authorize]
        [HttpPost("conversations/{id}/read")]
        public async Task<IActionResult> MarkConversationRead(Guid id)
        {
            if (!await IsAdminAsync()) return Forbid();
            var exists = await Db.Conversations.AnyAsync(c => c.ID == id);
            if (!exists) return NotFound();

            await Db.Emails
                .Where(e => e.ConversationID == id && !e.Seen)
                .ExecuteUpdateAsync(e => e.SetProperty(e => e.Seen, true));

            return NoContent();
        }

        [Authorize]
        [HttpGet("conversations/{conversationID}/{messageID}")]
        public async Task<IActionResult> GetEmailHtml(Guid conversationID, Guid messageID)
        {
            if (!await IsAdminAsync()) return Forbid();

            var email = await Db.Emails
                .Where(e => e.ConversationID == conversationID && e.ID == messageID)
                .Select(e => new
                {
                    e.ID,
                    e.From,
                    e.To,
                    e.Subject,
                    e.TextBody,
                    e.HtmlBody,
                    e.Date,
                    e.Seen
                })
                .Select(e => e.HtmlBody)
                .FirstOrDefaultAsync();

            if (email is null) return NotFound();
            return Ok(email);
        }

        [Authorize]
        [HttpPost("reply")]
        public async Task<IActionResult> Reply([FromServices] EmailService emailService, [FromBody] ReplyEmailRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var employeeID = GetCurrentUserID();
            var employee = await Db.Users.Where(u => u.ID == employeeID)
                .Select(u => new
                {
                    Name = !string.IsNullOrEmpty(u.UserData.DisplayName)
                        ? u.UserData.DisplayName
                        : !string.IsNullOrEmpty(u.UserData.FirstName) && !string.IsNullOrEmpty(u.UserData.LastName)
                            ? $"{u.UserData.FirstName} {u.UserData.LastName}"
                            : "Employee X",
                })
                .FirstOrDefaultAsync();
            if (employee is null) return Forbid();

            var original = await Db.Emails
                .Include(e => e.Conversation)
                .FirstOrDefaultAsync(e => e.ID == request.emailID);

            if (original == null)
                return NotFound("Original email not found");

            var toEmail = request.to ?? original.From;

            var replySubject = original.Subject?.StartsWith("Re:", StringComparison.OrdinalIgnoreCase) == true
                ? original.Subject
                : "Re: " + original.Subject;

            var htmlBody = emailService.LoadTemplate("Message.htm", new Dictionary<string, string>()
            {
                { "MESSAGE", request.body },
                { "EMPLOYEE_NAME", employee.Name }
            });

            var sentEmail = new Email
            {
                InReplyTo = original.MessageID,
                From = config["Email:SUPPORT_MAIL"] ?? throw new InvalidOperationException("Email SUPPORT_MAIL is not configured"),
                To = toEmail,
                Subject = replySubject,
                TextBody = request.body,
                HtmlBody = htmlBody,
                Date = DateTimeOffset.UtcNow,
                Seen = true,
                ConversationID = original.ConversationID
            };

            original.Seen = true;
            Db.Emails.Add(sentEmail);
            await Db.SaveChangesAsync();

            var sentMessageID = await emailService.SendEmailFromAsync(
                    toEmail,
                    replySubject,
                    htmlBody,
                    new EmailCredentials(
                            config["Email:SUPPORT_MAIL"] ?? throw new InvalidOperationException("Email SUPPORT_MAIL is not configured."),
                            config["Email:SUPPORT_PASSWORD"] ?? throw new InvalidOperationException("Email SUPPORT PASSWORD is not configured.")),
                    original.MessageID
                );
            sentEmail.MessageID = sentMessageID;
            await Db.SaveChangesAsync();

            return Ok(sentEmail);
        }

        [Authorize]
        [HttpDelete("conversations/{id}")]
        public async Task<IActionResult> DeleteCnversation([FromServices] EmailService emailService, Guid id) {
            if (!await IsAdminAsync()) return Forbid();

            var conversation = await Db.Conversations
                .Include(c => c.Emails)
                .FirstOrDefaultAsync(c => c.ID == id);

            if (conversation is null) return NotFound();

            var messageIDs = conversation.Emails.Select(e => e.MessageID).ToList();

            Db.Emails.RemoveRange(conversation.Emails);
            Db.Conversations.Remove(conversation);
            await Db.SaveChangesAsync();

            try
            {
                await emailService.DeleteMessagesAsync(messageIDs);
            }
            catch (Exception ex) {
                logger.LogWarning(ex, "Conversation {ID} deleted form DB but IMAP deletion failed.", id);
                return Ok(new { Warning = "Conversation deleted locally but could not be removed from mail server." });
            }

            return NoContent();
        }
    }
}
