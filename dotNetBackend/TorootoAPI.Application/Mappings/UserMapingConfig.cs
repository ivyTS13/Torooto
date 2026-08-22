using Mapster;
using TorootoAPI.Application.Auth;
using TorootoAPI.Domain.Models;

namespace TorootoAPI.Application.Mappings
{
    public class UserMapingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<User, UserReadDto>();

            // Password hashing happens in the repository/service, not in the mapper
            config.NewConfig<UserCreateDto, User>();

            config.NewConfig<UserUpdateDto, User>()
                  .IgnoreNullValues(true);
        }
    }
}
