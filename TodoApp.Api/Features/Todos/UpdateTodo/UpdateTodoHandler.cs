using MediatR;
using Microsoft.EntityFrameworkCore;
using TodoApp.Features.Todos.Common;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Todos.UpdateTodo
{
    public static class UpdateTodoHandler
    {
        public record Command(UpdateTodoCommand command) : IRequest<TodoDto?>;


        public class Handler : IRequestHandler<UpdateTodoCommand, TodoDto?>
        {
            private readonly TodoDbContext _db;
            private readonly IUserContext _userContext;

            public Handler(TodoDbContext db, IUserContext userContext)
            {
                _db = db;
                _userContext = userContext;
            }

            public async Task<TodoDto?> Handle(UpdateTodoCommand request, CancellationToken cancellationToken)
            {
                var userId = _userContext.GetUserId();

                var entity = await _db.Todos.FirstOrDefaultAsync(
                    t => t.TodoId.ToString() == request.TodoId && t.UserId == userId, 
                    cancellationToken);

                if (entity is null) return null;

                entity.Title = request.Title;
                entity.Description = request.Description;
                entity.IsCompleted = request.isCompleted;
                entity.DueDate = request.DueDate;
                if (request.isCompleted && entity.FinishedDate == null)
                {
                    entity.FinishedDate = DateTime.UtcNow;
                }
                else if (!request.isCompleted)
                {
                    entity.FinishedDate = null;
                }
                else
                {
                    entity.FinishedDate = request.FinishedDate;
                }
                entity.FinishedDate = request.FinishedDate;

                await _db.SaveChangesAsync(cancellationToken);

                return new TodoDto {
                    TodoId = entity.TodoId.ToString(),
                    Title = entity.Title,
                    Description = entity.Description,
                    IsCompleted = entity.IsCompleted,
                    CreatedAt = entity.CreatedAt,
                    DueDate = entity.DueDate,
                    FinishedDate = entity.FinishedDate
                };
            }
        }
    }
}

