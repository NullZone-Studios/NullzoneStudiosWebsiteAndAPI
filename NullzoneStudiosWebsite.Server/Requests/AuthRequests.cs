using System.ComponentModel.DataAnnotations;

namespace NullzoneStudiosWebsite.Server.Requests
{
    public record AuthLoginRequest(string UsernameOrEmail, string Password);
    public record AuthRegisterRequest(
        [Required][MinLength(3)] string Username, 
        [Required][EmailAddress] string Email, 
        [Required][MinLength(8)] string Password,
        [Required][MinLength(8)] string ConfirmPassword
        );

    public record ForgotPasswordRequest(
            [Required][EmailAddress] string Email
        );
    public record ResetPasswordRequest(
            [Required] string Token,
            [Required][MinLength(8)] string NewPassword
        );
}
