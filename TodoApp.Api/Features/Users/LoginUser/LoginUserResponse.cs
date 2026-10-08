using TodoApp.Features.Users.Common;

namespace TodoApp.Features.Users.LoginUser
{
    public class LoginUserResponse
    {
        public string Token { get; set; } = null!;
        public UserDto User { get; set; } = null!;
    }
}
