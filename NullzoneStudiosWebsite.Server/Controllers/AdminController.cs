using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    public abstract class AdminControllerBase(DataContext db) : ControllerBase
    {
        protected DataContext Db { get; } = db;

        protected async Task<bool> IsAdminAsync()
        {
            var claim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(claim, out var userID)) return false;

            var user = await Db.Users.FindAsync(userID);
            return user?.AccessLevel == DataModels.AccessLevel.Admin;
        }

        protected int? GetCurrentUserID()
        {
            var claim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return int.TryParse(claim, out var id) ? id : null;
        }
    }
}
