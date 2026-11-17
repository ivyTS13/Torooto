namespace TorootoAPI.Domain.Common;

public enum ErrorType
{
    None = 0,
    Validation = 1,
    NotFound = 2,
    Conflict = 3,
    Unauthorized = 4,
    Forbidden = 5,
    Failure = 6
}

public sealed record DomainError(string Code, string Message, ErrorType Type)
{
    public static readonly DomainError None = new(string.Empty, string.Empty, ErrorType.None);

    public static DomainError Validation(string message, string code = "Validation.Error")
        => new(code, message, ErrorType.Validation);

    public static DomainError NotFound(string message, string code = "Resource.NotFound")
        => new(code, message, ErrorType.NotFound);

    public static DomainError Conflict(string message, string code = "Resource.Conflict")
        => new(code, message, ErrorType.Conflict);

    public static DomainError Unauthorized(string message, string code = "Auth.Unauthorized")
        => new(code, message, ErrorType.Unauthorized);

    public static DomainError Forbidden(string message, string code = "Auth.Forbidden")
        => new(code, message, ErrorType.Forbidden);

    public static DomainError Failure(string message, string code = "Server.Failure")
        => new(code, message, ErrorType.Failure);
}

public class Result
{
    protected Result(bool isSuccess, DomainError error)
    {
        if (isSuccess && error != DomainError.None)
            throw new InvalidOperationException("Successful result cannot contain an error.");
        if (!isSuccess && error == DomainError.None)
            throw new InvalidOperationException("Failed result must contain an error.");

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public DomainError Error { get; }

    public static Result Success() => new(true, DomainError.None);
    public static Result Failure(DomainError error) => new(false, error);

    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, DomainError.None);
    public static Result<TValue> Failure<TValue>(DomainError error) => new(default, false, error);
}

public sealed class Result<TValue> : Result
{
    private readonly TValue? _value;

    internal Result(TValue? value, bool isSuccess, DomainError error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access Value on a failed Result.");
}
