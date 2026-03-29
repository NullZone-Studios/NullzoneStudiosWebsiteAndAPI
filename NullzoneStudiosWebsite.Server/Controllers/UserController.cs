using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NullzoneStudiosWebsite.Server.DataModels;
using NullzoneStudiosWebsite.Server.Requests;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController(DataContext database) : AdminControllerBase(database)
    {
        [HttpGet("{username}")]
        public async Task<IActionResult> GetUserInfo(string username)
        {
            var user = await Db.Users
                .Where(u => u.Username == username)
                .Select(u => new
                {
                    u.Username,
                    Name = u.UserData.DisplayName != string.Empty
                        ? u.UserData.DisplayName
                        : u.UserData.FirstName + " " + u.UserData.LastName,
                    About = u.UserData.About,
                    ProfileImage = u.UserData.ProfileImage,
                })
                .FirstOrDefaultAsync();
            if (user is null) return NotFound();

            return Ok(user);
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var id = GetCurrentUserID();
            if (id is null) return Unauthorized();

            var user = await Db.Users
                .Where(u => u.ID == id)
                .Select(u => new
                {
                    u.Username,
                    u.Email,
                    u.AccessLevel,
                    u.LastLoginStamp,
                    FirstName = u.UserData.FirstName,
                    LastName = u.UserData.LastName,
                    DisplayName = u.UserData.DisplayName,
                    About = u.UserData.About,
                    ProfileImage = u.UserData.ProfileImage,
                    Gender = u.UserData.Gender,
                    BirthDate = u.UserData.Birthdate,
                    JobTitle = u.UserWorkerData != null ? u.UserWorkerData.JobTitle : null,
                }).FirstOrDefaultAsync();
            if (user is null) return NotFound();

            return Ok(user);
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileDataRequest request)
        {
            var id = GetCurrentUserID();
            if (id is null) return Unauthorized();

            var user = await Db.UserData.FindAsync(id);
            if (user is null) return NotFound();

            if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName;
            if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName;
            if (!string.IsNullOrEmpty(request.DisplayName)) user.DisplayName = request.DisplayName;
            if (!string.IsNullOrEmpty(request.About)) user.About = request.About;
            if (!string.IsNullOrEmpty(request.ProfileImage)) user.ProfileImage = request.ProfileImage;
            if (!string.IsNullOrEmpty(request.Gender)) user.Gender = request.Gender;
            if (request.BirthDate.HasValue) user.Birthdate = request.BirthDate.Value;

            await Db.SaveChangesAsync();
            return Ok(user);
        }
    }
}
