using Mapster;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Mappings;

public sealed class PileMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Pile, PileResponseDto>()
            .Map(dest => dest.DrawnAt, src => src.DrawnAt ?? DateTime.MinValue)
            .Map(dest => dest.IsDeleted, src => src.IsDeleted ?? false)
            .Map(dest => dest.PileContents, src => src.PileContents.OrderBy(pc => pc.Position));

        config.NewConfig<Pile, PileDetailResponseDto>()
            .Map(dest => dest.DrawnAt, src => src.DrawnAt ?? DateTime.MinValue)
            .Map(dest => dest.IsDeleted, src => src.IsDeleted ?? false)
            .Map(dest => dest.Cards, src => src.PileContents.OrderBy(pc => pc.Position));

        config.NewConfig<PileContent, PileContentResponseDto>()
            .Map(dest => dest.PileContentId, src => src.PileContentId)
            .Map(dest => dest.CardId, src => src.CardId)
            .Map(dest => dest.ReversedCard, src => src.ReversedCard)
            .Map(dest => dest.Position, src => src.Position)
            .Map(dest => dest.CardName, src => src.Card != null ? src.Card.CardName : string.Empty)
            .Map(dest => dest.CardSuit, src => src.Card != null ? src.Card.CardSuit : string.Empty)
            .Map(dest => dest.ImageUrl, src => src.Card != null ? src.Card.ImageUrl : null)
            .Map(dest => dest.CardMetadata, src => src.Card != null ? src.Card.CardMetadata : null);
    }
}
