using MediatR;
using Microsoft.AspNetCore.Authorization;
using TodoApp.Features.Todos.CreateTodo;
using TodoApp.Features.Todos.UpdateTodo;

namespace TodoApp.Features.Todos.Common;

/// <summary>
/// Maps the HTTP endpoints for the Todos. All routes require an
/// authenticated user and operate only on todos owned by the caller
/// </summary>
public static class TodoEndpoints
{
    /// <summary>Registers the <c>/todos</c> endpoint group on the application.</summary>
    public static void MapTodoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/todos")
            .RequireAuthorization()
            .WithTags("Todos");

        group.MapGet("/", GetTodos)
            .WithName("GetTodos")
            .WithSummary("List the caller's todos")
            .WithDescription("Returns every todo item owned by the authenticated user.")
            .Produces<List<TodoDto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetTodo)
            .WithName("GetTodo")
            .WithSummary("Get a single todo")
            .WithDescription("Returns a todo item by id. The item must belong to the authenticated user.")
            .Produces<TodoDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateTodo)
            .WithName("CreateTodo")
            .WithSummary("Create a todo")
            .WithDescription("Creates a new todo item for the authenticated user.")
            .Produces<TodoDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateTodo)
            .WithName("UpdateTodo")
            .WithSummary("Update a todo")
            .WithDescription("Updates an existing todo item owned by the authenticated user.")
            .Produces<TodoDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteTodo)
            .WithName("DeleteTodo")
            .WithSummary("Delete a todo")
            .WithDescription("Deletes a todo item owned by the authenticated user.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    /// <summary>Returns all todos belonging to the authenticated user.</summary>
    private static async Task<IResult> GetTodos(IMediator mediator)
    {
        var todos = await mediator.Send(new GetTodosHandler.Query());
        return Results.Ok(todos);
    }

    /// <summary>Returns a single todo by id, or 404 if it doesn't exist or isn't owned by the caller.</summary>
    private static async Task<IResult> GetTodo(Guid id, IMediator mediator)
    {
        var todo = await mediator.Send(new GetTodoHandler.Query(id));
        return todo is null ? Results.NotFound() : Results.Ok(todo);
    }

    /// <summary>Creates a new todo for the authenticated user.</summary>
    private static async Task<IResult> CreateTodo(CreateTodoCommand command, IMediator mediator)
    {
        var created = await mediator.Send(command);
        return Results.Created($"/todos/{created.TodoId}", created);
    }

    /// <summary>Updates an existing todo, or 404 if it doesn't exist or isn't owned by the caller.</summary>
    private static async Task<IResult> UpdateTodo(Guid id, UpdateTodoCommand command, IMediator mediator)
    {
        var updated = await mediator.Send(command);
        return updated is null ? Results.NotFound() : Results.Ok(updated);
    }

    /// <summary>Deletes a todo, or 404 if it doesn't exist or isn't owned by the caller.</summary>
    private static async Task<IResult> DeleteTodo(Guid id, IMediator mediator)
    {
        var deleted = await mediator.Send(new DeleteTodoHandler.Command(id));
        return deleted ? Results.NoContent() : Results.NotFound();
    }
}
