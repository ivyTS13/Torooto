using FluentValidation;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using TorootoAPI.Application.Auth;
using TorootoAPI.Application.DTOs.Decks;
using TorootoAPI.Application.DTOs.Piles;
using TorootoAPI.Application.UseCases;
using TorootoAPI.Application.Validators;

namespace TorootoAPI.Application;

public static class ApplicationServiceContainer
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var config = new TypeAdapterConfig();
        config.Scan(Assembly.GetExecutingAssembly());

        services.AddSingleton(config);
        services.AddScoped<IMapper, ServiceMapper>();

        // Validators
        services.AddScoped<IValidator<UserCreateDto>, UserCreateDtoValidator>();
        services.AddScoped<IValidator<LoginRequestDto>, LoginRequestDtoValidator>();
        services.AddScoped<IValidator<UserUpdateDto>, UserUpdateDtoValidator>();
        services.AddScoped<IValidator<DeckCreateDto>, DeckCreateDtoValidator>();
        services.AddScoped<IValidator<DeckUpdateDto>, DeckUpdateDtoValidator>();
        services.AddScoped<IValidator<CardCreateDto>, CardCreateDtoValidator>();
        services.AddScoped<IValidator<CardUpdateDto>, CardUpdateDtoValidator>();
        services.AddScoped<IValidator<CreatePileRequestDto>, CreatePileRequestDtoValidator>();
        services.AddScoped<IValidator<SavePileRequestDto>, SavePileRequestDtoValidator>();

        // Use Case Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICardService, CardService>();
        services.AddScoped<IDeckService, DeckService>();
        services.AddScoped<IPileService, PileService>();

        return services;
    }
}
