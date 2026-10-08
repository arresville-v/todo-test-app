import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TodoApiService } from '../data-access/todo-api.service';
import {
  createTodo,
  createTodoFailure,
  createTodoSuccess,
  loadTodos,
  removeTodo,
  removeTodoFailure,
  removeTodoSuccess,
  loadTodosFailure,
  loadTodosSuccess,
  updateTodo,
  updateTodoFailure,
  updateTodoSuccess,
} from './todo.actions';
import { TodoListStore } from './todo-list.store';

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof HttpErrorResponse) {
    const body: unknown = error.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
    return `${fallback} (HTTP ${error.status}).`;
  }
  return fallback;
};

@Injectable()
export class TodoEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(TodoApiService);
  private readonly todoStore = inject(TodoListStore);

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTodos),
      switchMap(() =>
        this.api.getTodos().pipe(
          map((todos) => {
            this.todoStore.setTodos(todos);
            return loadTodosSuccess({ todos });
          }),
          catchError((error: unknown) => {
            const fallbackTodos = this.todoStore.todos();
            this.todoStore.setTodos(fallbackTodos);
            const message = getApiErrorMessage(error, 'Unable to load todos from the API.');
            this.todoStore.setError(message);

            return of(loadTodosFailure({ error: message }));
          }),
        ),
      ),
    ),
  );

  createTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createTodo),
      switchMap(({ todo }) => {
        return this.api.createTodo(todo).pipe(
          map((createdTodo) => {
            this.todoStore.addTodo(createdTodo);
            return createTodoSuccess({ todo: createdTodo });
          }),
          catchError((error: unknown) => {
            const message = getApiErrorMessage(error, 'Unable to create todo on the API.');
            this.todoStore.setError(message);
            return of(createTodoFailure({ error: message }));
          }),
        );
      }
      ),
    ),
  );

  updateTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTodo),
      switchMap(({ todo }) =>
        this.api.updateTodo(todo).pipe(
          map((updatedTodo) => {
            this.todoStore.updateTodo(updatedTodo);
            return updateTodoSuccess({ todo: updatedTodo });
          }),
          catchError((error: unknown) => {
            const message = getApiErrorMessage(error, 'Unable to update todo on the API.');
            this.todoStore.setError(message);
            return of(updateTodoFailure({ error: message }));
          }),
        ),
      ),
    ),
  );

  removeTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeTodo),
      switchMap(({ todoId }) =>
        this.api.removeTodo(todoId).pipe(
          map(() => {
            this.todoStore.removeTodo(todoId);
            return removeTodoSuccess({ todoId });
          }),
          catchError((error: unknown) => {
            const message = getApiErrorMessage(error, 'Unable to remove todo on the API.');
            this.todoStore.setError(message);
            return of(removeTodoFailure({ error: message }));
          }),
        ),
      ),
    ),
  );
}