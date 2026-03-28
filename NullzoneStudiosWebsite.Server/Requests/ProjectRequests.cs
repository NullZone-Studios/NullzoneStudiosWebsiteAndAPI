using System.ComponentModel.DataAnnotations;

namespace NullzoneStudiosWebsite.Server.Requests
{
    public record CreateProjectRequest(
            [Required][MinLength(1)] string Title,
            string? Content,
            string? Href,
            string? BannerImageUrl
        );

    public record UpdateProjectRequest(
            string? Title,
            string? Content,
            string? Href,
            string? BannerImageUrl
        );
}
