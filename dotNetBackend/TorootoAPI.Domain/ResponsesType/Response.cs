

namespace TorootoAPI.Domain.ResponsesType
{
    public record Response(bool Flag= false, string Message= null)
    {
        public object? Data { get; init; }
    }
}
