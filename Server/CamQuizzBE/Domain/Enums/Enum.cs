namespace CamQuizzBE.Domain.Enums
{
    public enum QuizStatus
    {
        Public,
        Private,
        Option
    }
    public enum GroupStatus
    {
        Active,
        Deleted,
        OnHold
    }
    public enum MemberStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public enum ReportStatus
    {
        Pending,
        Resolved,
        Dismissed
    }

    public enum QuizReportAction
    {
        Keep,           // No action needed
        SoftDelete,     // Mark as deleted
        HardDelete     // Permanent delete
    }
}
