using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    [Table("nullzonewebsite_refresh_tokens")]
    public class RefreshToken
    {
        [Key, Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Column("token")]
        public string Token { get; set; } = null!;
        [Column("user_id")]
        public int UserID { get; set; }
        [Column("family_id")]
        public string FamilyID { get; set; } = null!;
        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Column("revoked_at")]
        public DateTime? RevokedAt { get; set; }

        [ForeignKey(nameof(UserID))]
        public User User { get; set; } = null!;

        [NotMapped] public bool IsRevoked => RevokedAt.HasValue;
        [NotMapped] public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        [NotMapped] public bool IsActive => !IsRevoked && !IsExpired;
    }
}
