using NullzoneStudiosWebsite.Server.DataModels;
using System.ComponentModel.DataAnnotations;

namespace NullzoneStudiosWebsite.Server.Requests
{
    public record ReactRequest([Required]ReactionType Type);
    public record CommentRequest([Required][MinLength(1)][MaxLength(500)] string Content);
    public record CreateBlogPostRequest(
            [Required][MinLength(1)] string Title,
            [Required][MinLength(1)] string Content,
            string? PostImageUrl
        );
    public record UpdateBlogPostRequest(
            string? Title,
            string? Content,
            string? PostImageUrl
        );
}
