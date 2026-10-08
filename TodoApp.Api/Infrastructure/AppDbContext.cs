using Microsoft.EntityFrameworkCore;
using TodoApp.Data;

namespace TodoApp.Infrastructure
{
    public class TodoDbContext : DbContext
    {
        public TodoDbContext(DbContextOptions<TodoDbContext> options) : base(options)
        {
        }

        public DbSet<Todo> Todos { get; set; } = null!;

        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Todo>().HasKey(todo => todo.TodoId);
            base.OnModelCreating(modelBuilder);
        }
    }
    
}
