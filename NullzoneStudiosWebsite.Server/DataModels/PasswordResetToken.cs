using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    [Table("nullzonewebsite_password_reset_tokens")]
    public class PasswordResetToken
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("id")]
        public int ID { get; set; }
        [Column("token")]
        public string Token { get; set; } = null!;
        [Column("user_id")]
        public int UserID { get; set; }
        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }
        [Column("used_at")]
        public DateTime? UsedAt { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [ForeignKey(nameof(UserID)), JsonIgnore]
        public User User { get; set; } = null!;

        [NotMapped] public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        [NotMapped] public bool IsUsed => UsedAt.HasValue;
        [NotMapped] public bool IsValid => !IsExpired && !IsUsed;
    }
}
