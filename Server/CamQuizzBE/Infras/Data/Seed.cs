using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;

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
    public static async Task SeedGenres(DataContext context)
    {
        Console.WriteLine("🔄 Checking if genres exist...");
        if (!await context.Genres.AnyAsync())
        {
            Console.WriteLine("✅ No genres found, seeding genres...");
            var genres = new List<Genres>
            {
                new Genres { Id = (int)GenreType.GeneralKnowledge, Name = "General Knowledge" },
                new Genres { Id = (int)GenreType.Mathematics, Name = "Mathematics" },
                new Genres { Id = (int)GenreType.Science, Name = "Science" },
                new Genres { Id = (int)GenreType.History, Name = "History" },
                new Genres { Id = (int)GenreType.Languages, Name = "Languages" },
                new Genres { Id = (int)GenreType.Technology, Name = "Technology" },
                new Genres { Id = (int)GenreType.ArtsAndLiterature, Name = "Arts & Literature" },
                new Genres { Id = (int)GenreType.Geography, Name = "Geography" }
            };

            await context.Genres.AddRangeAsync(genres);
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Genres seeded successfully.");
        }
        else
        {
            Console.WriteLine("✅ Genres already exist, skipping seeding.");
        }
    }
}
