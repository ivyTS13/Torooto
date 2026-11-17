using Mapster;
using MapsterMapper;
using Moq;
using TorootoAPI.Application;
using TorootoAPI.Application.Auth;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Application.UseCases;
using TorootoAPI.Application.Validators;
using TorootoAPI.Domain.Common;
using TorootoAPI.Domain.Models;
using Xunit;

namespace TorootoAPI.UnitTests.UseCases;

public sealed class DeckCardAndAuthServiceTests
{
    private readonly IMapper _mapper;

    public DeckCardAndAuthServiceTests()
    {
        var config = new TypeAdapterConfig();
        config.Scan(typeof(ApplicationServiceContainer).Assembly);
        _mapper = new Mapper(config);
    }

    [Fact]
    public async Task CardService_Mutations_Invalidate_TarotDeck_And_Deck_Cache()
    {
        var deckRepo = new Mock<IDeckRepository>();
        var cardRepo = new Mock<ICardRepository>();
        var storage = new Mock<IImageStorageService>();
        var cache = new Mock<ICacheService>();

        var sut = new CardService(
            cardRepo.Object,
            deckRepo.Object,
            storage.Object,
            cache.Object,
            _mapper,
            new CardCreateDtoValidator(),
            new CardUpdateDtoValidator());

        var deck = Deck.Create("Thoth", "tarot", "Crowley", DateTime.UtcNow);
        deckRepo.Setup(r => r.GetDeckByIdAsync(deck.DeckId, It.IsAny<CancellationToken>())).ReturnsAsync(deck);
        cardRepo.Setup(r => r.CreateCardAsync(It.IsAny<Card>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Card c, CancellationToken _) => c);

        var addResult = await sut.AddCardAsync(deck.DeckId, new CardCreateDto("0 - The Fool", "Major", 0, null));
        Assert.True(addResult.IsSuccess);
        cache.Verify(c => c.RemoveAsync("tarot_deck", It.IsAny<CancellationToken>()), Times.Once);
        cache.Verify(c => c.RemoveAsync($"deck_{deck.DeckId}", It.IsAny<CancellationToken>()), Times.Once);

        var card = Card.Create(deck.DeckId, "0 - The Fool", "Major", 0);
        cardRepo.Setup(r => r.GetCardByIdAsync(card.CardId, It.IsAny<CancellationToken>())).ReturnsAsync(card);
        storage.Setup(s => s.UploadImageAsync(It.IsAny<ImageUploadRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("https://ik.imagekit.io/torooto/fool.jpg");
        cardRepo.Setup(r => r.UpdateCardAsync(card, It.IsAny<CancellationToken>())).ReturnsAsync(card);

        await using var ms = new MemoryStream([1, 2, 3]);
        var imgResult = await sut.UpdateCardImageAsync(card.CardId, new ImageUploadRequest(ms, "fool.png", "image/png", "/cards"));
        Assert.True(imgResult.IsSuccess);
        Assert.Equal("https://ik.imagekit.io/torooto/fool.jpg", imgResult.Value.ImageUrl);
        cache.Verify(c => c.RemoveAsync("tarot_deck", It.IsAny<CancellationToken>()), Times.Exactly(2));
        cache.Verify(c => c.RemoveAsync($"deck_{deck.DeckId}", It.IsAny<CancellationToken>()), Times.Exactly(2));
    }

    [Fact]
    public async Task DeckService_CsvUpload_Handles_ParseErrors_And_Invalidates_All_Deck_Caches()
    {
        var deckRepo = new Mock<IDeckRepository>();
        var cardRepo = new Mock<ICardRepository>();
        var csvParser = new Mock<ICsvCardParser>();
        var cache = new Mock<ICacheService>();

        var sut = new DeckService(
            deckRepo.Object,
            cardRepo.Object,
            csvParser.Object,
            cache.Object,
            _mapper,
            new DeckCreateDtoValidator(),
            new DeckUpdateDtoValidator());

        var deck = Deck.Create("RWS", "tarot", "Standard", DateTime.UtcNow);
        deckRepo.Setup(r => r.GetDeckByIdAsync(deck.DeckId, It.IsAny<CancellationToken>())).ReturnsAsync(deck);

        csvParser.Setup(p => p.ParseAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CsvParseResult([], ["Line 2: Invalid position 'abc'"]));

        await using var badStream = new MemoryStream();
        var failedResult = await sut.UploadCardsFromCsvAsync(deck.DeckId, badStream);
        Assert.True(failedResult.IsFailure);
        Assert.Equal(ErrorType.Validation, failedResult.Error.Type);

        csvParser.Setup(p => p.ParseAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CsvParseResult(
                [new ParsedCardRow("The Star", "Major", 17, "https://img/star.jpg", new Dictionary<string, object>())],
                []));
        cardRepo.Setup(r => r.CreateCardsBulkAsync(It.IsAny<IEnumerable<Card>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IEnumerable<Card> cards, CancellationToken _) => cards.ToList());

        await using var okStream = new MemoryStream();
        var okResult = await sut.UploadCardsFromCsvAsync(deck.DeckId, okStream);

        Assert.True(okResult.IsSuccess);
        Assert.Single(okResult.Value);
        Assert.NotEqual(Guid.Empty, okResult.Value[0].CardId);
        cache.Verify(c => c.RemoveAsync("all_decks", It.IsAny<CancellationToken>()), Times.Once);
        cache.Verify(c => c.RemoveAsync("tarot_deck", It.IsAny<CancellationToken>()), Times.Once);
        cache.Verify(c => c.RemoveAsync($"deck_{deck.DeckId}", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AuthService_Handles_Duplicate_Email_Bad_Password_And_IDOR_Image_Upload()
    {
        var userRepo = new Mock<IUserRepository>();
        var hasher = new Mock<IPasswordHasher>();
        var tokenService = new Mock<ITokenService>();
        var storage = new Mock<IImageStorageService>();

        var sut = new AuthService(
            userRepo.Object,
            hasher.Object,
            tokenService.Object,
            storage.Object,
            _mapper,
            new UserCreateDtoValidator(),
            new LoginRequestDtoValidator(),
            new UserUpdateDtoValidator());

        var existingUser = User.Create("seeker@example.com", "hashed", "Seeker", null, null);
        userRepo.Setup(r => r.GetUserByEmailAsync("seeker@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        var duplicateRegister = await sut.RegisterAsync(new UserCreateDto("seeker@example.com", "secret123", "Seeker", null, null));
        Assert.True(duplicateRegister.IsFailure);
        Assert.Equal(ErrorType.Conflict, duplicateRegister.Error.Type);

        hasher.Setup(h => h.Verify("hashed", "wrong")).Returns(false);
        var failedLogin = await sut.LoginAsync(new LoginRequestDto("seeker@example.com", "wrong"));
        Assert.True(failedLogin.IsFailure);
        Assert.Equal(ErrorType.Unauthorized, failedLogin.Error.Type);

        hasher.Setup(h => h.Verify("hashed", "right123")).Returns(true);
        tokenService.Setup(t => t.GenerateJwtToken(existingUser)).Returns("jwt.token.value");
        var successLogin = await sut.LoginAsync(new LoginRequestDto("seeker@example.com", "right123"));
        Assert.True(successLogin.IsSuccess);
        Assert.Equal("jwt.token.value", successLogin.Value.AccessToken);
        Assert.Equal("bearer", successLogin.Value.TokenType);

        await using var ms = new MemoryStream([1]);
        var forbiddenImage = await sut.UpdateUserImageAsync(
            existingUser.Id,
            Guid.NewGuid(),
            new ImageUploadRequest(ms, "avatar.png", "image/png", "/users"));

        Assert.True(forbiddenImage.IsFailure);
        Assert.Equal(ErrorType.Forbidden, forbiddenImage.Error.Type);
        storage.Verify(s => s.UploadImageAsync(It.IsAny<ImageUploadRequest>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
