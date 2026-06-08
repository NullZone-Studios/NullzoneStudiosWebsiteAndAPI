using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    [Table("nullzonewebsite_blog_comments")]
    public class BlogComment
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("id")]
        public int ID { get; set; }
        [Column("content")]
        public required string Content { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Column("post_id")]
        public int PostID { get; set; }
        [Column("user_id")]
        public int UserID { get; set; }
        [ForeignKey(nameof(PostID)), JsonIgnore]
        public BlogPost Post { get; set; } = null!;
        [ForeignKey(nameof(UserID)), JsonIgnore]
        public User User { get; set; } = null!;
    }
}
