using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    public enum ReactionType : int
    {
        Like = 1,
        Dislike = -1
    }

    [Table("nullzonewebsite_blog_reactions")]
    public class BlogReaction
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("id")]
        public int ID { get; set; }
        [Column("type")]
        public ReactionType Type { get; set; }
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
