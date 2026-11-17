using Mapster;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Mappings;

public sealed class DeckMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Deck, DeckResponseDto>();
        config.NewConfig<Card, CardResponseDto>();
    }
}
