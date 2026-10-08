using MediatR;
using TodoApp.Features.Users.Common;

namespace TodoApp.Features.Users.UpdateCurrentUser
{
    public record UpdateCurrentUserCommand(
        string Name,
        string Email,
        string UserName,
        string Password
    ) : IRequest<UserDto>;
}
