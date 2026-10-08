using MediatR;
using Microsoft.EntityFrameworkCore;
using TodoApp.Common.Exceptions;
using TodoApp.Data;
using TodoApp.Features.Users.Common;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Users.UpdateCurrentUser
{
    public static class UpdateCurrentUserHandler
    {
        public class Handler : IRequestHandler<UpdateCurrentUserCommand, UserDto>
        {
            private readonly TodoDbContext _db;
            private readonly IUserContext _userContext;

            public Handler(TodoDbContext db, IUserContext userContext)
            {
                _db = db;
                _userContext = userContext;
            }

            public async Task<UserDto> Handle(UpdateCurrentUserCommand request, CancellationToken cancellationToken)
            {
                var name = request.Name.Trim();
                var email = request.Email.Trim();
                var userName = request.UserName.Trim();
                if (name.Length == 0 || email.Length == 0 || userName.Length == 0)
                {
                    throw new BadRequestException("Name, email, and username are required.");
                }

                var userId = _userContext.GetUserId();
                var user = await _db.Users.FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);
                if (user is null)
                {
                    throw new NotFoundException("User not found.");
                }

                var duplicate = await _db.Users.AnyAsync(
                    candidate => candidate.UserId != userId &&
                        (candidate.Email == email || candidate.UserName == userName),
                    cancellationToken);
                if (duplicate)
                {
                    throw new BadRequestException("That email or username is already in use.");
                }

                user.Name = name;
                user.Email = email;
                user.UserName = userName;
                user.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(cancellationToken);

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

