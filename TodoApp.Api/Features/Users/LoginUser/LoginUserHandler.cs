using MediatR;
using TodoApp.Data;
using TodoApp.Features.Users.Common;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Users.LoginUser
{
    public static class LoginUserHandler
    {
        public class Handler : IRequestHandler<LoginUserCommand, LoginUserResponse>
        {
            private readonly TodoDbContext _db;
            private readonly JwtTokenService _tokenService;

            public Handler(TodoDbContext db, JwtTokenService tokenService)
            {
                _db = db;
                _tokenService = tokenService;
            }

            public async Task<LoginUserResponse> Handle(LoginUserCommand request, CancellationToken cancellationToken)
            {
                var user = _db.Users.FirstOrDefault(u => u.UserName == request.UserName);
                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    throw new UnauthorizedAccessException("Invalid username or password.");
                }

                var token = _tokenService.GenerateToken(user);

                return new LoginUserResponse
                {
                    Token = token,
                    User = new UserDto
                    {
                        UserId = user.UserId.ToString(),
                        Name = user.Name,
                        Email = user.Email,
                        UserName = user.UserName,
                        CreatedAt = user.CreatedAt
                    }
                };
            }
        }
    }
}
