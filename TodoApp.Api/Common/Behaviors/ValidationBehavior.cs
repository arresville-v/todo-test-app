using FluentValidation;
using MediatR;
using TodoApp.Common.Exceptions;

namespace TodoApp.Common.Behaviors
{
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            if (_validators.Any())
            {
                var context = new ValidationContext<TRequest>(request);

                var validationResults = await Task.WhenAll(
                    _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

                var errors = validationResults
                    .SelectMany(result => result.Errors)
                    .Where(failure => failure is not null)
                    .Select(failure => failure.ErrorMessage)
                    .Distinct()
                    .ToList();

                if (errors.Count > 0)
                {
                    throw new BadRequestException(string.Join(" ", errors));
                }
            }

            return await next();
        }
    }
}
