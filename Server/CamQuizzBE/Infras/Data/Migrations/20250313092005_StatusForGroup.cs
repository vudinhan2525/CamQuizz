using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class StatusForGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "groups",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "groups");
        }
    }
}
