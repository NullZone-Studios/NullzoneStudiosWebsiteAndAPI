using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    [Table("nullzonewebsite_projects")]
    public class Project
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("id")]
        public int ID { get; set; }
        [Column("title")]
        public required string Title { get; set; }
        [Column("content")]
        public string Content { get; set; } = string.Empty;
        [Column("href")]
        public string? Href { get; set; }
        [Column("banner_image_url")]
        public string? BannerImageUrl { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
