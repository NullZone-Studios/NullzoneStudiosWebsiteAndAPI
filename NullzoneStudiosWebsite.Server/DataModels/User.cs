using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    public enum AccessLevel : int
    {
        None = -1,
        User = 0,
        Admin = 1
    }


    [Table("nullzonewebsite_users")]
    public class User
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("user_ID")]
        public int ID { get; set; }
        [Column("username")]
        public required string Username { get; set; }
        [Column("password")]
        public required string Password { get; set; }
        [Column("salt")]
        public required string Salt { get; set; }
        [Column("email")]
        public string Email { get; set; } = string.Empty;
        [Column("last_login")]
        public DateTime LastLoginStamp { get; set; } = DateTime.UtcNow;
        [Column("access_level")]
        public AccessLevel AccessLevel { get; set; } = AccessLevel.None;

        public UserData UserData{ get; set; } = null!;
        public UserEmployeeData? UserWorkerData { get; set; }
        public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
        public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = [];
        public ICollection<BlogPost> BlogPosts { get; set; } = [];
        public ICollection<BlogComment> BlogComments { get; set; } = [];
        public ICollection<BlogReaction> BlogReactions { get; set; } = [];

    }
}
