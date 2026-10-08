using MediatR;
using TodoApp.Features.Todos.Common;

namespace TodoApp.Features.Todos.UpdateTodo
{
    public record UpdateTodoCommand(
        string TodoId,
        string Title,
        string Description,
        bool isCompleted,
        DateTime DueDate,
        DateTime? FinishedDate
    ) : IRequest<TodoDto>;
}
