using System.Text;
using System.Text.RegularExpressions;
using TorootoAPI.Application.Interfaces;

namespace TorootoAPI.Infrastucture.Services;

public sealed partial class CsvCardParser : ICsvCardParser
{
    private static readonly string[] RequiredHeaders =
        ["Card Number & Name", "suit", "image_url", "position"];

    [GeneratedRegex(@"[^a-z0-9]+")]
    private static partial Regex NonAlphanumericRegex();

    public async Task<CsvParseResult> ParseAsync(Stream csvStream, CancellationToken ct = default)
    {
        using var reader = new StreamReader(csvStream, leaveOpen: true);
        var headerLine = await reader.ReadLineAsync(ct);
        if (string.IsNullOrWhiteSpace(headerLine))
            return new CsvParseResult([], [], "CSV file is empty.");

        var headers = ParseCsvLine(headerLine).Select(h => h.Trim()).ToList();
        var missing = RequiredHeaders.Except(headers).ToList();
        if (missing.Count > 0)
            return new CsvParseResult([], [], $"Invalid CSV structure. Missing columns: {string.Join(", ", missing)}");

        var extraHeaders = headers.Except(RequiredHeaders).ToList();
        var headerToCleaned = extraHeaders.ToDictionary(
            h => h,
            h => NonAlphanumericRegex().Replace(h.Trim().ToLowerInvariant(), "_").Trim('_'));

        var rows = new List<ParsedCardRow>();
        var errors = new List<string>();
        int lineNum = 2;

        while (!reader.EndOfStream)
        {
            ct.ThrowIfCancellationRequested();
            var line = await reader.ReadLineAsync(ct);
            if (string.IsNullOrWhiteSpace(line))
            {
                lineNum++;
                continue;
            }

            var values = ParseCsvLine(line);
            if (values.Count < headers.Count)
            {
                errors.Add($"Line {lineNum}: Row length mismatch (expected {headers.Count}, got {values.Count})");
                lineNum++;
                continue;
            }

            var rowDict = headers
                .Select((h, index) => new { Header = h, Value = values[index].Trim() })
                .ToDictionary(k => k.Header, v => v.Value);

            if (!int.TryParse(rowDict["position"], out var position) || position < 0)
            {
                errors.Add($"Line {lineNum}: Invalid position '{rowDict["position"]}'");
                lineNum++;
                continue;
            }

            var cardName = rowDict["Card Number & Name"];
            var cardSuit = rowDict["suit"];
            if (string.IsNullOrWhiteSpace(cardName) || string.IsNullOrWhiteSpace(cardSuit))
            {
                errors.Add($"Line {lineNum}: Card name and suit are required");
                lineNum++;
                continue;
            }

            var metadataDict = new Dictionary<string, object>();
            foreach (var kvp in headerToCleaned)
            {
                if (rowDict.TryGetValue(kvp.Key, out var val))
                    metadataDict[kvp.Value] = val;
            }

            var imageUrl = rowDict.TryGetValue("image_url", out var rawImg) && !string.IsNullOrWhiteSpace(rawImg)
                ? rawImg
                : null;

            rows.Add(new ParsedCardRow(cardName, cardSuit, position, imageUrl, metadataDict));
            lineNum++;
        }

        return new CsvParseResult(rows, errors);
    }

    private static List<string> ParseCsvLine(string line)
    {
        var result = new List<string>();
        var current = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    current.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }

        result.Add(current.ToString());
        return result;
    }
}
