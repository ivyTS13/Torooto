using Mapster;
using TorootoAPI.Application.Auth;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Mappings;

public sealed class UserMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<User, UserReadDto>();
    }
}
