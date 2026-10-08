using MediatR;
using Microsoft.EntityFrameworkCore;
using TodoApp.Features.Todos.Common;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Todos
{
    public static class GetTodosHandler
    {
        public record Query : IRequest<List<TodoDto>>;

        public class Handler : IRequestHandler<Query, List<TodoDto>>
        {
            private readonly TodoDbContext _db;
            private readonly IUserContext _userContext;

            public Handler(TodoDbContext db, IUserContext userContext)
            {
                _db = db;
                _userContext = userContext;
            }

            public async Task<List<TodoDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                var userId = _userContext.GetUserId();

                return await _db.Todos
                    .Where(t => t.UserId == userId)
                    .AsNoTracking()
                    .Select(x => new TodoDto {
                        TodoId = x.TodoId.ToString(),
                        Title = x.Title,
                        Description = x.Description,
                        IsCompleted = x.IsCompleted,
                        CreatedAt = x.CreatedAt,
                        DueDate = x.DueDate,
                        FinishedDate = x.FinishedDate
                    })
                    .ToListAsync(cancellationToken);
            }
        }
    }
}

