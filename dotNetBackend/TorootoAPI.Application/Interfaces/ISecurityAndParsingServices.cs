using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user);
}

public interface IPasswordHasher
{
    string Hash(string plainPassword);
    bool Verify(string hashedPassword, string plainPassword);
}

public sealed record ParsedCardRow(
    string CardName,
    string CardSuit,
    int CardPosition,
    string? ImageUrl,
    Dictionary<string, object> Metadata
);

public sealed record CsvParseResult(
    IReadOnlyList<ParsedCardRow> Rows,
    IReadOnlyList<string> Errors,
    string? FatalError = null
);

public interface ICsvCardParser
{
    Task<CsvParseResult> ParseAsync(Stream csvStream, CancellationToken ct = default);
}
