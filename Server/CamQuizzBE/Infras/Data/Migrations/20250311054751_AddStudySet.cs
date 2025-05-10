using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStudySet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropForeignKey(
            //     name: "FK_members_AspNetUsers_user_id",
            //     table: "members");

            // migrationBuilder.AddColumn<int>(
            //     name: "status",
            //     table: "members",
            //     type: "int",
            //     nullable: false,
            //     defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "studysets",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    flashcard_number = table.Column<int>(type: "int", nullable: false),
                    estimated = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_studysets", x => x.id);
                    table.ForeignKey(
                        name: "FK_studysets_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "flashcards",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    question = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    answer = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    studyset_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_flashcards", x => x.id);
                    table.ForeignKey(
                        name: "FK_flashcards_studysets_studyset_id",
                        column: x => x.studyset_id,
                        principalTable: "studysets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_flashcards_studyset_id",
                table: "flashcards",
                column: "studyset_id");

            migrationBuilder.CreateIndex(
                name: "IX_studysets_user_id",
                table: "studysets",
                column: "user_id");

            // migrationBuilder.AddForeignKey(
            //     name: "FK_members_AspNetUsers_user_id",
            //     table: "members",
            //     column: "user_id",
            //     principalTable: "AspNetUsers",
            //     principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropForeignKey(
            //     name: "FK_members_AspNetUsers_user_id",
            //     table: "members");

            migrationBuilder.DropTable(
                name: "flashcards");

            migrationBuilder.DropTable(
                name: "studysets");

            // migrationBuilder.DropColumn(
            //     name: "status",
            //     table: "members");

            // migrationBuilder.AddForeignKey(
            //     name: "FK_members_AspNetUsers_user_id",
            //     table: "members",
            //     column: "user_id",
            //     principalTable: "AspNetUsers",
            //     principalColumn: "Id",
            //     onDelete: ReferentialAction.Cascade);
        }
    }
}
