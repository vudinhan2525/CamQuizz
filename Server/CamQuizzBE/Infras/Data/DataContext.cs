using CamQuizzBE.Domain.Entities;

namespace CamQuizzBE.Infras.Data;

public class DataContext(DbContextOptions options) :
IdentityDbContext<
    AppUser,
    AppRole,
    int,
    IdentityUserClaim<int>,
    AppUserRole,
    IdentityUserLogin<int>,
    IdentityRoleClaim<int>,
    IdentityUserToken<int>
>(options)
{
    public DbSet<Quizzes> Quizzes { get; set; }
    public DbSet<Genres> Genres { get; set; }
    public DbSet<Answers> Answers { get; set; }
    public DbSet<Questions> Questions { get; set; }

    override protected void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        #region User relationships
        #region User-Role
        modelBuilder.Entity<AppUser>()
            .HasMany(x => x.UserRoles)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .IsRequired();

        modelBuilder.Entity<AppRole>()
            .HasMany(x => x.UserRoles)
            .WithOne(x => x.Role)
            .HasForeignKey(x => x.RoleId)
            .IsRequired();
        #endregion
        #endregion

        #region Quizzes-User Relationship
        modelBuilder.Entity<Quizzes>()
            .HasOne(q => q.User)
            .WithMany(u => u.Quizzes)
            .HasForeignKey(q => q.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        #endregion


        #region Quizzes-Genre Relationship
        modelBuilder.Entity<Quizzes>()
            .HasOne(q => q.Genre)
            .WithMany()
            .HasForeignKey(q => q.GenreId)
            .OnDelete(DeleteBehavior.Cascade);
        #endregion

        #region Quizzes-Questions Relationship
        modelBuilder.Entity<Questions>()
            .HasOne(q => q.Quiz)
            .WithMany(qz => qz.Questions)
            .HasForeignKey(q => q.QuizId)
            .OnDelete(DeleteBehavior.Cascade);
        #endregion


        #region Questions-Answers Relationship
        modelBuilder.Entity<Answers>()
            .HasOne(q => q.Question)
            .WithMany(qz => qz.Answers)
            .HasForeignKey(q => q.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
        #endregion
    }
}
