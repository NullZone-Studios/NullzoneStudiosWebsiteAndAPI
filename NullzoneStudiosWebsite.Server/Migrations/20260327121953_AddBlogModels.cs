using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NullzoneStudiosWebsite.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBlogModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "nullzonewebsite_blog_posts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    title = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    post_image_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    author_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nullzonewebsite_blog_posts", x => x.id);
                    table.ForeignKey(
                        name: "FK_nullzonewebsite_blog_posts_nullzonewebsite_users_author_id",
                        column: x => x.author_id,
                        principalTable: "nullzonewebsite_users",
                        principalColumn: "user_ID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "nullzonewebsite_blog_comments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    post_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nullzonewebsite_blog_comments", x => x.id);
                    table.ForeignKey(
                        name: "FK_nullzonewebsite_blog_comments_nullzonewebsite_blog_posts_pos~",
                        column: x => x.post_id,
                        principalTable: "nullzonewebsite_blog_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_nullzonewebsite_blog_comments_nullzonewebsite_users_user_id",
                        column: x => x.user_id,
                        principalTable: "nullzonewebsite_users",
                        principalColumn: "user_ID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "nullzonewebsite_blog_reactions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    type = table.Column<int>(type: "int", nullable: false),
                    post_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nullzonewebsite_blog_reactions", x => x.id);
                    table.ForeignKey(
                        name: "FK_nullzonewebsite_blog_reactions_nullzonewebsite_blog_posts_po~",
                        column: x => x.post_id,
                        principalTable: "nullzonewebsite_blog_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_nullzonewebsite_blog_reactions_nullzonewebsite_users_user_id",
                        column: x => x.user_id,
                        principalTable: "nullzonewebsite_users",
                        principalColumn: "user_ID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_nullzonewebsite_blog_comments_post_id",
                table: "nullzonewebsite_blog_comments",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_nullzonewebsite_blog_comments_user_id",
                table: "nullzonewebsite_blog_comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_nullzonewebsite_blog_posts_author_id",
                table: "nullzonewebsite_blog_posts",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_nullzonewebsite_blog_reactions_post_id_user_id",
                table: "nullzonewebsite_blog_reactions",
                columns: new[] { "post_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_nullzonewebsite_blog_reactions_user_id",
                table: "nullzonewebsite_blog_reactions",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "nullzonewebsite_blog_comments");

            migrationBuilder.DropTable(
                name: "nullzonewebsite_blog_reactions");

            migrationBuilder.DropTable(
                name: "nullzonewebsite_blog_posts");
        }
    }
}
