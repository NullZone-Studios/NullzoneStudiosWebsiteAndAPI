namespace NullzoneStudiosWebsite.Server.Requests
{
    public record ProfileDataRequest(
            string? FirstName,
            string? LastName,
            string? DisplayName,
            DateOnly? BirthDate,
            string? Gender,
            string? About,
            string? ProfileImage
        );
}
