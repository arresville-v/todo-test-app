using MediatR;
using TodoApp.Features.Users.Common;

namespace TodoApp.Features.Users.RegisterUser
{
    public record RegisterUserCommand(
        string Name,
        string Email,
        string UserName,
        string Password
    ) : IRequest<UserDto>;
}
