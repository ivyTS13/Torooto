using Mapster;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Mappings
{
    public class PileMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Pile, PileResponseDto>()
                .Map(dest => dest.PileContents, src => src.PileContents); // Maps the relationship

            config.NewConfig<Pile, PileDetailResponseDto>()
               .Map(dest => dest.Cards, src => src.PileContents);
            // Flatten PileContent and its nested Card into PileContentResponseDto
            config.NewConfig<PileContent, PileContentResponseDto>()
                .Map(dest => dest.CardId, src => src.CardId)
                .Map(dest => dest.ReversedCard, src => src.ReversedCard)
                .Map(dest => dest.Position, src => src.Position)
                // Pull data from the navigated Card object
                .Map(dest => dest.CardName, src => src.Card!.CardName)
                .Map(dest => dest.CardSuit, src => src.Card!.CardSuit)
                .Map(dest => dest.ImageUrl, src => src.Card!.ImageUrl)
                .Map(dest => dest.CardMetadata, src => src.Card!.CardMetadata);
        }
    }
}