using FluentValidation;
using TorootoAPI.Application.DTOs.Piles;

namespace TorootoAPI.Application.Validators;

public sealed class CreatePileRequestDtoValidator : AbstractValidator<CreatePileRequestDto>
{
    public CreatePileRequestDtoValidator()
    {
        RuleFor(x => x.NumberOfCards).InclusiveBetween(1, 78);
    }
}

public sealed class SavePileRequestDtoValidator : AbstractValidator<SavePileRequestDto>
{
    public SavePileRequestDtoValidator()
    {
        RuleFor(x => x.Cards)
            .NotEmpty().WithMessage("At least one card must be provided.");

        RuleFor(x => x.Cards)
            .Must(cards => cards.Select(c => c.CardId).Distinct().Count() == cards.Count)
            .When(x => x.Cards is { Count: > 0 })
            .WithMessage("Duplicate cards are not allowed in a single pile.");

        RuleForEach(x => x.Cards).ChildRules(card =>
        {
            card.RuleFor(c => c.CardId).NotEmpty();
            card.RuleFor(c => c.Position).GreaterThanOrEqualTo(0);
        });
    }
}
