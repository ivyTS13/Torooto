using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using NetArchTest.Rules;
using TorootoAPI.Application;
using TorootoAPI.Application.Interfaces;
using TorootoAPI.Application.UseCases;
using TorootoAPI.Domain.Models;
using TorootoAPI.Infrastucture.Models;
using TorootoASP.Controllers;
using Xunit;

namespace TorootoAPI.ArchitectureTests;

public sealed class CleanArchitectureTests
{
    private static readonly Assembly DomainAssembly = typeof(Card).Assembly;
    private static readonly Assembly ApplicationAssembly = typeof(ApplicationServiceContainer).Assembly;
    private static readonly Assembly InfrastructureAssembly = typeof(TorootoDBContext).Assembly;
    private static readonly Assembly PresentationAssembly = typeof(CardsController).Assembly;

    [Fact]
    public void Domain_Should_Not_Depend_On_Outer_Layers_Or_Frameworks()
    {
        var result = Types.InAssembly(DomainAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "TorootoAPI.Application",
                "TorootoAPI.Infrastucture",
                "TorootoASP",
                "Microsoft.EntityFrameworkCore",
                "Microsoft.AspNetCore",
                "FluentValidation",
                "Mapster",
                "Npgsql",
                "StackExchange.Redis")
            .GetResult();

        AssertSuccess(result, "Domain must remain pure with zero outer-layer or framework dependencies.");

        var nonSystemReferences = DomainAssembly
            .GetReferencedAssemblies()
            .Select(a => a.Name!)
            .Where(name => !name.StartsWith("System.", StringComparison.Ordinal) &&
                           name is not "mscorlib" and not "netstandard")
            .ToList();

        Assert.Empty(nonSystemReferences);
    }

    [Fact]
    public void Domain_Models_Should_Not_Contain_Persistence_Or_Json_Attributes()
    {
        var forbiddenAttributes = new[]
        {
            typeof(TableAttribute),
            typeof(ColumnAttribute),
            typeof(KeyAttribute),
            typeof(ForeignKeyAttribute),
            typeof(InversePropertyAttribute),
            typeof(JsonIgnoreAttribute),
            typeof(JsonPropertyNameAttribute)
        };

        var modelTypes = DomainAssembly.GetTypes()
            .Where(t => t.Namespace == "TorootoAPI.Domain.Models")
            .ToList();

        Assert.NotEmpty(modelTypes);

        foreach (var type in modelTypes)
        {
            foreach (var attr in forbiddenAttributes)
            {
                Assert.False(
                    type.IsDefined(attr, inherit: false),
                    $"{type.Name} must not be decorated with {attr.Name}.");

                foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance))
                {
                    Assert.False(
                        prop.IsDefined(attr, inherit: false),
                        $"{type.Name}.{prop.Name} must not be decorated with {attr.Name}.");
                }
            }
        }
    }

    [Fact]
    public void Application_Should_Only_Depend_On_Domain_And_Not_Infrastructure_Or_Http()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "TorootoAPI.Infrastucture",
                "TorootoASP",
                "Microsoft.EntityFrameworkCore",
                "Microsoft.AspNetCore.Http",
                "Microsoft.AspNetCore.Mvc",
                "Npgsql",
                "StackExchange.Redis",
                "Imagekit",
                "Isopoh.Cryptography.Argon2")
            .GetResult();

        AssertSuccess(result, "Application must never depend on Infrastructure, EF Core, ASP.NET Core HTTP, or TorootoASP.");

        var referencedAssemblies = ApplicationAssembly
            .GetReferencedAssemblies()
            .Select(a => a.Name!)
            .ToHashSet(StringComparer.Ordinal);

        Assert.Contains("TorootoAPI.Domain", referencedAssemblies);
        Assert.DoesNotContain("TorootoAPI.Infrastucture", referencedAssemblies);
        Assert.DoesNotContain("Microsoft.EntityFrameworkCore", referencedAssemblies);
        Assert.DoesNotContain("Microsoft.AspNetCore.Http.Abstractions", referencedAssemblies);
    }

    [Fact]
    public void Infrastructure_Should_Not_Depend_On_Presentation_Or_Http_Cors_RateLimiting()
    {
        var result = Types.InAssembly(InfrastructureAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "TorootoASP",
                "Microsoft.AspNetCore.Cors",
                "Microsoft.AspNetCore.RateLimiting")
            .GetResult();

        AssertSuccess(result, "Infrastructure must not depend on Presentation or ASP.NET HTTP pipeline policies.");
    }

    [Fact]
    public void Controllers_Should_Not_Depend_On_DbContext_Infrastructure_Or_Domain_Models()
    {
        var result = Types.InAssembly(PresentationAssembly)
            .That()
            .Inherit(typeof(ControllerBase))
            .ShouldNot()
            .HaveDependencyOnAny(
                "TorootoAPI.Domain.Models",
                "TorootoAPI.Infrastucture",
                "TorootoAPI.Infrastucture.Models",
                "TorootoAPI.Infrastucture.Repositories",
                "TorootoAPI.Infrastucture.Services",
                "Microsoft.EntityFrameworkCore")
            .GetResult();

        AssertSuccess(result, "Controllers must remain thin and communicate only through Application abstractions and DTOs.");
    }

    [Fact]
    public void Controllers_Should_Not_Expose_Domain_Models_In_Action_Signatures()
    {
        var controllerTypes = PresentationAssembly.GetTypes()
            .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract)
            .ToList();

        Assert.NotEmpty(controllerTypes);

        foreach (var controller in controllerTypes)
        {
            var actions = controller.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);
            foreach (var action in actions)
            {
                Assert.False(
                    ReferencesDomainModelType(action.ReturnType),
                    $"{controller.Name}.{action.Name} return type must not reference Domain models.");

                foreach (var param in action.GetParameters())
                {
                    Assert.False(
                        ReferencesDomainModelType(param.ParameterType),
                        $"{controller.Name}.{action.Name} parameter '{param.Name}' must not accept Domain models.");
                }
            }
        }
    }

    [Fact]
    public void Async_Application_Interfaces_And_Controller_Actions_Should_Accept_CancellationToken()
    {
        var appInterfaces = ApplicationAssembly.GetTypes()
            .Where(t => t.IsInterface &&
                        (t.Namespace == typeof(ICardRepository).Namespace ||
                         t.Namespace == typeof(ICardService).Namespace))
            .ToList();

        Assert.NotEmpty(appInterfaces);

        foreach (var iface in appInterfaces)
        {
            foreach (var method in iface.GetMethods())
            {
                if (typeof(Task).IsAssignableFrom(method.ReturnType))
                {
                    Assert.Contains(
                        method.GetParameters(),
                        p => p.ParameterType == typeof(CancellationToken));
                }
            }
        }

        var controllerTypes = PresentationAssembly.GetTypes()
            .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract);

        foreach (var controller in controllerTypes)
        {
            var asyncActions = controller.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Where(m => typeof(Task).IsAssignableFrom(m.ReturnType));

            foreach (var action in asyncActions)
            {
                Assert.Contains(
                    action.GetParameters(),
                    p => p.ParameterType == typeof(CancellationToken));
            }
        }
    }

    private static bool ReferencesDomainModelType(Type type)
    {
        if (type.Namespace == "TorootoAPI.Domain.Models")
            return true;

        return type.IsGenericType && type.GetGenericArguments().Any(ReferencesDomainModelType);
    }

    private static void AssertSuccess(TestResult result, string reason)
    {
        var failing = result.FailingTypeNames is { } names ? string.Join(", ", names) : "none";
        Assert.True(result.IsSuccessful, $"{reason} Failing types: {failing}");
    }
}
