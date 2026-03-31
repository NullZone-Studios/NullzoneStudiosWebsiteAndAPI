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
        public DateTimeOffset LastMessageDate { get; set; }
        public bool HasUnread { get; set; }

        public ICollection<Email> Emails { get; set; } = [];
    }
}
