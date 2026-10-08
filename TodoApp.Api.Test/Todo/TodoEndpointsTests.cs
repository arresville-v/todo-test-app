using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using TodoApp.Features.Todos.Common;
using TodoApp.Features.Todos.CreateTodo;
using TodoApp.Features.Todos.UpdateTodo;
using TodoApp.Features.Users.RegisterUser;
using TodoApp.Features.Users.LoginUser;

namespace TodoApp.Api.Test.Todo;

public class TodoEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TodoEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = _factory.CreateClient();

        var userName = $"user{Guid.NewGuid():N}";
        var registerCommand = new RegisterUserCommand(
            Name: "Test User",
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

        return client;
    }

    [Fact]
    public async Task CreateTodo_WithValidData_ReturnsCreated()
    {
        var client = await CreateAuthenticatedClientAsync();

        var command = new CreateTodoCommand(
            Title: "Buy groceries",
            Description: "Milk, eggs, bread",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);

        var response = await client.PostAsJsonAsync("/todos", command);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(created);
        Assert.Equal("Buy groceries", created!.Title);
    }

    [Fact]
    public async Task CreateTodo_WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var command = new CreateTodoCommand(
            Title: "Buy groceries",
            Description: "Milk, eggs, bread",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);

        var response = await client.PostAsJsonAsync("/todos", command);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateTodo_WithEmptyTitle_ReturnsBadRequestWithErrorMessage()
    {
        var client = await CreateAuthenticatedClientAsync();

        var command = new CreateTodoCommand(
            Title: "",
            Description: "Some description",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);

        var response = await client.PostAsJsonAsync("/todos", command);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(body);
        Assert.Contains("Title is required.", body!.Error);
    }

    [Fact]
    public async Task GetTodos_ReturnsCreatedTodo()
    {
        var client = await CreateAuthenticatedClientAsync();

        var command = new CreateTodoCommand(
            Title: "Task A",
            Description: "Description A",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);
        await client.PostAsJsonAsync("/todos", command);

        var response = await client.GetAsync("/todos");

        response.EnsureSuccessStatusCode();
        var todos = await response.Content.ReadFromJsonAsync<List<TodoDto>>();
        Assert.NotNull(todos);
        Assert.Contains(todos!, t => t.Title == "Task A");
    }

    [Fact]
    public async Task GetTodo_WithUnknownId_ReturnsNotFound()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync($"/todos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTodo_WithEmptyTitle_ReturnsBadRequestWithErrorMessage()
    {
        var client = await CreateAuthenticatedClientAsync();

        var createCommand = new CreateTodoCommand(
            Title: "Original title",
            Description: "Description",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);
        var createResponse = await client.PostAsJsonAsync("/todos", createCommand);
        var created = await createResponse.Content.ReadFromJsonAsync<TodoDto>();

        var updateCommand = new UpdateTodoCommand(
            TodoId: created!.TodoId,
            Title: "",
            Description: "Updated description",
            isCompleted: false,
            DueDate: DateTime.Now.AddDays(2),
            FinishedDate: null);

        var response = await client.PutAsJsonAsync($"/todos/{created.TodoId}", updateCommand);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(body);
        Assert.Contains("Title is required.", body!.Error);
    }

    [Fact]
    public async Task DeleteTodo_WithUnknownId_ReturnsNotFound()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.DeleteAsync($"/todos/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetTodo_WithKnownId_ReturnsTodo()
    {
        var client = await CreateAuthenticatedClientAsync();

        var createCommand = new CreateTodoCommand(
            Title: "Task B",
            Description: "Description B",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);
        var createResponse = await client.PostAsJsonAsync("/todos", createCommand);
        var created = await createResponse.Content.ReadFromJsonAsync<TodoDto>();

        var response = await client.GetAsync($"/todos/{created!.TodoId}");

        response.EnsureSuccessStatusCode();
        var todo = await response.Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(todo);
        Assert.Equal("Task B", todo!.Title);
    }

    [Fact]
    public async Task UpdateTodo_WithValidData_ReturnsUpdatedTodo()
    {
        var client = await CreateAuthenticatedClientAsync();

        var createCommand = new CreateTodoCommand(
            Title: "Original title",
            Description: "Description",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);
        var createResponse = await client.PostAsJsonAsync("/todos", createCommand);
        var created = await createResponse.Content.ReadFromJsonAsync<TodoDto>();

        var updateCommand = new UpdateTodoCommand(
            TodoId: created!.TodoId,
            Title: "Updated title",
            Description: "Updated description",
            isCompleted: true,
            DueDate: DateTime.Now.AddDays(2),
            FinishedDate: DateTime.Now);

        var response = await client.PutAsJsonAsync($"/todos/{created.TodoId}", updateCommand);

        response.EnsureSuccessStatusCode();
        var updated = await response.Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(updated);
        Assert.Equal("Updated title", updated!.Title);
        Assert.True(updated.IsCompleted);
    }

    [Fact]
    public async Task UpdateTodo_WithUnknownId_ReturnsNotFound()
    {
        var client = await CreateAuthenticatedClientAsync();

        var updateCommand = new UpdateTodoCommand(
            TodoId: Guid.NewGuid().ToString(),
            Title: "Title",
            Description: "Description",
            isCompleted: false,
            DueDate: DateTime.Now.AddDays(1),
            FinishedDate: null);

        var response = await client.PutAsJsonAsync($"/todos/{updateCommand.TodoId}", updateCommand);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTodo_WithKnownId_ReturnsNoContent()
    {
        var client = await CreateAuthenticatedClientAsync();

        var createCommand = new CreateTodoCommand(
            Title: "To be deleted",
            Description: "Description",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);
        var createResponse = await client.PostAsJsonAsync("/todos", createCommand);
        var created = await createResponse.Content.ReadFromJsonAsync<TodoDto>();

        var response = await client.DeleteAsync($"/todos/{created!.TodoId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var getResponse = await client.GetAsync($"/todos/{created.TodoId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task GetTodo_BelongingToAnotherUser_ReturnsNotFound()
    {
        var firstClient = await CreateAuthenticatedClientAsync();
        var createCommand = new CreateTodoCommand(
            Title: "Private task",
            Description: "Description",
            DueDate: DateTime.Now.AddDays(1),
            CreatedAt: DateTime.Now);
        var createResponse = await firstClient.PostAsJsonAsync("/todos", createCommand);
        var created = await createResponse.Content.ReadFromJsonAsync<TodoDto>();

        var secondClient = await CreateAuthenticatedClientAsync();
        var response = await secondClient.GetAsync($"/todos/{created!.TodoId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private record ErrorResponse([property: JsonPropertyName("error")] string Error);
}
