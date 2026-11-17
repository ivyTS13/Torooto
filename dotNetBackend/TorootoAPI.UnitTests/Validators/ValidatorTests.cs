using TorootoAPI.Application.Auth;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.Validators;
using Xunit;

namespace TorootoAPI.UnitTests.Validators;

public sealed class ValidatorTests
{
    [Theory]
    [InlineData("", "password123", false)]
    [InlineData("not-an-email", "password123", false)]
    [InlineData("user@example.com", "12345", false)]
    [InlineData("user@example.com", "123456", true)]
    public void UserCreateDtoValidator_Validates_Email_And_Password_Length(string email, string password, bool expectedValid)
    {
        var validator = new UserCreateDtoValidator();
        var result = validator.Validate(new UserCreateDto(email, password, "Seeker", null, "Aries"));

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Theory]
    [InlineData("", "secret", false)]
    [InlineData("bad-email", "secret", false)]
    [InlineData("user@example.com", "", false)]
    [InlineData("user@example.com", "secret", true)]
    public void LoginRequestDtoValidator_Validates_Credentials_Contract(string email, string password, bool expectedValid)
    {
        var validator = new LoginRequestDtoValidator();
        var result = validator.Validate(new LoginRequestDto(email, password));

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Theory]
    [InlineData(0, false)]
    [InlineData(-3, false)]
    [InlineData(79, false)]
    [InlineData(1, true)]
    [InlineData(3, true)]
    [InlineData(78, true)]
    public void CreatePileRequestDtoValidator_Enforces_Tarot_Card_Count_Range(int count, bool expectedValid)
    {
        var validator = new CreatePileRequestDtoValidator();
        var result = validator.Validate(new CreatePileRequestDto(count, true));

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Fact]
    public void SavePileRequestDtoValidator_Rejects_Empty_Duplicates_And_Negative_Positions()
    {
        var validator = new SavePileRequestDtoValidator();

        Assert.False(validator.Validate(new SavePileRequestDto([])).IsValid);

        var duplicateId = Guid.NewGuid();
        var duplicateResult = validator.Validate(new SavePileRequestDto(
        [
            new FeCardRequestDto(duplicateId, false, 0),
            new FeCardRequestDto(duplicateId, true, 1)
        ]));
        Assert.False(duplicateResult.IsValid);

        var negativePositionResult = validator.Validate(new SavePileRequestDto(
        [
            new FeCardRequestDto(Guid.NewGuid(), false, -1)
        ]));
        Assert.False(negativePositionResult.IsValid);

        var emptyCardIdResult = validator.Validate(new SavePileRequestDto(
        [
            new FeCardRequestDto(Guid.Empty, false, 0)
        ]));
        Assert.False(emptyCardIdResult.IsValid);

        var validResult = validator.Validate(new SavePileRequestDto(
        [
            new FeCardRequestDto(Guid.NewGuid(), false, 0),
            new FeCardRequestDto(Guid.NewGuid(), true, 1)
        ]));
        Assert.True(validResult.IsValid);
    }

    [Fact]
    public void Deck_And_Card_Validators_Enforce_Required_Fields()
    {
        var deckValidator = new DeckCreateDtoValidator();
        Assert.False(deckValidator.Validate(new DeckCreateDto("", "tarot", "desc")).IsValid);
        Assert.False(deckValidator.Validate(new DeckCreateDto("Deck", "", "desc")).IsValid);
        Assert.True(deckValidator.Validate(new DeckCreateDto("Deck", "tarot", "desc")).IsValid);

        var cardValidator = new CardCreateDtoValidator();
        Assert.False(cardValidator.Validate(new CardCreateDto("", "Major", 0, null)).IsValid);
        Assert.False(cardValidator.Validate(new CardCreateDto("The Fool", "Major", -1, null)).IsValid);
        Assert.True(cardValidator.Validate(new CardCreateDto("The Fool", "Major", 0, null)).IsValid);
    }
}
