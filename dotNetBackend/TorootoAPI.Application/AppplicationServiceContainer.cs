

using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace TorootoAPI.Application
{
    public static class AppplicationServiceContainer
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Scan assembly and apply all IRegister configurations
            var config = TypeAdapterConfig.GlobalSettings;
            config.Scan(Assembly.GetExecutingAssembly());

            services.AddSingleton(config);
            services.AddScoped<IMapper, ServiceMapper>();

            return services;
        }
    }
}
