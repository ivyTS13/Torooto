using Mapster;
using TorootoAPI.Domain.Models;
using TorootoAPI.Application.DTOs.Decks;

namespace TorootoAPI.Application.Mappings
{
    public class MapsterConfiguration : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Deck Mappings
            config.NewConfig<DeckCreateDto, Deck>();
            config.NewConfig<DeckUpdateDto, Deck>()
                  .IgnoreNullValues(true);

            // Card Mappings (from previous steps)
            config.NewConfig<CardCreateDto, Card>();
            config.NewConfig<CardUpdateDto, Card>()
                  .IgnoreNullValues(true);
        }
    }
}