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
    public class AuthController(DataContext database, TokenService tokenService, EmailService emailService, IHttpContextAccessor httpContextAccessor, IConfiguration config) : AdminControllerBase(database)
    {
        private const string AccessTokenCookie = "access_token";
        private const string RefreshTokenCookie = "refresh_token";

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthLoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var normalized = request.UsernameOrEmail.Trim().ToLower();
            var user = await Db.Users.FirstOrDefaultAsync(user => user.Username == normalized || user.Email == normalized);

            if (user is null)
                return Unauthorized(new { message = "Invalid credentials." });
            
            if (!PasswordHelper.VerifyPassword(request.Password, user.Password, user.Salt))
                return Unauthorized(new { message = "Invalid credentials." });

            var existingToken = httpContextAccessor.HttpContext?.Request.Cookies[RefreshTokenCookie];
            if (!string.IsNullOrEmpty(existingToken))
            {
                var token = await Db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == existingToken);
                if (token is not null)
                    await tokenService.RevokeTokenFamilyAsync(token.FamilyID);
            }

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

            var user = await Db.Users.FindAsync(newRefreshToken.UserID);
            if (user is null) return Unauthorized();

            var roles = new[] {user.AccessLevel.ToString() };
            var accessToken = tokenService.GenerateAccessToken(user.ID.ToString(), user.Username, user.Email, roles);

            SetTokenCookies(accessToken, newRefreshToken.Token);
            return Ok(new { user.ID, user.Username, user.Email, user.AccessLevel });
        }

        [Authorize]
        [HttpGet("session")]
        public IActionResult Session()
        {
            var UserID = GetCurrentUserID();
            var Username = User.FindFirstValue(JwtRegisteredClaimNames.UniqueName);
            var Email = User.FindFirstValue(JwtRegisteredClaimNames.Email);
            var AccessLevel = User.FindFirstValue(ClaimTypes.Role);

            return Ok(new { id = UserID, Username, Email, AccessLevel });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userID = GetCurrentUserID();
            if (userID.HasValue)
                await tokenService.RevokeAllUserTokensAsync(userID.Value);

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

            if (await Db.Users.AnyAsync(u => u.Username == username))
                return BadRequest(new { message = "Username already exists." });

            if (await Db.Users.AnyAsync(u => u.Email == email))
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

            Db.Users.Add(user);
            await Db.SaveChangesAsync();

            var userData = new UserData
            {
                UserID = user.ID
            };

            Db.UserData.Add(userData);
            await Db.SaveChangesAsync();

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
            var user = await Db.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user is null) return Ok();

            var existingTokens = await Db.PasswordResetTokens
                .Where(t => t.User.ID == user.ID && t.UsedAt == null)
                .ToListAsync();
            Db.PasswordResetTokens.RemoveRange(existingTokens);

            var expirationMinutes = config["Password_Reset:EXPIRATION_IN_MINUTES"]
                        ?? throw new InvalidOperationException("Password reset expiration not configured.");

            var resetToken = new PasswordResetToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                UserID = user.ID,
                ExpiresAt = DateTime.UtcNow.AddMinutes(
                        int.Parse(expirationMinutes))
            };

            Db.PasswordResetTokens.Add(resetToken);
            await Db.SaveChangesAsync();

            var resetLink = $"{config["App:BASE_URL"]}/reset-password?token={Uri.EscapeDataString(resetToken.Token)}";
            var body = emailService.LoadTemplate("PasswordReset.html", new Dictionary<string, string>
            {
                { "RESET_LINK", resetLink },
                { "EXPIRATION_MINUTES", expirationMinutes }
            });

            await emailService.SendNoReplyEmailAsync(
                    user.Email,
                    "Password Reset Request",
                    body
                );

            return Ok();
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var resetToken = await Db.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == request.Token);

            if (resetToken is null || !resetToken.IsValid)
                return BadRequest(new { message = "Invalid or expired reset token" });

            string passwordHash = PasswordHelper.HashPassword(request.NewPassword, out string salt);
            resetToken.User.Password = passwordHash;
            resetToken.User.Salt = salt;
            resetToken.UsedAt = DateTime.UtcNow;

            await tokenService.RevokeAllUserTokensAsync(resetToken.User.ID);
            await Db.SaveChangesAsync();
            return Ok(new { message = "Password reset successful." });
        }

        [HttpPost("contactForm")]
        public async Task<IActionResult> ContactForm([FromBody] ContactFormRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var body = emailService.LoadTemplate("ContactUsSupport.html", new Dictionary<string, string>
            {
                { "NAME", request.Name },
                { "EMAIL", request.Email },
                { "MESSAGE", request.Message },
                { "SUBJECT", request.Subject }
            });

            await emailService.SendNoReplyEmailAsync(
                    config["Email:SUPPORT_MAIL"] ?? throw new InvalidOperationException("Contact form recipient email not configured."),
                    "New Contact Form Submission",
                    body
                );

            var confirmationBody = emailService.LoadTemplate("ContactUsUser.html", new Dictionary<string, string>
            {
                { "NAME", request.Name }
            });
            await emailService.SendNoReplyEmailAsync(
                    request.Email,
                    "Confirmation: Your Message Has Been Received",
                    confirmationBody
                );
            return Ok(new { message = "Your message has been sent. We'll get back to you soon!" });
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
