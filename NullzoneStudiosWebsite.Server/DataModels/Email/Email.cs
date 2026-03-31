using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NullzoneStudiosWebsite.Server.DataModels.Email
{
    [Table("nullzonewebsite_support_emails")]
    public class Email
    {
        [Key, Column("id")]
        public Guid ID { get; set; } = Guid.NewGuid();
        [Column("message_id")]
        public string MessageID { get; set; } = null!;
        [Column("in_reply_to")]
        public string? InReplyTo { get; set; }
        [Column("from")]
        public string From { get; set; } = null!;
        [Column("to")]
        public string To { get; set; } = null!;
        [Column("subject")]
        public string Subject { get; set; } = null!;
        [Column("text_body")]
        public string? TextBody { get; set; }
        [Column("html_body")]
        public string? HtmlBody { get; set; }
        [Column("date")]
        public DateTimeOffset Date { get; set; }
        [Column("seen")]
        public bool Seen { get; set; }
        [Column("conversation_id")]
        public Guid ConversationID { get; set; }
        [ForeignKey(nameof(ConversationID))]
        public Conversation Conversation { get; set; } = null!;
    }
}
