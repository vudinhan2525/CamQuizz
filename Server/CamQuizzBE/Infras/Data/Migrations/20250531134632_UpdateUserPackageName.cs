using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CamQuizzBE.Infras.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserPackageName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserPackages_AspNetUsers_user_id",
                table: "UserPackages");

            migrationBuilder.DropForeignKey(
                name: "FK_UserPackages_packages_package_id",
                table: "UserPackages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserPackages",
                table: "UserPackages");

            migrationBuilder.RenameTable(
                name: "UserPackages",
                newName: "user_packages");

            migrationBuilder.RenameIndex(
                name: "IX_UserPackages_user_id",
                table: "user_packages",
                newName: "IX_user_packages_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_UserPackages_package_id",
                table: "user_packages",
                newName: "IX_user_packages_package_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_user_packages",
                table: "user_packages",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_user_packages_AspNetUsers_user_id",
                table: "user_packages",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_packages_packages_package_id",
                table: "user_packages",
                column: "package_id",
                principalTable: "packages",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_user_packages_AspNetUsers_user_id",
                table: "user_packages");

            migrationBuilder.DropForeignKey(
                name: "FK_user_packages_packages_package_id",
                table: "user_packages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_user_packages",
                table: "user_packages");

            migrationBuilder.RenameTable(
                name: "user_packages",
                newName: "UserPackages");

            migrationBuilder.RenameIndex(
                name: "IX_user_packages_user_id",
                table: "UserPackages",
                newName: "IX_UserPackages_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_user_packages_package_id",
                table: "UserPackages",
                newName: "IX_UserPackages_package_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserPackages",
                table: "UserPackages",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserPackages_AspNetUsers_user_id",
                table: "UserPackages",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserPackages_packages_package_id",
                table: "UserPackages",
                column: "package_id",
                principalTable: "packages",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
