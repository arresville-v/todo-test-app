using MediatR;
using Microsoft.EntityFrameworkCore;
using TodoApp.Features.Todos.Common;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Todos
{
    public static class GetTodoHandler
    {
        public record Query(Guid Id) : IRequest<TodoDto?>;

        public class Handler : IRequestHandler<Query, TodoDto?>
        {
            private readonly TodoDbContext _db;
            private readonly IUserContext _userContext;

            public Handler(TodoDbContext db, IUserContext userContext)
            {
                _db = db;
                _userContext = userContext;
            }

            public async Task<TodoDto?> Handle(Query request, CancellationToken cancellationToken)
            {
                var userId = _userContext.GetUserId();

                var x = await _db.Todos
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.TodoId == request.Id && t.UserId == userId, cancellationToken);

                if (x is null) return null;

                return new TodoDto
                {
                    TodoId = x.TodoId.ToString(),
                    Title = x.Title,
                    Description = x.Description,
                    IsCompleted = x.IsCompleted,
                    CreatedAt = x.CreatedAt,
                    DueDate = x.DueDate,
                    FinishedDate = x.FinishedDate
                };
            }
        }
    }
}

