using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class Update_schema3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "user_id",
                table: "quizzes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_quizzes_user_id",
                table: "quizzes",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_quizzes_AspNetUsers_user_id",
                table: "quizzes",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_quizzes_AspNetUsers_user_id",
                table: "quizzes");

            migrationBuilder.DropIndex(
                name: "IX_quizzes_user_id",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "quizzes");
        }
    }
}
