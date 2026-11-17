namespace TorootoAPI.Application.Interfaces;

public sealed record ImageUploadRequest(
    Stream Content,
    string FileName,
    string ContentType,
    string Folder,
    IReadOnlyList<string>? Tags = null
);

public interface IImageStorageService
{
    Task<string> UploadImageAsync(ImageUploadRequest request, CancellationToken ct = default);
}
