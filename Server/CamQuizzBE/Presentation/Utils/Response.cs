namespace CamQuizzBE.Presentation.Utils;

public class ApiResponse<T>
{
    public T? Data { get; set; }
    public string Status { get; set; }
    public PaginationMeta? Pagination { get; set; }

    public ApiResponse(T data, string status = "success", PaginationMeta? pagination = null)
    {
        Data = data;
        Status = status;
        Pagination = pagination;
    }
}

public class PaginationMeta
{
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
}
