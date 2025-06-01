public class RevenueStatsDto
{
    public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
    public int TotalSoldPackages { get; set; }
    public decimal TotalRevenue { get; set; }

    public List<PackageSalesDto> PackageSales { get; set; } = new();
}
public class MonthlyRevenueDto
{
    public int Month { get; set; }
    public decimal Revenue { get; set; }
}

public class PackageSalesDto
{
    public int PackageId { get; set; }
    public string PackageName { get; set; }
    public int SoldCount { get; set; }
}