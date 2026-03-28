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
            var posts = await db.BlogPosts
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.ID,
                    p.Title,
                    p.Content,
                    p.PostImageUrl,
                    p.CreatedAt,
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
            var comments = await db.BlogComments
                .Where(c => c.PostID == id)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new
                {
                    c.ID,
                    c.Content,
                    c.CreatedAt,
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

            db.BlogPosts.Add(post);
            await db.SaveChangesAsync();
            return Ok(post);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdateBlogPostRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var post = await db.BlogPosts.FindAsync(id);
            if (post is null) return NotFound();

            if (request.Title is not null) post.Title = request.Title;
            if (request.Content is not null) post.Content = request.Content;
            if (request.PostImageUrl is not null) post.PostImageUrl = request.PostImageUrl;

            await db.SaveChangesAsync();
            return Ok(post);
        }

        [Authorize]
        [HttpPost("{id}/react")]
        public async Task<IActionResult> React(int id, [FromBody] ReactRequest request)
        {
            var userID = GetCurrentUserID();
            if (userID is null) return Unauthorized();

            var post = await db.BlogPosts.FindAsync(id);
            if (post is null) return NotFound();

            var existing = await db.BlogReactions
                .FirstOrDefaultAsync(r => r.PostID == id && r.UserID == userID);

            if (existing is not null)
            {
                if (existing.Type == request.Type)
                    db.BlogReactions.Remove(existing);
                else
                    existing.Type = request.Type;
            }
            else
            {
                db.BlogReactions.Add(new DataModels.BlogReaction
                {
                    PostID = id,
                    UserID = userID.Value,
                    Type = request.Type
                });
            }

            await db.SaveChangesAsync();

            var likes = await db.BlogReactions.CountAsync(r => r.PostID == id && r.Type == DataModels.ReactionType.Like);
            var dislikes = await db.BlogReactions.CountAsync(r => r.PostID == id && r.Type == DataModels.ReactionType.Dislike);

            return Ok(new { likes, dislikes });
        }

        [Authorize]
        [HttpPost("{id}/comment")]
        public async Task<IActionResult> Comment(int id, [FromBody] CommentRequest request)
        {
            var userID = GetCurrentUserID();
            if (userID is null) return Unauthorized();

            var post = await db.BlogPosts.FindAsync(id);
            if (post is null) return NotFound();

            var comment = new BlogComment
            {
                PostID = id,
                UserID = userID.Value,
                Content = request.Content.Trim()
            };

            db.BlogComments.Add(comment);
            await db.SaveChangesAsync();

            var user = await db.Users.FindAsync(userID);

            return Ok(new
            {
                comment.ID,
                comment.Content,
                comment.CreatedAt,
                Author = user!.UserData.DisplayName,
                AuthorImage = user.UserData.ProfileImage,
                AuthorID = userID
            });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var userID = GetCurrentUserID();
            if (userID is null) return Unauthorized();

            var user = await db.Users.FindAsync(userID);
            if (user is null) return Unauthorized();

            var post = await db.BlogPosts.FindAsync(id);
            if (post is null) return NotFound();

            if (user.AccessLevel != AccessLevel.Admin && post.AuthorID != userID)
                return Forbid();

            db.BlogPosts.Remove(post);
            await db.SaveChangesAsync();
            return NoContent();
        }

        private int? GetCurrentUserID()
        {
            var claim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return int.TryParse(claim, out var id) ? id : null;
        }
    }
}
