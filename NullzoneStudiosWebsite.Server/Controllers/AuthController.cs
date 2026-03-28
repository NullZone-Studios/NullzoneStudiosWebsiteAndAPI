using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NullzoneStudiosWebsite.Server.DataModels;
using NullzoneStudiosWebsite.Server.Requests;
using NullzoneStudiosWebsite.Server.Services;
using NullzoneStudiosWebsite.Server.Tools;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(DataContext db, TokenService tokenService, EmailService emailService, IHttpContextAccessor httpContextAccessor, IConfiguration config) : ControllerBase
    {
        private const string AccessTokenCookie = "access_token";
        private const string RefreshTokenCookie = "refresh_token";

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthLoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var normalized = request.UsernameOrEmail.Trim().ToLower();

            var user = await db.Users.FirstOrDefaultAsync(user => user.Username == normalized || user.Email == normalized);

            if (user is null)
                return Unauthorized(new { message = "Invalid credentials." });
            
            if (!PasswordHelper.VerifyPassword(request.Password, user.Password, user.Salt))
                return Unauthorized(new { message = "Invalid credentials." });

            var roles = new[] { user.AccessLevel.ToString() };
            var accessToken = tokenService.GenerateAccessToken(user.ID.ToString(), user.Username, user.Email, roles);
            var refreshToken = await tokenService.GenerateRefreshTokenAsync(user.ID);

            SetTokenCookies(accessToken, refreshToken.Token);

            return Ok(new { user.ID, user.Username, user.Email, user.AccessLevel });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var incomingToken = httpContextAccessor.HttpContext?.Request.Cookies[RefreshTokenCookie];
            if (string.IsNullOrEmpty(incomingToken))
                return Unauthorized();

            var newRefreshToken = await tokenService.RotateRefreshTokenAsync(incomingToken);
            if (newRefreshToken is null)
            {
                ClearTokenCookies();
                return Unauthorized(new { message = "Session expired. Please log in again."});
            }

            var user = await db.Users.FindAsync(newRefreshToken.UserID);
            if (user is null) return Unauthorized();

            var roles = new[] {user.AccessLevel.ToString() };
            var accessToken = tokenService.GenerateAccessToken(user.ID.ToString(), user.Username, user.Email, roles);

            SetTokenCookies(accessToken, newRefreshToken.Token);
            return Ok();
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userID = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (userID is not null)
                await tokenService.RevokeAllUserTokensAsync(int.Parse(userID));

            ClearTokenCookies();
            return NoContent();
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthRegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (request.Password != request.ConfirmPassword)
                return BadRequest(new { message = "Passwords do not match" });

            var username = request.Username.Trim().ToLower();
            var email = request.Email.Trim().ToLower();

            if (await db.Users.AnyAsync(u => u.Username == username))
                return BadRequest(new { message = "Username already exists." });

            if (await db.Users.AnyAsync(u => u.Email == email))
                return BadRequest(new { message = "Email is already in use." });

            string passwordHash = PasswordHelper.HashPassword(request.Password, out string salt);
            var user = new User
            {
                Username = username,
                Email = email,
                Password = passwordHash,
                Salt = salt,
                AccessLevel = AccessLevel.User 
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            var roles = new[] { user.AccessLevel.ToString() };
            var accessToken = tokenService.GenerateAccessToken(user.ID.ToString(), user.Username, user.Email, roles);
            var refreshToken = await tokenService.GenerateRefreshTokenAsync(user.ID);

            SetTokenCookies(accessToken, refreshToken.Token);

            return Ok(new
            {
                user.ID,
                user.Username,
                user.Email,
                user.AccessLevel
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var email = request.Email.Trim().ToLower();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user is null) return Ok();

            var existingTokens = await db.PasswordResetTokens
                .Where(t => t.User.ID == user.ID && t.UsedAt == null)
                .ToListAsync();
            db.PasswordResetTokens.RemoveRange(existingTokens);

            var expirationMinutes = config["Password_Reset:EXPIRATION_IN_MINUTES"]
                        ?? throw new InvalidOperationException("Password reset expiration not configured.");

            var resetToken = new PasswordResetToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                UserID = user.ID,
                ExpiresAt = DateTime.UtcNow.AddMinutes(
                        int.Parse(expirationMinutes))
            };

            db.PasswordResetTokens.Add(resetToken);
            await db.SaveChangesAsync();

            var resetLink = $"{config["App:BASE_URL"]}/reset-password?token={Uri.EscapeDataString(resetToken.Token)}";
            var body = emailService.LoadTemplate("PasswordReset.html", new Dictionary<string, string>
            {
                { "RESET_LINK", resetLink },
                { "EXPIRATION_MINUTES", expirationMinutes }
            });

            await emailService.SendEmailAsync(
                    user.Email,
                    "Password Reset Request",
                    body
                );

            return Ok();
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var resetToken = await db.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == request.Token);

            if (resetToken is null || !resetToken.IsValid)
                return BadRequest(new { message = "Invalid or expired reset token" });

            string passwordHash = PasswordHelper.HashPassword(request.NewPassword, out string salt);
            resetToken.User.Password = passwordHash;
            resetToken.User.Salt = salt;
            resetToken.UsedAt = DateTime.UtcNow;

            await tokenService.RevokeAllUserTokensAsync(resetToken.User.ID);
            await db.SaveChangesAsync();
            return Ok(new { message = "Password reset successful." });
        }

        private void SetTokenCookies(string accessToken, string refreshToken)
        {
            var ctx = httpContextAccessor.HttpContext!;
            var accessExpires = int.Parse(config["Jwt:ACCESS_TOKEN_EXPIRATION_IN_MINUTES"] ?? throw new InvalidOperationException("JWT access token expiration not configured."));
            var refreshExpires = int.Parse(config["Jwt:REFRESH_TOKEN_EXPIRATION_IN_DAYS"] ?? throw new InvalidOperationException("JWT refresh token expiration not configured."));

            ctx.Response.Cookies.Append(AccessTokenCookie, accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = ctx.Request.IsHttps,
                IsEssential = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(accessExpires)
            });

            ctx.Response.Cookies.Append(RefreshTokenCookie, refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = ctx.Request.IsHttps,
                IsEssential= true,
                SameSite = SameSiteMode.Strict,
                Path = "/api/auth",
                Expires = DateTimeOffset.UtcNow.AddDays(refreshExpires)
            });
        }

        private void ClearTokenCookies()
        {
            var ctx = httpContextAccessor?.HttpContext!;
            ctx.Response.Cookies.Delete(AccessTokenCookie);
            ctx.Response.Cookies.Delete(RefreshTokenCookie, new CookieOptions
            {
                Path = "/api/auth"
            });
        }
    }
}
