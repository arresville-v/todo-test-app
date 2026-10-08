import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { Todo, TodoFormValue } from '../../models/todo-list.model';
import { TodoListStore } from '../../state/todo-list.store';

interface TodoGroup {
  label: string;
  todos: Todo[];
}

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-todo-list-page',
  styleUrl: './todo-list.page.scss',
  templateUrl: './todo-list.page.html',
})
export class TodoListPage implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly store = inject(TodoListStore);

  readonly todos = this.store.todos;
  readonly currentUser = this.auth.currentUser;
  readonly todoGroups = computed(() => this.groupTodos(this.todos()));
  readonly totalTodos = this.store.totalTodos;
  readonly completedTodos = this.store.completedTodos;
  readonly remainingTodos = this.store.remainingTodos;

  isMobile = false;
  isModalOpen = false;
  selectedTodoId: string | null = null;
  todoForm: TodoFormValue = {
    title: '',
    description: '',
    dueDate: this.getDateInputValue(new Date()),
  };

  private readonly mobileBreakpoint = 768;

  ngOnInit(): void {
    this.updateViewport();

    if (typeof window !== 'undefined') {
      this.store.loadTodos();
    }
  }

  @HostListener('window:resize')
  updateViewport(): void {
    this.isMobile = typeof window !== 'undefined' && window.innerWidth <= this.mobileBreakpoint;
  }

  openAddTodo(): void {
    if (this.isMobile) {
      this.router.navigate(['/todo-list/new']);
      return;
    }

    this.selectedTodoId = null;
    this.todoForm = {
      title: '',
      description: '',
      dueDate: this.getDateInputValue(new Date()),
    };
    this.isModalOpen = true;
  }

  openEditTodo(todo: Todo): void {
    if (this.isMobile) {
      this.router.navigate(['/todo-list/edit', todo.todoId]);
      return;
    }

    this.selectedTodoId = todo.todoId;
    this.todoForm = {
      title: todo.title,
      description: todo.description ?? '',
      dueDate: todo.dueDate ? this.getDateInputValue(new Date(todo.dueDate)) : this.getDateInputValue(new Date()),
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedTodoId = null;
    this.todoForm = {
      title: '',
      description: '',
      dueDate: this.getDateInputValue(new Date()),
    };
  }

  saveTodo(): void {
    const title = this.todoForm.title.trim();

    if (!title) {
      return;
    }

    const todoData = {
      title,
      description: this.todoForm.description.trim(),
      dueDate: this.todoForm.dueDate,
    };

    if (this.selectedTodoId !== null) {
      const selectedTodo = this.todos().find((todo) => todo.todoId === this.selectedTodoId);

      if (!selectedTodo) {
        return;
      }

      this.store.updateExistingTodo({
        ...selectedTodo,
        title: todoData.title,
        description: todoData.description,
        dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined,
        createdAt: selectedTodo.createdAt ?? new Date(),
      });
    } else {
      this.store.createTodo({
        todoId: '',
        title: todoData.title,
        description: todoData.description,
        completed: false,
        dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined,
        createdAt: new Date(),
      });
    }

    this.closeModal();
  }

  toggleTodo(todoId: string): void {
    this.store.toggleTodo(todoId);
  }

  removeTodo(todoId: string): void {
    this.store.deleteTodo(todoId);
  }

  isPastDue(todo: Todo): boolean {
    if (todo.completed || !todo.dueDate) {
      return false;
    }

    return this.startOfDay(this.parseCalendarDate(todo.dueDate)).getTime() < this.startOfDay(new Date()).getTime();
  }

  formatDueDate(date?: Date | string): string {
    if (!date) {
      return '—';
    }

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
    }).format(this.parseCalendarDate(date));
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  private groupTodos(todos: Todo[]): TodoGroup[] {
    const today = this.startOfDay(new Date());
    const dayMilliseconds = 24 * 60 * 60 * 1000;
    const buckets: TodoGroup[] = [
      { label: 'Overdue', todos: [] },
      { label: 'Today', todos: [] },
      { label: 'Next week', todos: [] },
      { label: 'Next fortnight', todos: [] },
      { label: 'More than 2 weeks', todos: [] },
      { label: 'No due date', todos: [] },
      { label: 'Completed', todos: [] },
    ];

    for (const todo of todos) {
      if (todo.completed) {
        buckets[6].todos.push(todo);
        continue;
      }
      if (!todo.dueDate) {
        buckets[5].todos.push(todo);
        continue;
      }

      const daysUntilDue = Math.round(
        (this.startOfDay(this.parseCalendarDate(todo.dueDate)).getTime() - today.getTime()) / dayMilliseconds,
      );
      const bucketIndex =
        daysUntilDue < 0 ? 0 : daysUntilDue === 0 ? 1 : daysUntilDue <= 7 ? 2 : daysUntilDue <= 14 ? 3 : 4;
      buckets[bucketIndex].todos.push(todo);
    }

    return buckets.filter((group) => group.todos.length > 0);
  }

  private parseCalendarDate(value: Date | string): Date {
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const dateOnly = value.slice(0, 10);
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
    if (parts) {
      return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    }
    return new Date(value);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getDateInputValue(date: Date): string {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }
}
