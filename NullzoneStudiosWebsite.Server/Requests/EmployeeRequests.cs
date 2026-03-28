using System.ComponentModel.DataAnnotations;

namespace NullzoneStudiosWebsite.Server.Requests
{
    public record EmployeeDataRequest(
            [Required][MinLength(1)] string JobTitle,
            string? About
        );
}
