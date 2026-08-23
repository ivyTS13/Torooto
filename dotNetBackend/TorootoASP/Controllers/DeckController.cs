using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.RegularExpressions;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Domain.Models;

namespace TorootoASP.Controllers
{
    [EnableRateLimiting("StandardLimit")]
    [ApiController]
    [Route("decks")]
    public class DecksController : ControllerBase
    {
        private readonly IDeckRepository _deckRepository;
        private readonly ICardRepository _cardRepository;
        private readonly ICacheService _cacheService;
        private readonly ILogger<DecksController> _logger;

        public DecksController(
            IDeckRepository deckRepository,
            ICardRepository cardRepository,
            ILogger<DecksController> logger,
            ICacheService cacheService)
        {
            _deckRepository = deckRepository;
            _cardRepository = cardRepository;
            _logger = logger;
            _cacheService = cacheService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetDecks()
        {
            string cacheKey = "all_decks";
            
            var cachedDecks = await _cacheService.GetAsync<IEnumerable<Deck>>(cacheKey);

            if (cachedDecks != null) {
                return Ok(new { success = true, data = cachedDecks, message = "Decks retrieved from cache" });
            }
            var decks = await _deckRepository.GetAllDecksAsync();

            await _cacheService.SetAsync(cacheKey, decks, absoluteExpireTime: TimeSpan.FromHours(2));
            return Ok(new { success = true, data = decks, message = "Decks retrieved" });
        }

        [HttpPost("add")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> AddNewDeck([FromBody] DeckCreateDto deckIn)
        {
            try
            {
                var newDeck = deckIn.Adapt<Deck>();
                var createdDeck = await _deckRepository.CreateDeckAsync(newDeck);

                return Ok(new { success = true, data = createdDeck, message = "Added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating deck");
                return StatusCode(500, new { detail = "An unexpected error occurred while creating the deck." });
            }
        }

        [HttpDelete("{deck_id}")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> DeleteDeck(Guid deck_id)
        {
            try
            {
                string cacheKey = "all_decks";
                var deck = await _deckRepository.SoftDeleteDeckAsync(deck_id);
                if (deck == null) return NotFound(new { detail = "Deck not found" });
                    await _cacheService.RemoveByPatternAsync(cacheKey);
                return Ok(new { success = true, data = deck, message = "Deck moved to trash" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting deck");
                return StatusCode(500, new { detail = "An unexpected error occurred while deleting the deck." });
            }
        }

        [HttpPut("{deck_id}")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> UpdateDeck(Guid deck_id, [FromBody] DeckUpdateDto deckData)
        {
            try
            {
                 string cacheKey = "all_decks";
                // Note: You must retrieve the existing entity first to use Mapster's IgnoreNullValues effectively
                var existingDeck = await _deckRepository.GetDeckByIdAsync(deck_id);
                if (existingDeck == null) return NotFound(new { detail = "Deck not found" });

                deckData.Adapt(existingDeck);
                var updatedDeck = await _deckRepository.UpdateDeckAsync(existingDeck);
                 await _cacheService.RemoveByPatternAsync(cacheKey);
                return Ok(new { success = true, data = updatedDeck, message = "Deck updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating deck");
                return StatusCode(500, new { detail = "An unexpected error occurred while updating the deck." });
            }
        }

        [HttpPost("{deck_id}/restore")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> RestoreDeck(Guid deck_id)
        {
            try
            {
                var restoredDeck = await _deckRepository.RestoreDeckAsync(deck_id);
                if (restoredDeck == null)
                {
                    return Ok(new { success = false, data = "", message = $"Deck with ID {deck_id} not found." });
                }

                return Ok(new { success = true, data = restoredDeck, message = "Deck and all associated cards have been restored." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring deck");
                return StatusCode(500, new { detail = "An error occurred while trying to restore the deck." });
            }
        }

        [HttpGet("{deck_id}/cards")]
        public async Task<IActionResult> GetCards(Guid deck_id)
        {
            var cachee= $"deck_{deck_id}";

            var cacheDeck = await _cacheService.GetAsync<IEnumerable<Card>>(cachee);
            if(cacheDeck != null)
            {
                return Ok(new { success = true, data = cacheDeck, message = "Cards retrieved from cache" });
            }
            var cards = await _cardRepository.GetCardsByDeckIdAsync(deck_id);
            await _cacheService.SetAsync(cachee, cards, absoluteExpireTime: TimeSpan.FromHours(2));
            return Ok(new { success = true, data = cards, message = "Cards retrieved" });
        }

        [HttpPost("{deck_id}/upload-cards")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> UploadCardsRobust(Guid deck_id, IFormFile file)
        {
            var requiredHeaders = new HashSet<string> { "Card Number & Name", "suit", "image_url", "position" };
            var newCards = new List<Card>();
            var errors = new List<string>();

            try
            {
                using var reader = new StreamReader(file.OpenReadStream());
                var headerLine = await reader.ReadLineAsync();
                if (string.IsNullOrWhiteSpace(headerLine)) return BadRequest(new { detail = "File is empty." });

                // Simple split. Use CsvHelper in production for quotes handling.
                var headers = headerLine.Split(',').Select(h => h.Trim()).ToList();
                var missing = requiredHeaders.Except(headers).ToList();

                if (missing.Any())
                {
                    return BadRequest(new { detail = $"Invalid CSV structure. Missing columns: {string.Join(", ", missing)}" });
                }

                var extraHeaders = headers.Except(requiredHeaders).ToList();

                // Helper to clean headers to snake_case
                var headerToCleaned = extraHeaders.ToDictionary(
                    h => h,
                    h => Regex.Replace(h.Trim().ToLower(), @"[^a-z0-9]+", "_")
                );

                int lineNum = 2;
                while (!reader.EndOfStream)
                {
                    var line = await reader.ReadLineAsync();
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    var values = line.Split(',');
                    if (values.Length < headers.Count)
                    {
                        errors.Add($"Line {lineNum}: Row length mismatch");
                        lineNum++;
                        continue;
                    }

                    try
                    {
                        // Build dictionary mapping header name to row value
                        var rowDict = headers.Select((h, index) => new { Header = h, Value = values[index] })
                                             .ToDictionary(k => k.Header, v => v.Value);

                        // Build metadata from extra columns
                        var metadataDict = new Dictionary<string, object>();
                        foreach (var kvp in headerToCleaned)
                        {
                            if (rowDict.TryGetValue(kvp.Key, out var val))
                            {
                                metadataDict[kvp.Value] = val;
                            }
                        }

                        newCards.Add(new Card
                        {
                            DeckId = deck_id,
                            CardPosition = int.Parse(rowDict["position"]),
                            CardName = rowDict["Card Number & Name"],
                            CardSuit = rowDict["suit"],
                            ImageUrl = rowDict.ContainsKey("image_url") ? rowDict["image_url"] : null,
                            CardMetadata = metadataDict, // EF Core can map this to JSONB if configured
                            IsDeleted = false
                        });
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Line {lineNum}: Unexpected error ({ex.Message})");
                    }
                    lineNum++;
                }

                if (errors.Any())
                {
                    return Ok(new { success = false, message = "Some rows were invalid. No cards were saved.", errors });
                }

                if (newCards.Any())
                {
                    var insertedCards = await _cardRepository.CreateCardsBulkAsync(newCards);
                    return Ok(new { success = true, data = insertedCards, message = $"Successfully uploaded {newCards.Count} cards." });
                }

                return Ok(new { success = true, data = newCards, message = "No valid data found to upload." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed parsing CSV upload");
                return StatusCode(500, new { detail = "Internal server error processing file." });
            }
        }
    }
}