using MediatR;
using TodoApp.Data;
using TodoApp.Features.Todos.Common;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Todos.CreateTodo
{
    public static class CreateTodoHandler
    { 

        public class Handler : IRequestHandler<CreateTodoCommand, TodoDto>
        {
            private readonly TodoDbContext _db;
            private readonly IUserContext _userContext;

            public Handler(TodoDbContext db, IUserContext userContext)
            {
                _db = db;
                _userContext = userContext;
            }

            public async Task<TodoDto> Handle(CreateTodoCommand request, CancellationToken cancellationToken)
            {
                var userId = _userContext.GetUserId();

                var entity = new Todo
                {
                    TodoId = Guid.NewGuid(),
                    Title = request.Title,
                    Description = request.Description,
                    DueDate = request.DueDate,
                    CreatedAt = request.CreatedAt,
                    UserId = userId
                };

                _db.Todos.Add(entity);
                await _db.SaveChangesAsync(cancellationToken);

                return new TodoDto
                {
                    TodoId = entity.TodoId.ToString(),
                    Title = entity.Title,
                    Description = entity.Description,
                    IsCompleted = false,
                    CreatedAt = entity.CreatedAt,
                    DueDate = entity.DueDate,
                };
            }
        }
    }
}
