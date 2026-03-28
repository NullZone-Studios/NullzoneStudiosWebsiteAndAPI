using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NullzoneStudiosWebsite.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddUserDataModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "nullzonewebsite_user_data",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false),
                    first_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    last_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    display_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    about = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    profile_image = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    gender = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    birthdate = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nullzonewebsite_user_data", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_nullzonewebsite_user_data_nullzonewebsite_users_user_id",
                        column: x => x.user_id,
                        principalTable: "nullzonewebsite_users",
                        principalColumn: "user_ID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "nullzonewebsite_user_worker_data",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false),
                    job_title = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    about = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nullzonewebsite_user_worker_data", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_nullzonewebsite_user_worker_data_nullzonewebsite_users_user_~",
                        column: x => x.user_id,
                        principalTable: "nullzonewebsite_users",
                        principalColumn: "user_ID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "nullzonewebsite_user_data");

            migrationBuilder.DropTable(
                name: "nullzonewebsite_user_worker_data");
        }
    }
}
