using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NullzoneStudiosWebsite.Server.DataModels;
using NullzoneStudiosWebsite.Server.Requests;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    [ApiController]
    [Route("api/employees")]
    public class EmployeeController(DataContext database) : AdminControllerBase(database)
    {
        [HttpGet]
        public async Task<IActionResult> GetEmployees()
        {
            var employes = await Db.Users
                .Where(u => u.UserWorkerData != null)
                .Select(u => new
                {
                    FirstName = u.UserData.FirstName,
                    LastName = u.UserData.LastName,
                    ProfileImage = u.UserData.ProfileImage,
                    JobTitle = u.UserWorkerData!.JobTitle,
                    About = u.UserWorkerData!.About,
                })
                .ToListAsync();

            return Ok(employes);
        }

        [Authorize]
        [HttpPost("{userID}/employee")]
        public async Task<IActionResult> AddEmployeeData(int userID, [FromBody] EmployeeDataRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var user = await Db.Users.FindAsync(userID);
            if (user is null) return NotFound();

            if (user.UserWorkerData is not null)
                return BadRequest(new { message = "User already has worker data." });

            var employeeData = new UserEmployeeData
            {
                UserID = userID,
                JobTitle = request.JobTitle,
                About = request.About ?? string.Empty,
            };

            Db.UserEmployeeData.Add(employeeData);
            await Db.SaveChangesAsync();
            return Ok(employeeData);
        }

        [Authorize]
        [HttpPut("{userID}/employee")]
        public async Task<IActionResult> UpdateEmployeeData(int userID, [FromBody] EmployeeDataRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();
            
            var employeeData = await Db.UserEmployeeData.FindAsync(userID);
            if (employeeData is null) return NotFound();

            if (request.JobTitle is not null) employeeData.JobTitle = request.JobTitle;
            if (request.About is not null) employeeData.About = request.About;

            await Db.SaveChangesAsync();
            return Ok(employeeData);
        }

        [Authorize]
        [HttpDelete("{userID}/employee")]
        public async Task<IActionResult> RemoveEmployeeData(int userID) {
            if (!await IsAdminAsync()) return Forbid();

            var workerData = await Db.UserEmployeeData.FindAsync(userID);
            if (workerData is null) return NotFound();
            
            Db.UserEmployeeData.Remove(workerData);
            await Db.SaveChangesAsync();
            return NoContent();
        }
    }
}
