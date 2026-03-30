using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NullzoneStudiosWebsite.Server.DataModels;
using NullzoneStudiosWebsite.Server.Requests;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    [ApiController]
    [Route("api/blog")]
    public class BlogController(DataContext database) : AdminControllerBase(database)
    {
        [HttpGet]
        public async Task<IActionResult> GetPosts() {
            var currentUserID = GetCurrentUserID();
            var posts = await Db.BlogPosts
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.ID,
                    p.Title,
                    p.Content,
                    p.PostImageUrl,
                    CreatedAt = p.CreatedAt.ToString("H:m d. MMM yyyy"),
                    AuthorID = p.AuthorID,
                    Author = p.Author.UserData.DisplayName,
                    AuthorImage = p.Author.UserData.ProfileImage,
                    Likes = p.Reactions.Count(r => r.Type == DataModels.ReactionType.Like),
                    Dislikes = p.Reactions.Count(r => r.Type == DataModels.ReactionType.Dislike),
                    Liked = currentUserID != null && p.Reactions.Any(r => r.UserID == currentUserID && r.Type == DataModels.ReactionType.Like),
                    Disliked = currentUserID != null && p.Reactions.Any(r => r.UserID == currentUserID && r.Type == DataModels.ReactionType.Dislike),
                    CommentCount = p.Comments.Count
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetComments(int id)
        {
            var comments = await Db.BlogComments
                .Where(c => c.PostID == id)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new
                {
                    c.ID,
                    c.Content,
                    CreatedAt = c.CreatedAt.ToString("H:m d. MMM yyyy"),
                    Author = c.User.UserData.DisplayName,
                    AuthorImage = c.User.UserData.ProfileImage,
                    AuthorID = c.UserID
                })
                .ToListAsync();

            return Ok(comments);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreateBlogPostRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();
            var userID = GetCurrentUserID()!.Value;

            var post = new BlogPost
            {
                Title = request.Title,
                Content = request.Content,
                PostImageUrl = request.PostImageUrl,
                AuthorID = userID,
            };

            Db.BlogPosts.Add(post);
            await Db.SaveChangesAsync();
            return Ok(post);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdateBlogPostRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var post = await Db.BlogPosts.FindAsync(id);
            if (post is null) return NotFound();

            if (request.Title is not null) post.Title = request.Title;
            if (request.Content is not null) post.Content = request.Content;
            if (request.PostImageUrl is not null) post.PostImageUrl = request.PostImageUrl;

            await Db.SaveChangesAsync();
            return Ok(post);
        }

        [Authorize]
        [HttpPost("{id}/react")]
        public async Task<IActionResult> React(int id, [FromBody] ReactRequest request)
        {
            var userID = GetCurrentUserID();
            if (userID is null) return Unauthorized();

            var post = await Db.BlogPosts.FindAsync(id);
            if (post is null) return NotFound();

            var existing = await Db.BlogReactions
                .FirstOrDefaultAsync(r => r.PostID == id && r.UserID == userID);

            if (existing is not null)
            {
                if (existing.Type == request.Type)
                    Db.BlogReactions.Remove(existing);
                else
                    existing.Type = request.Type;
            }
            else
            {
                Db.BlogReactions.Add(new DataModels.BlogReaction
                {
                    PostID = id,
                    UserID = userID.Value,
                    Type = request.Type
                });
            }

            await Db.SaveChangesAsync();

            var likes = await Db.BlogReactions.CountAsync(r => r.PostID == id && r.Type == DataModels.ReactionType.Like);
            var dislikes = await Db.BlogReactions.CountAsync(r => r.PostID == id && r.Type == DataModels.ReactionType.Dislike);

            return Ok(new { likes, dislikes });
        }

        [Authorize]
        [HttpPost("{id}/comment")]
        public async Task<IActionResult> Comment(int id, [FromBody] CommentRequest request)
        {
            var userID = GetCurrentUserID();
            if (userID is null) return Unauthorized();

            var post = await Db.BlogPosts.FindAsync(id);
            if (post is null) return NotFound();

            var comment = new BlogComment
            {
                PostID = id,
                UserID = userID.Value,
                Content = request.Content.Trim()
            };

            Db.BlogComments.Add(comment);
            await Db.SaveChangesAsync();

            var user = await Db.Users
                .Include(u => u.UserData)
                .FirstOrDefaultAsync(u => u.ID == userID);

            return Ok(new
            {
                comment.ID,
                comment.Content,
                CreatedAt = comment.CreatedAt.ToString("H:m d. MMM yyyy"),
                Author = user?.UserData?.DisplayName ?? "Unknown User",
                AuthorImage = user?.UserData?.ProfileImage,
                AuthorID = userID
            });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var userID = GetCurrentUserID();
            if (userID is null) return Unauthorized();

            var user = await Db.Users.FindAsync(userID);
            if (user is null) return Unauthorized();

            var post = await Db.BlogPosts.FindAsync(id);
            if (post is null) return NotFound();

            if (user.AccessLevel != AccessLevel.Admin && post.AuthorID != userID)
                return Forbid();

            Db.BlogPosts.Remove(post);
            await Db.SaveChangesAsync();
            return NoContent();
        }
    }
}
