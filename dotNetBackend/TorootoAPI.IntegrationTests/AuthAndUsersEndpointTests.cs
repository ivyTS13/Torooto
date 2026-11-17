using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using TorootoAPI.Domain.Models;
using TorootoAPI.IntegrationTests.Infrastructure;
using Xunit;

namespace TorootoAPI.IntegrationTests;

public sealed class AuthAndUsersEndpointTests(TorootoWebApplicationFactory factory)
    : IClassFixture<TorootoWebApplicationFactory>
{
    [Fact]
    public async Task Register_And_Login_Enforce_Dto_Validation_And_Return_SnakeCase_Payloads()
    {
        var client = factory.CreateClient();

        var invalidRegister = await client.PostAsJsonAsync("/auth/register", new
        {
            email = "bad-email",
            password = "123",
            name = "Seeker"
        });
        Assert.Equal(HttpStatusCode.BadRequest, invalidRegister.StatusCode);

        var email = $"seeker_{Guid.NewGuid():N}@example.com";
        var registerResponse = await client.PostAsJsonAsync("/auth/register", new
        {
            email,
            password = "Password123!",
            name = "Arcana Seeker",
            zodiac_sign = "Scorpio"
        });
        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

        using var regJson = JsonDocument.Parse(await registerResponse.Content.ReadAsStringAsync());
        Assert.True(regJson.RootElement.GetProperty("success").GetBoolean());
        var userData = regJson.RootElement.GetProperty("data");
        Assert.Equal(email, userData.GetProperty("email").GetString());
        Assert.False(userData.TryGetProperty("hashed_password", out _));

        var invalidLoginPayload = await client.PostAsJsonAsync("/auth/jwt/login", new
        {
            email = "invalid",
            password = ""
        });
        Assert.Equal(HttpStatusCode.BadRequest, invalidLoginPayload.StatusCode);

        var wrongPassword = await client.PostAsJsonAsync("/auth/jwt/login", new
        {
            email,
            password = "WrongPassword!"
        });
        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);

        var loginResponse = await client.PostAsJsonAsync("/auth/jwt/login", new
        {
            email,
            password = "Password123!"
        });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        using var loginJson = JsonDocument.Parse(await loginResponse.Content.ReadAsStringAsync());
        var tokenData = loginJson.RootElement.GetProperty("data");
        var accessToken = tokenData.GetProperty("access_token").GetString();
        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        Assert.Equal("bearer", tokenData.GetProperty("token_type").GetString());

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        var meResponse = await client.GetAsync("/users/me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        using var meJson = JsonDocument.Parse(await meResponse.Content.ReadAsStringAsync());
        Assert.Equal(email, meJson.RootElement.GetProperty("data").GetProperty("email").GetString());
    }

    [Fact]
    public async Task UpdateUserImage_Blocks_CrossUser_IDOR_Attempt_With_403()
    {
        User? currentUser = null;
        User? targetUser = null;

        await factory.WithDbContextAsync(async (db, hasher) =>
        {
            currentUser = User.Create($"usera_{Guid.NewGuid():N}@example.com", hasher.Hash("Pass123!"), "UserA", null, null);
            targetUser = User.Create($"userb_{Guid.NewGuid():N}@example.com", hasher.Hash("Pass123!"), "UserB", null, null);
            db.Users.AddRange(currentUser, targetUser);
            await db.SaveChangesAsync();
        });

        using var client = factory.CreateAuthenticatedClient(currentUser!);
        using var form = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent([1, 2, 3, 4]);
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/png");
        form.Add(fileContent, "file", "avatar.png");

        var response = await client.PatchAsync($"/users/{targetUser!.Id}/image", form);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
