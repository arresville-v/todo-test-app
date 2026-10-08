using MediatR;
using TodoApp.Features.Users.RegisterUser;
using TodoApp.Features.Users.LoginUser;
using TodoApp.Features.Users.GetCurrentUser;
using TodoApp.Features.Users.UpdateCurrentUser;

namespace TodoApp.Features.Users.Common;

/// <summary>
/// Maps the HTTP endpoints for the Users: registration, login,
/// and profile retrieval/update for the authenticated user.
/// </summary>
public static class UserEndpoints
{
    /// <summary>Registers the <c>/auth</c> endpoint group on the application.</summary>
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/auth").WithTags("Users");

        group.MapPost("/register", RegisterUser)
        .WithName("RegisterUser")
        .WithSummary("Register a new user")
        .WithDescription("Creates a new user account.")
        .Produces<UserDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/login", Login)
        .WithName("LoginUser")
        .WithSummary("Log in and obtain a JWT")
        .WithDescription("Validates credentials and returns a bearer token along with the user's profile.")
        .Produces<LoginUserResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        group.MapGet("/me", GetCurrentUser)
        .WithName("GetCurrentUser")
        .WithSummary("Get the current user's profile")
        .WithDescription("Returns the profile of the authenticated user.")
        .Produces<UserDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status404NotFound)
        .RequireAuthorization();

        group.MapPut("/me", UpdateCurentUser)
        .WithName("UpdateCurrentUser")
        .WithSummary("Update the current user's profile")
        .WithDescription("Updates name, email, and username for the authenticated user.")
        .Produces<UserDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }

    private static async Task<IResult> Login(LoginUserCommand command, IMediator mediator)
    {
        var result = await mediator.Send(command);
        return Results.Ok(result);
    }

    private static async Task<IResult> RegisterUser(RegisterUserCommand command, IMediator mediator)
    {
        var created = await mediator.Send(command);
        return Results.Created($"/auth/register", created);
    }
    private static async Task<IResult> GetCurrentUser(IMediator mediator)
    {
        var result = await mediator.Send(new GetCurrentUserQuery());
        return result is null ? Results.NotFound() : Results.Ok(result);
    }

    private static async Task<IResult> UpdateCurentUser(UpdateCurrentUserCommand command, IMediator mediator)
    {
        var result = await mediator.Send(command);
        return Results.Ok(result);
    }
}
