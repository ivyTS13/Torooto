using Imagekit;
using Imagekit.Models.Files;
using Microsoft.Extensions.Configuration;
using TorootoAPI.Application.Interfaces;

namespace TorootoAPI.Infrastucture.Services;

public sealed class ImageKitStorageService : IImageStorageService
{
    private readonly ImageKitClient _imageKit;

    public ImageKitStorageService(IConfiguration configuration)
    {
        var privateKey = configuration.GetSection("ImageKit")["PrivateKey"] ?? string.Empty;
        _imageKit = new ImageKitClient
        {
            PrivateKey = privateKey
        };
    }

    public async Task<string> UploadImageAsync(ImageUploadRequest request, CancellationToken ct = default)
    {
        var parameters = new FileUploadParams
        {
            File = request.Content,
            FileName = request.FileName,
            Folder = request.Folder,
            Tags = request.Tags?.ToList()
        };

        var response = await _imageKit.Files.Upload(parameters, ct);
        return response.Url ?? throw new InvalidOperationException("Image storage provider did not return an upload URL.");
    }
}
