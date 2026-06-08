using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    [Table("nullzonewebsite_user_data")]
    public class UserData
    {
        [Key, Column("user_id")]
        public int UserID { get; set; }

        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Column("display_name")]
        public string DisplayName { get; set; } = string.Empty;

        [Column("about")]
        public string About { get; set; } = string.Empty;

        [Column("profile_image")]
        public string? ProfileImage { get; set; }

        [Column("gender")]
        public string? Gender { get; set; }

        [Column("birthdate")]
        public DateOnly? Birthdate { get; set; }

        [ForeignKey(nameof(UserID)), JsonIgnore]
        public User User { get; set; } = null!;
    }
}
