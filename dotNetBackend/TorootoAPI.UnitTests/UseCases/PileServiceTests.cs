using Mapster;
using MapsterMapper;
using Moq;
using TorootoAPI.Application;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Application.UseCases;
using TorootoAPI.Application.Validators;
using TorootoAPI.Domain.Common;
using TorootoAPI.Domain.Models;
using Xunit;

namespace TorootoAPI.UnitTests.UseCases;

public sealed class PileServiceTests
{
    private readonly Mock<IPileRepository> _pileRepo = new();
    private readonly Mock<ICardRepository> _cardRepo = new();
    private readonly Mock<ICacheService> _cacheService = new();
    private readonly IMapper _mapper;
    private readonly PileService _sut;

    public PileServiceTests()
    {
        var config = new TypeAdapterConfig();
        config.Scan(typeof(ApplicationServiceContainer).Assembly);
        _mapper = new Mapper(config);

        _sut = new PileService(
            _pileRepo.Object,
            _cardRepo.Object,
            _cacheService.Object,
            _mapper,
            new CreatePileRequestDtoValidator(),
            new SavePileRequestDtoValidator());
    }

    [Fact]
    public async Task DrawPileAsync_Uses_Cached_Deck_Does_Not_Mutate_Cached_Order_And_Invalidates_User_Piles()
    {
        var userId = Guid.NewGuid();
        var deckId = Guid.NewGuid();
        var cachedCards = Enumerable.Range(0, 10)
            .Select(i => new CardResponseDto(
                Guid.NewGuid(),
                deckId,
                $"Card {i}",
                "Major Arcana",
                new Dictionary<string, object> { ["meaning"] = $"Meaning {i}" },
                $"https://ik.imagekit.io/demo/card_{i}.jpg",
                false,
                null,
                i))
            .ToList();
        var originalOrderIds = cachedCards.Select(c => c.CardId).ToList();

        _cacheService
            .Setup(c => c.GetAsync<List<CardResponseDto>>("tarot_deck", It.IsAny<CancellationToken>()))
            .ReturnsAsync(cachedCards);

        _pileRepo
            .Setup(r => r.CreatePileAsync(It.IsAny<Pile>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pile p, CancellationToken _) => p);

        var result = await _sut.DrawPileAsync(userId, new CreatePileRequestDto(3, false));

        Assert.True(result.IsSuccess);
        Assert.NotEqual(Guid.Empty, result.Value.PileId);
        Assert.Equal(userId, result.Value.UserId);
        Assert.Equal(3, result.Value.PileContents.Count);
        Assert.Equal([0, 1, 2], result.Value.PileContents.Select(c => c.Position));
        Assert.Equal(3, result.Value.PileContents.Select(c => c.CardId).Distinct().Count());
        Assert.All(result.Value.PileContents, item =>
        {
            Assert.NotEqual(Guid.Empty, item.PileContentId);
            Assert.False(item.ReversedCard);
            Assert.False(string.IsNullOrEmpty(item.CardName));
            Assert.False(string.IsNullOrEmpty(item.ImageUrl));
        });

        Assert.Equal(originalOrderIds, cachedCards.Select(c => c.CardId));
        _pileRepo.Verify(r => r.GetAvailableTarotCardsAsync(It.IsAny<CancellationToken>()), Times.Never);
        _cacheService.Verify(c => c.RemoveByPatternAsync($"piles_user_{userId}_*", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DrawPileAsync_Populates_TarotDeck_Cache_On_Cache_Miss_And_Supports_Reversals()
    {
        var userId = Guid.NewGuid();
        var deckId = Guid.NewGuid();
        var domainCards = Enumerable.Range(0, 78)
            .Select(i => Card.Create(deckId, $"Arcana {i}", "Major", i, imageUrl: $"https://img/{i}.png"))
            .ToList();

        _cacheService
            .Setup(c => c.GetAsync<List<CardResponseDto>>("tarot_deck", It.IsAny<CancellationToken>()))
            .ReturnsAsync((List<CardResponseDto>?)null);

        _pileRepo
            .Setup(r => r.GetAvailableTarotCardsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(domainCards);

        _pileRepo
            .Setup(r => r.CreatePileAsync(It.IsAny<Pile>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pile p, CancellationToken _) => p);

        var result = await _sut.DrawPileAsync(userId, new CreatePileRequestDto(78, true));

        Assert.True(result.IsSuccess);
        Assert.Equal(78, result.Value.PileContents.Count);
        Assert.Equal(78, result.Value.PileContents.Select(c => c.CardId).Distinct().Count());
        Assert.Contains(result.Value.PileContents, c => c.ReversedCard);

        _cacheService.Verify(
            c => c.SetAsync(
                "tarot_deck",
                It.Is<List<CardResponseDto>>(list => list.Count == 78),
                TimeSpan.FromHours(12),
                null,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task DrawPileAsync_Returns_ValidationError_When_Count_Exceeds_Available_Or_Invalid()
    {
        var invalidResult = await _sut.DrawPileAsync(Guid.NewGuid(), new CreatePileRequestDto(0, false));
        Assert.True(invalidResult.IsFailure);
        Assert.Equal(ErrorType.Validation, invalidResult.Error.Type);

        _cacheService
            .Setup(c => c.GetAsync<List<CardResponseDto>>("tarot_deck", It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        _pileRepo
            .Setup(r => r.GetAvailableTarotCardsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var emptyDeckResult = await _sut.DrawPileAsync(Guid.NewGuid(), new CreatePileRequestDto(3, true));
        Assert.True(emptyDeckResult.IsFailure);
        Assert.Equal(ErrorType.Validation, emptyDeckResult.Error.Type);
    }

    [Fact]
    public async Task SaveFrontendPileAsync_Generates_Ids_Validates_Cards_Exist_And_Invalidates_Cache()
    {
        var userId = Guid.NewGuid();
        var card1 = Guid.NewGuid();
        var card2 = Guid.NewGuid();

        _cardRepo
            .Setup(r => r.AllCardsExistAsync(
                It.Is<IReadOnlyCollection<Guid>>(ids => ids.OrderBy(x => x).SequenceEqual(new[] { card1, card2 }.OrderBy(x => x))),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        Pile? capturedPile = null;
        _pileRepo
            .Setup(r => r.CreatePileAsync(It.IsAny<Pile>(), It.IsAny<CancellationToken>()))
            .Callback<Pile, CancellationToken>((p, _) => capturedPile = p)
            .ReturnsAsync((Pile p, CancellationToken _) => p);

        var request = new SavePileRequestDto(
        [
            new FeCardRequestDto(card1, false, 0),
            new FeCardRequestDto(card2, true, 1)
        ]);

        var result = await _sut.SaveFrontendPileAsync(userId, request);

        Assert.True(result.IsSuccess);
        Assert.NotEqual(Guid.Empty, result.Value.PileId);
        Assert.NotNull(capturedPile);
        Assert.Equal(result.Value.PileId, capturedPile!.PileId);
        Assert.All(capturedPile.PileContents, pc => Assert.NotEqual(Guid.Empty, pc.PileContentId));

        _cacheService.Verify(c => c.RemoveByPatternAsync($"piles_user_{userId}_*", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SaveFrontendPileAsync_Rejects_Unknown_CardIds()
    {
        _cardRepo
            .Setup(r => r.AllCardsExistAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await _sut.SaveFrontendPileAsync(
            Guid.NewGuid(),
            new SavePileRequestDto([new FeCardRequestDto(Guid.NewGuid(), false, 0)]));

        Assert.True(result.IsFailure);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
        _pileRepo.Verify(r => r.CreatePileAsync(It.IsAny<Pile>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task SoftDeletePileAsync_Enforces_User_Ownership_And_Invalidates_Cache()
    {
        var ownerId = Guid.NewGuid();
        var attackerId = Guid.NewGuid();
        var pile = Pile.Create(ownerId, DateTime.UtcNow, [(Guid.NewGuid(), 0, false)]);

        _pileRepo
            .Setup(r => r.SoftDeletePileAsync(pile.PileId, attackerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Pile?)null);

        var unauthorizedDelete = await _sut.SoftDeletePileAsync(pile.PileId, attackerId);
        Assert.True(unauthorizedDelete.IsFailure);
        Assert.Equal(ErrorType.NotFound, unauthorizedDelete.Error.Type);
        _cacheService.Verify(c => c.RemoveByPatternAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);

        pile.SoftDelete(DateTime.UtcNow);
        _pileRepo
            .Setup(r => r.SoftDeletePileAsync(pile.PileId, ownerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pile);

        var authorizedDelete = await _sut.SoftDeletePileAsync(pile.PileId, ownerId);
        Assert.True(authorizedDelete.IsSuccess);
        _cacheService.Verify(c => c.RemoveByPatternAsync($"piles_user_{ownerId}_*", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetUserPilesPagedAsync_Clamps_Invalid_Paging_And_Calculates_TotalPages()
    {
        var userId = Guid.NewGuid();
        var pile = Pile.Create(userId, DateTime.UtcNow, [(Guid.NewGuid(), 0, true)]);

        _cacheService
            .Setup(c => c.GetAsync<PagedResultDto<PileResponseDto>>($"piles_user_{userId}_page_1_size_5", It.IsAny<CancellationToken>()))
            .ReturnsAsync((PagedResultDto<PileResponseDto>?)null);

        _pileRepo
            .Setup(r => r.GetUserPilesPagedAsync(userId, 1, 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(([pile], 12));

        var result = await _sut.GetUserPilesPagedAsync(userId, page: -4, pageSize: 999);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.Page);
        Assert.Equal(5, result.Value.PageSize);
        Assert.Equal(12, result.Value.TotalCount);
        Assert.Equal(3, result.Value.TotalPages);
        Assert.Single(result.Value.Items);
    }
}
