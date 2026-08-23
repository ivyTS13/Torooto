using Mapster;
using TorootoAPI.Application.Auth;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Mappings
{
    public class MappingConfig: IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // 1. User Entity -> UserReadDto
            // (If property names match exactly, Mapster handles them automatically)
            config.NewConfig<User, UserReadDto>();

            // 2. UserCreateDto -> User Entity
            config.NewConfig<UserCreateDto, User>()
                .Map(dest => dest.HashedPassword, src => src.Password); // Custom property mapping

            // 3. Custom Mappings for Nested or Renamed Fields (e.g., Card -> PileContentResponseDto)
            config.NewConfig<Card, PileContentResponseDto>()
                .Map(dest => dest.CardId, src => src.CardId)
                .Map(dest => dest.CardName, src => src.CardName)
                .Map(dest => dest.CardSuit, src => src.CardSuit);
        }
    }
}
