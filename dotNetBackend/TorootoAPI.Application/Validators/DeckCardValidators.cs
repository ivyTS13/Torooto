using FluentValidation;
using TorootoAPI.Application.DTOs.Decks;

namespace TorootoAPI.Application.Validators;

public sealed class DeckCreateDtoValidator : AbstractValidator<DeckCreateDto>
{
    public DeckCreateDtoValidator()
    {
        RuleFor(x => x.DeckName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.DeckType).NotEmpty().MaximumLength(60);
        RuleFor(x => x.DeckContent).NotNull();
    }
}

public sealed class DeckUpdateDtoValidator : AbstractValidator<DeckUpdateDto>
{
    public DeckUpdateDtoValidator()
    {
        RuleFor(x => x.DeckName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.DeckContent).NotNull();
    }
}

public sealed class CardCreateDtoValidator : AbstractValidator<CardCreateDto>
{
    public CardCreateDtoValidator()
    {
        RuleFor(x => x.CardName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.CardSuit).NotEmpty().MaximumLength(80);
        RuleFor(x => x.CardPosition).GreaterThanOrEqualTo(0);
    }
}

public sealed class CardUpdateDtoValidator : AbstractValidator<CardUpdateDto>
{
    public CardUpdateDtoValidator()
    {
        RuleFor(x => x.CardName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.CardSuit).NotEmpty().MaximumLength(80);
        RuleFor(x => x.CardPosition).GreaterThanOrEqualTo(0).When(x => x.CardPosition.HasValue);
    }
}
