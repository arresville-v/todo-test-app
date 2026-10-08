using MediatR;
using TodoApp.Common.Exceptions;
using TodoApp.Data;
using TodoApp.Features.Users.Common;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Users.RegisterUser
{
    public static class RegisterUserHandler
    {
        public class Handler : IRequestHandler<RegisterUserCommand, UserDto>
        {
            private readonly TodoDbContext _db;

            public Handler(TodoDbContext db)
            {
                _db = db;
            }

            public async Task<UserDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
            {
                // Check if user already exists
                var existingUser = _db.Users.FirstOrDefault(u => u.Email == request.Email || u.UserName == request.UserName);
                if (existingUser != null)
                {
                    throw new BadRequestException("User with that email or username already exists.");
                }

                var user = new User
                {
                    UserId = Guid.NewGuid(),
                    Name = request.Name,
                    Email = request.Email,
                    UserName = request.UserName,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.Users.Add(user);
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
