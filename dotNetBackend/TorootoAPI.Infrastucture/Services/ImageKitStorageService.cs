using Imagekit;
using Imagekit.Models.Files;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using TorootoAPI.Application.Interfaces;

namespace TorootoAPI.Infrastucture.Services
{
    public class ImageKitStorageService : IImageStorageService
    {
        private readonly ImageKitClient _imageKit;

        public ImageKitStorageService(IConfiguration configuration)
        {
            var config = configuration.GetSection("ImageKit");
            _imageKit = new ImageKitClient
            {
                PrivateKey = config["PrivateKey"]
            };
        }

        public async Task<string> UploadImageAsync(IFormFile file, string fileName, string folder, List<string>? tags = null)
        {
            using var stream = file.OpenReadStream();

            // Setup the upload parameters using the new SDK's model
            FileUploadParams parameters = new()
            {
                File = stream,
                FileName = fileName
               
            };

            // Execute the upload
            var response = await _imageKit.Files.Upload(parameters);

            // Return the resulting URL (assuming standard FileUploadResponse properties)
            return response.Url;
        }
    }
}