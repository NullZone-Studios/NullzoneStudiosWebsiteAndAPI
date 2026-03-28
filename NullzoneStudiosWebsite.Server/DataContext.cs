using NullzoneStudiosWebsite.Server.DataModels;
using Microsoft.EntityFrameworkCore;

namespace NullzoneStudiosWebsite.Server
{
    public class DataContext : DbContext
    {
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserData> UsersData => Set<UserData>();
        public DbSet<UserEmployeeData> UsersEmployeeData => Set<UserEmployeeData>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
        public DbSet<BlogComment> BlogComments => Set<BlogComment>();
        public DbSet<BlogReaction> BlogReactions => Set<BlogReaction>();

        public DataContext(DbContextOptions<DataContext> options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<BlogReaction>()
                .HasIndex(r => new { r.PostID, r.UserID })
                .IsUnique();
        }
    }
}
