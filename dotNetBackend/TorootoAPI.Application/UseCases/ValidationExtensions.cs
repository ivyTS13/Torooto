using FluentValidation;
using TorootoAPI.Domain.Common;

namespace TorootoAPI.Application.UseCases;

internal static class ValidationExtensions
{
    public static async Task<DomainError?> ValidateToErrorAsync<T>(
        this IValidator<T> validator,
        T instance,
        CancellationToken ct)
    {
        var result = await validator.ValidateAsync(instance, ct);
        if (result.IsValid)
            return null;

        var message = string.Join("; ", result.Errors.Select(e => e.ErrorMessage));
        return DomainError.Validation(message);
    }
}
