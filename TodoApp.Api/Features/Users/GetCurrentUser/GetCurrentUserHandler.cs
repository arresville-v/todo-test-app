using MediatR;
using Microsoft.EntityFrameworkCore;
using TodoApp.Data;
using TodoApp.Features.Users.Common;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Users.GetCurrentUser
{
    public static class GetCurrentUserHandler
    {
        public class Handler : IRequestHandler<GetCurrentUserQuery, UserDto?>
        {
            private readonly TodoDbContext _db;
            private readonly IUserContext _userContext;

            public Handler(TodoDbContext db, IUserContext userContext)
            {
                _db = db;
                _userContext = userContext;
            }

            public async Task<UserDto?> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
            {
                var userId = _userContext.GetUserId();

                var user = await _db.Users.AsNoTracking()
                    .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

                if (user is null)
                {
                    return null;
                }

                return new UserDto
                {
                    UserId = user.UserId.ToString(),
                    Name = user.Name,
                    Email = user.Email,
                    UserName = user.UserName,
                    CreatedAt = user.CreatedAt
                };
            }
        }
    }
}
