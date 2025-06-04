using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class SharedUserAndGroupToQuizzes2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_group_shared_quizzes_QuizzesId",
                table: "group_shared");

            migrationBuilder.DropForeignKey(
                name: "FK_user_shared_quizzes_QuizzesId",
                table: "user_shared");

            migrationBuilder.DropIndex(
                name: "IX_user_shared_QuizzesId",
                table: "user_shared");

            migrationBuilder.DropIndex(
                name: "IX_group_shared_QuizzesId",
                table: "group_shared");

            migrationBuilder.DropColumn(
                name: "QuizzesId",
                table: "user_shared");

            migrationBuilder.DropColumn(
                name: "QuizzesId",
                table: "group_shared");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QuizzesId",
                table: "user_shared",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuizzesId",
                table: "group_shared",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_shared_QuizzesId",
                table: "user_shared",
                column: "QuizzesId");

            migrationBuilder.CreateIndex(
                name: "IX_group_shared_QuizzesId",
                table: "group_shared",
                column: "QuizzesId");

            migrationBuilder.AddForeignKey(
                name: "FK_group_shared_quizzes_QuizzesId",
                table: "group_shared",
                column: "QuizzesId",
                principalTable: "quizzes",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_user_shared_quizzes_QuizzesId",
                table: "user_shared",
                column: "QuizzesId",
                principalTable: "quizzes",
                principalColumn: "id");
        }
    }
}
