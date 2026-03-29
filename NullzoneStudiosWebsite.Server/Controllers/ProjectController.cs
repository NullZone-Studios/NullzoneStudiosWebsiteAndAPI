using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NullzoneStudiosWebsite.Server.DataModels;
using NullzoneStudiosWebsite.Server.Requests;

namespace NullzoneStudiosWebsite.Server.Controllers
{
    [ApiController]
    [Route("/api/projects")]
    public class ProjectController(DataContext database) : AdminControllerBase(database)
    {
        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await Db.Projects
                .OrderBy(p => p.CreatedAt)
                .Select(p => new
                {
                    p.ID,
                    p.Title,
                    p.Content,
                    p.Href,
                    p.BannerImageUrl
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest()
        {
            var latest = await Db.Projects
                .OrderBy(p => p.CreatedAt)
                .Take(10)
                .Select(p => new
                {
                    p.ID,
                    p.Title,
                    p.Content,
                    p.Href,
                    p.BannerImageUrl
                })
                .ToListAsync();
            return Ok(latest);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var project = new Project
            {
                Title = request.Title,
                Content = request.Content ?? "",
                Href = request.Href,
                BannerImageUrl = request.BannerImageUrl
            };

            Db.Projects.Add(project);
            await Db.SaveChangesAsync();
            return Ok(project);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task< IActionResult> UpdateProject(int id, [FromBody] UpdateProjectRequest request)
        {
            if (!await IsAdminAsync()) return Forbid();

            var project = await Db.Projects.FindAsync(id);
            if (project is null) return NotFound();

            if (request.Title is not null) project.Title = request.Title;
            if (request.Content is not null) project.Content = request.Content;
            if (request.Href is not null) project.Href = request.Href;
            if (request.BannerImageUrl is not null) project.BannerImageUrl = request.BannerImageUrl;

            await Db.SaveChangesAsync();
            return Ok(project);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id) {
            if (!await IsAdminAsync()) return Forbid();

            var project = await Db.Projects.FindAsync(id);
            if (project is null) return NotFound();

            Db.Projects.Remove(project);
            await Db.SaveChangesAsync();
            return NoContent();
        }
    }
}
