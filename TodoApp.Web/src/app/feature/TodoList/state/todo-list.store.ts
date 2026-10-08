import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Store } from '@ngrx/store';
import { Todo } from '../models/todo-list.model';
import { createTodo, loadTodos, removeTodo, updateTodo } from './todo.actions';

interface TodoListState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

const getTodoReferenceDate = (todo: Todo): number => {
  const reference = todo.dueDate ?? todo.createdAt ?? new Date(0);
  const date = new Date(reference);

  return Number.isNaN(date.getTime()) ? new Date(0).getTime() : date.getTime();
};

const sortTodos = (todos: Todo[]): Todo[] =>
  [...todos].sort((left, right) => getTodoReferenceDate(left) - getTodoReferenceDate(right));

const initialTodos: Todo[] = [];

export const TodoListStore = signalStore(
  withState<TodoListState>({
    todos: initialTodos,
    loading: false,
    error: null,
  }),
  withComputed((state) => ({
    totalTodos: computed(() => state.todos().length),
    completedTodos: computed(() => state.todos().filter((todo) => todo.completed).length),
    remainingTodos: computed(() => state.todos().filter((todo) => !todo.completed).length),
  })),
  withMethods((state) => {
    const store = inject(Store);

    return {
      loadTodos: () => {
        patchState(state, { loading: true, error: null });
        store.dispatch(loadTodos());
      },
      setTodos: (todos: Todo[]) => {
        patchState(state, { todos: sortTodos(todos), loading: false, error: null });
      },
      addTodo: (todo: Todo) => {
        patchState(state, {
          todos: sortTodos([...state.todos(), todo]),
          loading: false,
        });
      },
      createTodo: (todo: Todo) => {
        store.dispatch(createTodo({ todo }));
      },
      updateTodo: (todo: Todo) => {
        patchState(state, {
          todos: sortTodos(
            state.todos().map((currentTodo) => (currentTodo.todoId === todo.todoId ? todo : currentTodo)),
          ),
          loading: false,
        });
      },
      updateExistingTodo: (todo: Todo) => {
        store.dispatch(updateTodo({ todo }));
      },
      removeTodo: (todoId: string) => {
        patchState(state, {
          todos: sortTodos(state.todos().filter((todo) => todo.todoId !== todoId)),
        });
      },
      deleteTodo: (todoId: string) => {
        store.dispatch(removeTodo({ todoId }));
      },
      toggleTodo: (todoId: string) => {
        const todo = state.todos().find((currentTodo) => currentTodo.todoId === todoId);
        if (!todo) {
          return;
        }

        const completed = !todo.completed;
        store.dispatch(
          updateTodo({
            todo: {
              ...todo,
              completed,
              finishedDate: completed ? new Date() : undefined,
            },
          }),
        );
      },
      setLoading: (loading: boolean) => patchState(state, { loading }),
      setError: (error: string | null) => patchState(state, { error, loading: false }),
    };
  }),
);
