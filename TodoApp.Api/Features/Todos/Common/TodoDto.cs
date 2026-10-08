namespace TodoApp.Features.Todos.Common
{
    public class TodoDto
    {
        public string TodoId { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public bool IsCompleted { get; set; }
        public System.DateTime CreatedAt { get; set; }

        public System.DateTime DueDate { get; set; }
        public System.DateTime? FinishedDate { get; set; }
    }
}
