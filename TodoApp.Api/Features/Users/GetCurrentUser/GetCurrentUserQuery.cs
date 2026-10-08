using MediatR;
using TodoApp.Features.Users.Common;

namespace TodoApp.Features.Users.GetCurrentUser
{
    /// <summary>Request for the authenticated user's profile.</summary>
    public record GetCurrentUserQuery : IRequest<UserDto?>;
}
