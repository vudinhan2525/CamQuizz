using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class MakeAnswerIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_user_answers_answers_answer_id",
                table: "user_answers");

            migrationBuilder.AlterColumn<int>(
                name: "answer_id",
                table: "user_answers",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_user_answers_answers_answer_id",
                table: "user_answers",
                column: "answer_id",
                principalTable: "answers",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_user_answers_answers_answer_id",
                table: "user_answers");

            migrationBuilder.AlterColumn<int>(
                name: "answer_id",
                table: "user_answers",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_user_answers_answers_answer_id",
                table: "user_answers",
                column: "answer_id",
                principalTable: "answers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
