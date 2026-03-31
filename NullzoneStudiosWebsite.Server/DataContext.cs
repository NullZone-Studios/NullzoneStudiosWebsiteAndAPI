using NullzoneStudiosWebsite.Server.DataModels;
using Microsoft.EntityFrameworkCore;
using NullzoneStudiosWebsite.Server.DataModels.Email;

namespace NullzoneStudiosWebsite.Server
{
    public class DataContext : DbContext
    {
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserData> UserData => Set<UserData>();
        public DbSet<UserEmployeeData> UserEmployeeData => Set<UserEmployeeData>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
        public DbSet<BlogComment> BlogComments => Set<BlogComment>();
        public DbSet<BlogReaction> BlogReactions => Set<BlogReaction>();
        public DbSet<Email> Emails => Set<Email>();
        public DbSet<Conversation> Conversations => Set<Conversation>(); 

        public DataContext(DbContextOptions<DataContext> options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<BlogReaction>()
                .HasIndex(r => new { r.PostID, r.UserID })
                .IsUnique();

            modelBuilder.Entity<Email>()
                .HasIndex(e => new { e.ConversationID, e.Date})
                .HasDatabaseName("IX_Emails_ConversationID_Date");

            modelBuilder.Entity<Email>()
                .HasIndex(e => new { e.ConversationID, e.Seen })
                .HasDatabaseName("IX_Emails_ConversationID_Seen");
        }
    }
}
