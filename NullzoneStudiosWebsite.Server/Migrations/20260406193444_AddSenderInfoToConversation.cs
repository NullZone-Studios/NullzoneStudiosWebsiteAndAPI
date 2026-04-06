using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NullzoneStudiosWebsite.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSenderInfoToConversation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "sender_email",
                table: "nullzonewebsite_email_conversation",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "sender_name",
                table: "nullzonewebsite_email_conversation",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "sender_email",
                table: "nullzonewebsite_email_conversation");

            migrationBuilder.DropColumn(
                name: "sender_name",
                table: "nullzonewebsite_email_conversation");
        }
    }
}
