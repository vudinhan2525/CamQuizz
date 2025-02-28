using CamQuizzBE.Domain.Entities;

namespace CamQuizzBE.Infras.Data;

public class Seed
{
    public static async Task SeedUsers(
        DataContext context,
        UserManager<AppUser> userManager,
        RoleManager<AppRole> roleManager
    )
    {
        Console.WriteLine("🔄 Checking if roles exist...");
        if (!await roleManager.Roles.AnyAsync())
        {
            Console.WriteLine("✅ No roles found, seeding roles...");
            var roles = new List<AppRole>
            {
                new() { Name = "Student" },
                new() { Name = "Teacher" },
                new() { Name = "Admin" }
            };

            foreach (var role in roles)
            {
                var result = await roleManager.CreateAsync(role);
                if (result.Succeeded)
                {
                    Console.WriteLine($"✅ Role '{role.Name}' created successfully.");
                }
                else
                {
                    Console.WriteLine($"❌ Failed to create role '{role.Name}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
        }
        else
        {
            Console.WriteLine("✅ Roles already exist, skipping seeding.");
        }
    }
}
