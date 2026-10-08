namespace TodoApp.Data
{
    public class Todo
    {
        public Guid TodoId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime DueDate { get; set; } = DateTime.UtcNow;
        public DateTime? FinishedDate { get; set; }

        public Guid UserId { get; set; }

        // Navigation property
        public User? User { get; set; }
    }
}
