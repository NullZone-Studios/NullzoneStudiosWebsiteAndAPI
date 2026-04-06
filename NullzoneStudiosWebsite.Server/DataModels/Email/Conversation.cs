using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NullzoneStudiosWebsite.Server.DataModels.Email
{
    [Table("nullzonewebsite_email_conversation")]
    public class Conversation
    {
        [Key, Column("id")]
        public Guid ID { get; set; } = Guid.NewGuid();
        [Column("subject")]
        public string Subject { get; set; } = "";
        [Column("sender_name")]
        public string? SenderName { get; set; }
        [Column("sender_email")]
        public string? SenderEmail { get; set; }
        public DateTimeOffset LastMessageDate { get; set; }
        public ICollection<Email> Emails { get; set; } = [];
    }
}
