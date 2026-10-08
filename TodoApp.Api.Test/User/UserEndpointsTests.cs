using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using TodoApp.Features.Users.Common;
using TodoApp.Features.Users.RegisterUser;
using TodoApp.Features.Users.LoginUser;
using TodoApp.Features.Users.UpdateCurrentUser;

namespace TodoApp.Api.Test.User;

public class UserEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public UserEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<(HttpClient Client, string UserName)> CreateAuthenticatedClientAsync()
    {
        var client = _factory.CreateClient();
        var userName = $"user{Guid.NewGuid():N}";

        var registerCommand = new RegisterUserCommand(
            Name: "Jane Doe",
            Email: $"{userName}@example.com",
            UserName: userName,
            Password: "Password1!");
        var registerResponse = await client.PostAsJsonAsync("/auth/register", registerCommand);
        registerResponse.EnsureSuccessStatusCode();

        var loginCommand = new LoginUserCommand(userName, "Password1!");
        var loginResponse = await client.PostAsJsonAsync("/auth/login", loginCommand);
        loginResponse.EnsureSuccessStatusCode();

        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginUserResponse>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", loginResult!.Token);

        return (client, userName);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsCreated()
    {
        var client = _factory.CreateClient();
        var userName = $"user{Guid.NewGuid():N}";

        var command = new RegisterUserCommand(
            Name: "Jane Doe",
            Email: $"{userName}@example.com",
            UserName: userName,
            Password: "Password1!");

        var response = await client.PostAsJsonAsync("/auth/register", command);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(created);
        Assert.Equal(userName, created!.UserName);
    }

    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsBadRequestWithErrorMessage()
    {
        var client = _factory.CreateClient();
        var userName = $"user{Guid.NewGuid():N}";

        var command = new RegisterUserCommand(
            Name: "Jane Doe",
            Email: "not-an-email",
            UserName: userName,
            Password: "Password1!");

        var response = await client.PostAsJsonAsync("/auth/register", command);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(body);
        Assert.Contains("Email must be a valid email address.", body!.Error);
    }

    [Fact]
    public async Task Register_WithWeakPassword_ReturnsBadRequestWithErrorMessage()
    {
        var client = _factory.CreateClient();
        var userName = $"user{Guid.NewGuid():N}";

        var command = new RegisterUserCommand(
            Name: "Jane Doe",
            Email: $"{userName}@example.com",
            UserName: userName,
            Password: "weak");

        var response = await client.PostAsJsonAsync("/auth/register", command);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body!.Error));
    }

    [Fact]
    public async Task Register_WithDuplicateUserName_ReturnsBadRequestWithErrorMessage()
    {
        var client = _factory.CreateClient();
        var userName = $"user{Guid.NewGuid():N}";

        var command = new RegisterUserCommand(
            Name: "Jane Doe",
            Email: $"{userName}@example.com",
            UserName: userName,
            Password: "Password1!");

        await client.PostAsJsonAsync("/auth/register", command);
        var secondResponse = await client.PostAsJsonAsync("/auth/register", command with { Email = $"other-{userName}@example.com" });

        Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);
        var body = await secondResponse.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(body);
        Assert.Contains("already exists", body!.Error);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        var client = _factory.CreateClient();
        var userName = $"user{Guid.NewGuid():N}";

        var registerCommand = new RegisterUserCommand(
            Name: "Jane Doe",
            Email: $"{userName}@example.com",
            UserName: userName,
            Password: "Password1!");
        await client.PostAsJsonAsync("/auth/register", registerCommand);

        var loginCommand = new LoginUserCommand(userName, "Password1!");
        var response = await client.PostAsJsonAsync("/auth/login", loginCommand);

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginUserResponse>();
        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result!.Token));
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var loginCommand = new LoginUserCommand($"unknown{Guid.NewGuid():N}", "WrongPassword1!");
        var response = await client.PostAsJsonAsync("/auth/login", loginCommand);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithEmptyUsername_ReturnsBadRequestWithErrorMessage()
    {
        var client = _factory.CreateClient();

        var loginCommand = new LoginUserCommand("", "WrongPassword1!");
        var response = await client.PostAsJsonAsync("/auth/login", loginCommand);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(body);
        Assert.Contains("Username is required.", body!.Error);
    }

    [Fact]
    public async Task GetCurrentUser_WithValidToken_ReturnsOwnProfile()
    {
        var (client, userName) = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/auth/me");

        response.EnsureSuccessStatusCode();
        var profile = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(profile);
        Assert.Equal(userName, profile!.UserName);
    }

    [Fact]
    public async Task GetCurrentUser_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCurrentUser_WithValidData_ReturnsUpdatedProfile()
    {
        var (client, _) = await CreateAuthenticatedClientAsync();
        var newUserName = $"updated{Guid.NewGuid():N}";

        var command = new UpdateCurrentUserCommand(
            Name: "Jane Updated",
            Email: $"{newUserName}@example.com",
            UserName: newUserName,
            Password: "Password1!");

        var response = await client.PutAsJsonAsync("/auth/me", command);

        response.EnsureSuccessStatusCode();
        var updated = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(updated);
        Assert.Equal("Jane Updated", updated!.Name);
        Assert.Equal(newUserName, updated.UserName);
    }

    [Fact]
    public async Task UpdateCurrentUser_WithEmptyName_ReturnsBadRequestWithErrorMessage()
    {
        var (client, userName) = await CreateAuthenticatedClientAsync();

        var command = new UpdateCurrentUserCommand(
            Name: "",
            Email: $"{userName}@example.com",
            UserName: userName,
            Password: "Password1!");

        var response = await client.PutAsJsonAsync("/auth/me", command);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body!.Error));
    }

    [Fact]
    public async Task UpdateCurrentUser_WithDuplicateUserName_ReturnsBadRequestWithErrorMessage()
    {
        var otherUserName = $"other{Guid.NewGuid():N}";
        var otherRegisterCommand = new RegisterUserCommand(
            Name: "Other User",
            Email: $"{otherUserName}@example.com",
            UserName: otherUserName,
            Password: "Password1!");
        var seedClient = _factory.CreateClient();
        await seedClient.PostAsJsonAsync("/auth/register", otherRegisterCommand);

        var (client, userName) = await CreateAuthenticatedClientAsync();

        var command = new UpdateCurrentUserCommand(
            Name: "Jane Doe",
            Email: $"{userName}@example.com",
            UserName: otherUserName,
            Password: "Password1!");

        var response = await client.PutAsJsonAsync("/auth/me", command);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(body);
        Assert.Contains("already in use", body!.Error);
    }

    [Fact]
    public async Task UpdateCurrentUser_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var command = new UpdateCurrentUserCommand(
            Name: "Jane Doe",
            Email: "jane@example.com",
            UserName: "janedoe",
            Password: "Password1!");

        var response = await client.PutAsJsonAsync("/auth/me", command);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private record ErrorResponse([property: JsonPropertyName("error")] string Error);
}
