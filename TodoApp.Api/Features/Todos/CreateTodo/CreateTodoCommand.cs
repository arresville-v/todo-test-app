using MediatR;
using TodoApp.Features.Todos.Common;

namespace TodoApp.Features.Todos.CreateTodo
{
    public record CreateTodoCommand(
        string Title,
        string Description,
        DateTime DueDate,
        DateTime CreatedAt
    ) : IRequest<TodoDto>;
}
