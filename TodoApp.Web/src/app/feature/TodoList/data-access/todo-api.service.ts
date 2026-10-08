import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../../../core/api-base-url';
import { Todo } from '../models/todo-list.model';

interface TodoApiResponse {
  todoId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: Date | string;
  createdAt?: Date | string;
  finishedDate?: Date | string;
}

@Injectable({
  providedIn: 'root',
})
export class TodoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/todos`;

  getTodos(): Observable<Todo[]> {
    return this.http.get<TodoApiResponse[]>(this.apiUrl).pipe(map((todos) => todos.map(this.fromApi)));
  }

  createTodo(todo: Todo): Observable<Todo> {
    return this.http
      .post<TodoApiResponse>(this.apiUrl, {
        title: todo.title,
        description: todo.description ?? '',
        dueDate: todo.dueDate ?? todo.createdAt ?? new Date(),
        createdAt: todo.createdAt ?? new Date(),
      })
      .pipe(map(this.fromApi));
  }

  updateTodo(todo: Todo): Observable<Todo> {
    return this.http
      .put<TodoApiResponse>(`${this.apiUrl}/${todo.todoId}`, {
        todoId: todo.todoId,
        title: todo.title,
        description: todo.description ?? '',
        isCompleted: todo.completed,
        dueDate: todo.dueDate ?? todo.createdAt ?? new Date(),
        finishedDate: todo.finishedDate,
      })
      .pipe(map(this.fromApi));
  }

  removeTodo(todoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${todoId}`);
  }

  private readonly fromApi = (todo: TodoApiResponse): Todo => ({
    todoId: todo.todoId,
    title: todo.title,
    description: todo.description,
    completed: todo.isCompleted,
    dueDate: todo.dueDate,
    createdAt: todo.createdAt,
    finishedDate: todo.finishedDate,
  });
}
