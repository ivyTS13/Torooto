using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.UseCases;
using TorootoASP.Extensions;

namespace TorootoASP.Controllers;

[EnableRateLimiting("StandardLimit")]
[ApiController]
[Route("decks")]
public sealed class DecksController(
    IDeckService deckService,
    ICardService cardService,
    ILogger<DecksController> logger) : ControllerBase
{
    [HttpGet("list")]
    public async Task<IActionResult> GetDecks(CancellationToken ct)
    {
        var result = await deckService.GetAllDecksAsync(ct);
        return this.ToActionResult(result, "Decks retrieved");
    }

    [HttpPost("add")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> AddNewDeck([FromBody] DeckCreateDto deckIn, CancellationToken ct)
    {
        try
        {
            var result = await deckService.CreateDeckAsync(deckIn, ct);
            return this.ToActionResult(result, "Added successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating deck");
            return StatusCode(500, new ApiResponse<object>(false, null, "An unexpected error occurred while creating the deck."));
        }
    }

    [HttpDelete("{deck_id:guid}")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> DeleteDeck(Guid deck_id, CancellationToken ct)
    {
        try
        {
            var result = await deckService.SoftDeleteDeckAsync(deck_id, ct);
            return this.ToActionResult(result, "Deck moved to trash");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting deck {DeckId}", deck_id);
            return StatusCode(500, new ApiResponse<object>(false, null, "An unexpected error occurred while deleting the deck."));
        }
    }

    [HttpPut("{deck_id:guid}")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> UpdateDeck(
        Guid deck_id,
        [FromBody] DeckUpdateDto deckData,
        CancellationToken ct)
    {
        try
        {
            var result = await deckService.UpdateDeckAsync(deck_id, deckData, ct);
            return this.ToActionResult(result, "Deck updated successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating deck {DeckId}", deck_id);
            return StatusCode(500, new ApiResponse<object>(false, null, "An unexpected error occurred while updating the deck."));
        }
    }

    [HttpPost("{deck_id:guid}/restore")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> RestoreDeck(Guid deck_id, CancellationToken ct)
    {
        try
        {
            var result = await deckService.RestoreDeckAsync(deck_id, ct);
            return this.ToActionResult(result, "Deck and all associated cards have been restored.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error restoring deck {DeckId}", deck_id);
            return StatusCode(500, new ApiResponse<object>(false, null, "An error occurred while trying to restore the deck."));
        }
    }

    [HttpGet("{deck_id:guid}/cards")]
    public async Task<IActionResult> GetCards(Guid deck_id, CancellationToken ct)
    {
        var result = await cardService.GetCardsByDeckIdAsync(deck_id, ct);
        return this.ToActionResult(result, "Cards retrieved");
    }

    [HttpPost("{deck_id:guid}/upload-cards")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> UploadCardsRobust(
        Guid deck_id,
        IFormFile? file,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new ApiResponse<object>(false, null, "CSV file is required."));

        try
        {
            await using var stream = file.OpenReadStream();
            var result = await deckService.UploadCardsFromCsvAsync(deck_id, stream, ct);
            if (result.IsFailure)
                return this.ToActionResult(result, string.Empty);

            var message = result.Value.Count > 0
                ? $"Successfully uploaded {result.Value.Count} cards."
                : "No valid data found to upload.";

            return Ok(new ApiResponse<IReadOnlyList<CardResponseDto>>(true, result.Value, message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed parsing CSV upload for deck {DeckId}", deck_id);
            return StatusCode(500, new ApiResponse<object>(false, null, "Internal server error processing file."));
        }
    }
}
