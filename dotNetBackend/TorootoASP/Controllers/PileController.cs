using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.UseCases;
using TorootoASP.Extensions;

namespace TorootoASP.Controllers;

[Authorize]
[EnableRateLimiting("StandardLimit")]
[ApiController]
[Route("piles")]
public sealed class PilesController(
    IPileService pileService,
    ILogger<PilesController> logger) : ControllerBase
{
    [HttpGet("list")]
    public async Task<IActionResult> GetPiles(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        CancellationToken ct = default)
    {
        if (!User.TryGetUserId(out var userId))
            return Unauthorized(new ApiResponse<object>(false, null, "Invalid user token."));

        try
        {
            var result = await pileService.GetUserPilesPagedAsync(userId, page, pageSize, ct);
            return this.ToActionResult(result, "Piles retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching piles for user {UserId}", userId);
            return StatusCode(500, new ApiResponse<object>(false, null, "An error occurred while retrieving piles."));
        }
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddNewPile([FromBody] CreatePileRequestDto request, CancellationToken ct)
    {
        if (!User.TryGetUserId(out var userId))
            return Unauthorized(new ApiResponse<object>(false, null, "Invalid user token."));

        var result = await pileService.DrawPileAsync(userId, request, ct);
        return this.ToActionResult(result, $"Successfully drew {request.NumberOfCards} cards");
    }

    [HttpGet("{pile_id:guid}")]
    public async Task<IActionResult> GetPile(Guid pile_id, CancellationToken ct)
    {
        if (!User.TryGetUserId(out var userId))
            return Unauthorized(new ApiResponse<object>(false, null, "Invalid user token."));

        var result = await pileService.GetPileByIdAsync(pile_id, userId, ct);
        return this.ToActionResult(result, "Pile details retrieved successfully");
    }

    [HttpDelete("{pile_id:guid}")]
    public async Task<IActionResult> DeletePile(Guid pile_id, CancellationToken ct)
    {
        if (!User.TryGetUserId(out var userId))
            return Unauthorized(new ApiResponse<object>(false, null, "Invalid user token."));

        var result = await pileService.SoftDeletePileAsync(pile_id, userId, ct);
        return this.ToActionResult(result, "Pile moved to trash");
    }

    [HttpPost("save-fe-pile")]
    public async Task<IActionResult> SaveFrontendPile([FromBody] SavePileRequestDto request, CancellationToken ct)
    {
        if (!User.TryGetUserId(out var userId))
            return Unauthorized(new ApiResponse<object>(false, null, "Invalid user token."));

        var result = await pileService.SaveFrontendPileAsync(userId, request, ct);
        return this.ToActionResult(result, "Pile saved successfully!");
    }
}
