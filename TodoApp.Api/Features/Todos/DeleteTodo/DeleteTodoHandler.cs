using MediatR;
using Microsoft.EntityFrameworkCore;
using TodoApp.Infrastructure;

namespace TodoApp.Features.Todos
{
    public static class DeleteTodoHandler
    {
        public record Command(Guid Id) : IRequest<bool>;

        public class Handler : IRequestHandler<Command, bool>
        {
            private readonly TodoDbContext _db;
            private readonly IUserContext _userContext;

            public Handler(TodoDbContext db, IUserContext userContext)
            {
                _db = db;
                _userContext = userContext;
            }

            public async Task<bool> Handle(Command request, CancellationToken cancellationToken)
            {
                var userId = _userContext.GetUserId();

                var entity = await _db.Todos
                    .FirstOrDefaultAsync(t => t.TodoId == request.Id && t.UserId == userId, cancellationToken);

                if (entity is null) return false;

                _db.Todos.Remove(entity);
                await _db.SaveChangesAsync(cancellationToken);
                return true;
            }
        }
    }
}

