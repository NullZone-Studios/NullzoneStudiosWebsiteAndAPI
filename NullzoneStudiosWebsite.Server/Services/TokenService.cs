using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NullzoneStudiosWebsite.Server.DataModels;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace NullzoneStudiosWebsite.Server.Services
{
    public class TokenService(IConfiguration config, DataContext db)
    {


        public string GenerateAccessToken(string userID, string username, string email, IEnumerable<string> roles)
        {
            var key = GetSigningKey();
            var expires = int.Parse(
                config["Jwt:ACCESS_TOKEN_EXPIRATION_IN_MINUTES"]
                ?? throw new InvalidOperationException("JWT access token expiration not configured."));

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, userID),
                new(JwtRegisteredClaimNames.UniqueName, username),
                new(JwtRegisteredClaimNames.Email, email),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var token = new JwtSecurityToken(
                issuer: config["Jwt:ISSUER"],
                audience: config["Jwt:AUDIENCE"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expires),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)

                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<RefreshToken> GenerateRefreshTokenAsync(int userID, Guid? familyID = null)
        {
            var expires = int.Parse(
                config["Jwt:REFRESH_TOKEN_EXPIRATION_IN_DAYS"]
                ?? throw new InvalidOperationException("JWT refresh token expiration not configured."));

            var refreshToken = new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                UserID = userID,
                FamilyID = (familyID ?? Guid.NewGuid()).ToString(),
                ExpiresAt = DateTime.UtcNow.AddDays(expires)
            };

            db.RefreshTokens.Add(refreshToken);
            await db.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<RefreshToken?> RotateRefreshTokenAsync(string incomingToken)
        {
            var existing = await db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == incomingToken);

            if (existing is null) return null;

            if (existing.IsRevoked)
            {
                await RevokeTokenFamilyAsync(existing.FamilyID);
                return null;
            }

            if (existing.IsExpired) return null;

            existing.RevokedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return await GenerateRefreshTokenAsync(existing.UserID, Guid.Parse(existing.FamilyID));
        }

        public async Task RevokeTokenFamilyAsync(string familyID)
        {
            var tokens = await db.RefreshTokens
                .Where(t => t.FamilyID == familyID && t.RevokedAt == null)
                .ToListAsync();

            foreach (var token in tokens)
                token.RevokedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
        }

        public async Task RevokeAllUserTokensAsync(int userID)
        {
            var tokens = await db.RefreshTokens
                .Where(t => t.UserID == userID && t.RevokedAt == null)
                .ToListAsync();

            foreach (var token in tokens)
                token.RevokedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
        }

        private SymmetricSecurityKey GetSigningKey() {
            var keyStr = config["Jwt:KEY"]
                ?? throw new InvalidOperationException("JWT key not configured.");
            return new SymmetricSecurityKey(SHA256.HashData(Encoding.UTF8.GetBytes(keyStr)));
        }
    }
}
