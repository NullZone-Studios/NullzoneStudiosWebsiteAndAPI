using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    [Table("nullzonewebsite_blog_posts")]
    public class BlogPost
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("id")]
        public int ID { get; set; }
        [Column("title")]
        public required string Title { get; set; }
        [Column("content")]
        public required string Content { get; set; }
        [Column("post_image_url")]
        public string? PostImageUrl { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Column("author_id")]
        public int AuthorID { get; set; }
        [ForeignKey(nameof(AuthorID))]
        public User Author { get; set; } = null!;

        public ICollection<BlogComment> Comments { get; set; } = [];
        public ICollection<BlogReaction> Reactions { get; set; } = [];
    }
}
