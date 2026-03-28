using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NullzoneStudiosWebsite.Server.DataModels
{
    [Table("nullzonewebsite_user_worker_data")]
    public class UserEmployeeData
    {
        [Key, Column("user_id")]
        public int UserID { get; set; }

        [Column("job_title")]
        public string JobTitle { get; set; } = string.Empty;

        [Column("about")]
        public string About { get; set; } = string.Empty;

        [ForeignKey(nameof(UserID))]
        public User User { get; set; } = null!;
    }
}