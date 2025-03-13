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

    public DbSet<Group> Groups { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<StudySet> StudySets { get; set; }
    public DbSet<FlashCard> FlashCards { get; set; }

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

        #region Group-Member-User Relationship
        modelBuilder.Entity<Member>()
            .HasKey(m => new { m.GroupId, m.UserId }); // Đặt khóa chính là cặp GroupId - UserId
        modelBuilder.Entity<Member>()
            .Property(m => m.Status)
            .HasConversion<int>();
        modelBuilder.Entity<Member>()
            .HasOne(m => m.Group)
            .WithMany(g => g.Members)
            .HasForeignKey(m => m.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Member>()
            .HasOne(m => m.User)
            .WithMany(u => u.Members)
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Group>()
            .HasOne(g => g.Owner)
            .WithMany()
            .HasForeignKey(g => g.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
        #endregion

        #region StudySets-FlashCards Relationship
        modelBuilder.Entity<FlashCard>()
            .HasOne(f => f.StudySet)
            .WithMany(s => s.FlashCards)
            .HasForeignKey(f => f.StudySetId)
            .OnDelete(DeleteBehavior.Cascade);
        #endregion

        #region StudySets-User Relationship
        modelBuilder.Entity<StudySet>()
            .HasOne(s => s.User)
            .WithMany(u => u.StudySets)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        #endregion


        // Convert Enum -> String
        modelBuilder.Entity<Quizzes>()
           .Property(q => q.Status)
           .HasConversion<string>();
    }
}
