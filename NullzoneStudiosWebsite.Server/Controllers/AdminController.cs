using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    public abstract class AdminControllerBase(DataContext db) : ControllerBase
    {
        protected DataContext db { get; } = db;

        protected async Task<bool> IsAdminAsync()
        {
            var claim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(claim, out var userID)) return false;

            var user = await db.Users.FindAsync(userID);
            return user?.AccessLevel == DataModels.AccessLevel.Admin;
        }
    }
}
