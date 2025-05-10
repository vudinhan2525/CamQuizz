using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities
{
    [Table("group_shared")]
    public class GroupShared
    {
        [Column("quiz_id")]
        public int QuizId { get; set; }

        [Column("owner_id")]
        public int OwnerId { get; set; }

        [Column("group_id")]
        public int GroupId { get; set; }

        // Navigation properties (optional, based on your database design)
        public Quizzes? Quiz { get; set; }
        public AppUser? Owner { get; set; }
        public Group? Group { get; set; }
    }
}
