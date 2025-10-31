namespace SprintEvaluationProjectCropDeal.Models.DTO;

public class FinancialReportDto
{
    public string Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalTransactions { get; set; }
    public int CompletedTransactions { get; set; }
    public int PendingTransactions { get; set; }
    public List<FarmerFinancialSummary> FarmerSummaries { get; set; }
    public List<DealerFinancialSummary> DealerSummaries { get; set; }
}

public class FarmerFinancialSummary
{
    public int FarmerId { get; set; }
    public string FarmerName { get; set; }
    public string Email { get; set; }
    public string Location { get; set; }
    public decimal TotalEarnings { get; set; }
    public int TotalSales { get; set; }
    public int CompletedSales { get; set; }
}

public class DealerFinancialSummary
{
    public int DealerId { get; set; }
    public string DealerName { get; set; }
    public string Email { get; set; }
    public string Location { get; set; }
    public decimal TotalSpent { get; set; }
    public int TotalPurchases { get; set; }
    public int CompletedPurchases { get; set; }
}
