using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class Update_schema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_published",
                table: "quizzes");

            migrationBuilder.RenameColumn(
                name: "quiz_id",
                table: "quizzes",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "quizzes",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "quizzes",
                newName: "images");

            migrationBuilder.AddColumn<int>(
                name: "duration",
                table: "quizzes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "genre_id",
                table: "quizzes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "question_nums",
                table: "quizzes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "quizzes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "genres",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_genres", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "questions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    answer_number = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    duration = table.Column<int>(type: "int", nullable: false),
                    score = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    quiz_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_questions", x => x.id);
                    table.ForeignKey(
                        name: "FK_questions_quizzes_quiz_id",
                        column: x => x.quiz_id,
                        principalTable: "quizzes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "answers",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    answer = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_correct = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    question_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_answers", x => x.id);
                    table.ForeignKey(
                        name: "FK_answers_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_quizzes_genre_id",
                table: "quizzes",
                column: "genre_id");

            migrationBuilder.CreateIndex(
                name: "IX_answers_question_id",
                table: "answers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "IX_questions_quiz_id",
                table: "questions",
                column: "quiz_id");

            migrationBuilder.AddForeignKey(
                name: "FK_quizzes_genres_genre_id",
                table: "quizzes",
                column: "genre_id",
                principalTable: "genres",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_quizzes_genres_genre_id",
                table: "quizzes");

            migrationBuilder.DropTable(
                name: "answers");

            migrationBuilder.DropTable(
                name: "genres");

            migrationBuilder.DropTable(
                name: "questions");

            migrationBuilder.DropIndex(
                name: "IX_quizzes_genre_id",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "duration",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "genre_id",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "question_nums",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "quizzes");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "quizzes",
                newName: "quiz_id");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "quizzes",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "images",
                table: "quizzes",
                newName: "description");

            migrationBuilder.AddColumn<bool>(
                name: "is_published",
                table: "quizzes",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
