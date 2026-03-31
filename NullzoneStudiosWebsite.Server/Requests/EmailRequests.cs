namespace NullzoneStudiosWebsite.Server.Requests
{
    public record ReplyEmailRequest(Guid emailID, string? to, string body);
}
