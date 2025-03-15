using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities
{
    [Table("user_shared")]
    public class UserShared
    {
        [Column("quiz_id")]
        public int QuizId { get; set; }

        [Column("owner_id")]
        public int OwnerId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        // Navigation properties (optional, based on your database design)
        public Quizzes? Quiz { get; set; }
        public AppUser? Owner { get; set; }
        public AppUser? User { get; set; }
    }
}
