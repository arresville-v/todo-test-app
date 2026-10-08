using MediatR;

namespace TodoApp.Features.Users.LoginUser
{
    public record LoginUserCommand(
        string UserName,
        string Password
    ) : IRequest<LoginUserResponse>;
}
