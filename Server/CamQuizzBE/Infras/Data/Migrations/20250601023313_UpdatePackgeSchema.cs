using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePackgeSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "max_number_of_attended",
                table: "packages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "max_number_of_quizz",
                table: "packages",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "max_number_of_attended",
                table: "packages");

            migrationBuilder.DropColumn(
                name: "max_number_of_quizz",
                table: "packages");
        }
    }
}
