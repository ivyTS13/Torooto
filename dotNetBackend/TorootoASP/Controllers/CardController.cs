using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Application.UseCases;
using TorootoASP.Extensions;

namespace TorootoASP.Controllers;

[EnableRateLimiting("StandardLimit")]
[ApiController]
[Route("decks/")]
public sealed class CardsController(
    ICardService cardService,
    ILogger<CardsController> logger) : ControllerBase
{
    [HttpPut("card/{card_id:guid}")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> UpdateCard(
        Guid card_id,
        [FromBody] CardUpdateDto cardData,
        CancellationToken ct)
    {
        try
        {
            var result = await cardService.UpdateCardAsync(card_id, cardData, ct);
            return this.ToActionResult(result, "Card updated successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating card {CardId}", card_id);
            return StatusCode(500, new ApiResponse<object>(false, null, "An error occurred while updating the card."));
        }
    }

    [HttpPost("{deck_id:guid}/cards")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> AddCard(
        Guid deck_id,
        [FromBody] CardCreateDto cardData,
        CancellationToken ct)
    {
        try
        {
            var result = await cardService.AddCardAsync(deck_id, cardData, ct);
            return this.ToActionResult(result, "Card manifested successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating card in deck {DeckId}", deck_id);
            return StatusCode(500, new ApiResponse<object>(false, null, "Failed to create card."));
        }
    }

    [HttpDelete("card/{card_id:guid}")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> DeleteCard(Guid card_id, CancellationToken ct)
    {
        try
        {
            var result = await cardService.SoftDeleteCardAsync(card_id, ct);
            return this.ToActionResult(result, "Card moved to trash");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting card {CardId}", card_id);
            return StatusCode(500, new ApiResponse<object>(false, null, "An unexpected error occurred while deleting the card."));
        }
    }

    [HttpGet("tarot-cards")]
    public async Task<IActionResult> GetAllTarotCards(CancellationToken ct)
    {
        try
        {
            var result = await cardService.GetAllTarotCardsAsync(ct);
            return this.ToActionResult(result, "Tarot cards retrieved successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching tarot cards");
            return StatusCode(500, new ApiResponse<object>(false, null, "Failed to fetch cards."));
        }
    }

    [HttpPatch("card/{card_id:guid}/image")]
    [Authorize(Roles = "SuperUser")]
    public async Task<IActionResult> UpdateCardImage(
        Guid card_id,
        IFormFile? file,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new ApiResponse<object>(false, null, "Image file is required."));

        try
        {
            await using var stream = file.OpenReadStream();
            var uploadRequest = new ImageUploadRequest(
                stream,
                $"card_{card_id}_{Path.GetFileName(file.FileName)}",
                file.ContentType,
                "/cards");

            var result = await cardService.UpdateCardImageAsync(card_id, uploadRequest, ct);
            return this.ToActionResult(result, "Card image updated successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload image for card {CardId}", card_id);
            return StatusCode(500, new ApiResponse<object>(false, null, "Failed to upload image to storage provider."));
        }
    }
}
