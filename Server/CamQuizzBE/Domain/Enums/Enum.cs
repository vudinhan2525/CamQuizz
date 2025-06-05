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
        Resolved
    }

    public enum QuizReportAction
    {
        Keep,           
        SoftDelete,     
        HardDelete     
    }
}
