public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }

    public PagedResult(IEnumerable<T> items, int totalItems, int page, int limit)
    {
        Items = items;
        TotalItems = totalItems;
        Limit = limit;
        Page = page;
        TotalPages = (int)Math.Ceiling((double)totalItems / limit);
    }
}
