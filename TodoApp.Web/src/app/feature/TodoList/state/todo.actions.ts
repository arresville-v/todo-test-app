import { createAction, props } from '@ngrx/store';
import { Todo } from '../models/todo-list.model';

export const loadTodos = createAction('[Todo] Load Todos');

export const loadTodosSuccess = createAction(
  '[Todo] Load Todos Success',
  props<{ todos: Todo[] }>(),
);

export const loadTodosFailure = createAction(
  '[Todo] Load Todos Failure',
  props<{ error: string }>(),
);

export const createTodo = createAction(
  '[Todo] Create Todo',
  props<{ todo: Todo }>(),
);

export const createTodoSuccess = createAction(
  '[Todo] Create Todo Success',
  props<{ todo: Todo }>(),
);

export const createTodoFailure = createAction(
  '[Todo] Create Todo Failure',
  props<{ error: string }>(),
);

export const updateTodo = createAction(
  '[Todo] Update Todo',
  props<{ todo: Todo }>(),
);

export const updateTodoSuccess = createAction(
  '[Todo] Update Todo Success',
  props<{ todo: Todo }>(),
);

export const updateTodoFailure = createAction(
  '[Todo] Update Todo Failure',
  props<{ error: string }>(),
);

export const removeTodo = createAction(
  '[Todo] Remove Todo',
  props<{ todoId: string }>(),
);

export const removeTodoSuccess = createAction(
  '[Todo] Remove Todo Success',
  props<{ todoId: string }>(),
);

export const removeTodoFailure = createAction(
  '[Todo] Remove Todo Failure',
  props<{ error: string }>(),
);