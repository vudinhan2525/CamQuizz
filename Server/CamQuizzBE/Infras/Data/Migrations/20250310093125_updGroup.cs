using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class updGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "groups",
                newName: "CreatedAt");

            migrationBuilder.AddColumn<int>(
                name: "owner_id",
                table: "groups",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_groups_owner_id",
                table: "groups",
                column: "owner_id");

            migrationBuilder.AddForeignKey(
                name: "FK_groups_AspNetUsers_owner_id",
                table: "groups",
                column: "owner_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_groups_AspNetUsers_owner_id",
                table: "groups");

            migrationBuilder.DropIndex(
                name: "IX_groups_owner_id",
                table: "groups");

            migrationBuilder.DropColumn(
                name: "owner_id",
                table: "groups");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "groups",
                newName: "created_at");
        }
    }
}
