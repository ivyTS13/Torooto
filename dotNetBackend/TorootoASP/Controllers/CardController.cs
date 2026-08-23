using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;

namespace TorootoASP.Controllers
{
    [EnableRateLimiting("StandardLimit")]
    [ApiController]
    [Route("decks/")]
    public class CardsController : ControllerBase
    {
        private readonly ICardRepository _cardRepository;
        private readonly ILogger<CardsController> _logger;
        private readonly IImageStorageService _imageStorageService;
        private readonly ICacheService _cacheService;

        // Injected IImageStorageService instead of the raw ImageKitClient
        public CardsController(
            ICardRepository cardRepository,
            ILogger<CardsController> logger,
            IImageStorageService imageStorageService,
            ICacheService cacheService)
        {
            _cardRepository = cardRepository;
            _logger = logger;
            _imageStorageService = imageStorageService;
            _cacheService = cacheService;
        }

        [HttpPut("card/{card_id}")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> UpdateCard(Guid card_id, [FromBody] CardUpdateDto cardData)
        {
            try
            {
                var card = await _cardRepository.GetCardByIdAsync(card_id);
                if (card == null) return NotFound(new { success = false, message = "Card not found" });

                cardData.Adapt(card);

                var updatedCard = await _cardRepository.UpdateCardAsync(card);
                return Ok(new { success = true, data = updatedCard, message = "Card updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating card {card_id}", card_id);
                return StatusCode(500, new { success = false, message = "An error occurred while updating the card" });
            }
        }

        [HttpPost("{deck_id}/cards")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> AddCard(Guid deckId, [FromBody] CardCreateDto cardData)
        {
            try
            {
                var newCard = cardData.Adapt<Card>();

                newCard.DeckId = deckId;
                newCard.IsDeleted = false;

                var createdCard = await _cardRepository.CreateCardAsync(newCard);
                return Ok(new { success = true, data = createdCard, message = "Card manifested successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating card");
                return StatusCode(500, new { success = false, message = "Failed to create card" });
            }
        }

        [HttpDelete("card/{card_id}")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> DeleteCard(Guid card_id)
        {
            try
            {
                var card = await _cardRepository.SoftDeleteCardAsync(card_id);
                if (card == null) return NotFound(new { success = false, message = "Card not found" });

                return Ok(new { success = true, data = card, message = "Card moved to trash" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting card");
                return StatusCode(500, new { success = false, message = "An unexpected error occurred while deleting the card." });
            }
        }

        [HttpGet("tarot-cards")]
        public async Task<IActionResult> GetAllTarotCards()
        {
            try
            {
                var cacheKey ="tarot_deck";
                var cachedTarot = await _cacheService.GetAsync<IEnumerable<Card>>(cacheKey);
                if (cachedTarot != null)
                {
                    return Ok(new { success = true, data = cachedTarot, message = "Tarot cards retrieved successfully from cache" });
                }
                var cards = await _cardRepository.GetAllTarotCardsAsync();
                if (!cards.Any()) return NotFound(new { success = false, message = "Tarot deck not found" });

                await _cacheService.SetAsync(cacheKey, cards, absoluteExpireTime: TimeSpan.FromHours(2));
                return Ok(new { success = true, data = cards, message = "Tarot cards retrieved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tarot cards");
                return StatusCode(500, new { success = false, message = "Failed to fetch cards" });
            }
        }

        [HttpPatch("card/{card_id}/image")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> UpdateCardImage(Guid card_id, IFormFile file)
        {
            try
            {
                var card = await _cardRepository.GetCardByIdAsync(card_id);
                if (card == null) return NotFound(new { success = false, message = "Card not found" });

                // Define upload arguments
                var fileName = $"card_{card_id}_{file.FileName}";
                var folder = "/cards";
                var tags = new List<string> { "back-end-upload", $"deck_{card.DeckId}" };

                // Pass the stream processing down to the Storage Service
                var imageUrl = await _imageStorageService.UploadImageAsync(file, fileName, folder, tags);

                // Update database
                card.ImageUrl = imageUrl;
                await _cardRepository.UpdateCardAsync(card);

                return Ok(new { success = true, data = card, message = "Card image updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload image");
                return StatusCode(500, new { success = false, message = "Failed to upload image to storage provider." });
            }
        }
    }
}