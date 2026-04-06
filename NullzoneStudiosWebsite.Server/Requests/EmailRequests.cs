using System.ComponentModel.DataAnnotations;

namespace NullzoneStudiosWebsite.Server.Requests
{
    public record ReplyEmailRequest(
        Guid emailID, 
        [EmailAddress] string? to, 
        [Required][MinLength(1)] string body);
}
