import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Subject, of } from 'rxjs';
import { TodoApiService } from '../data-access/todo-api.service';
import { TodoEffects } from './todo.effects';
import {
  createTodo,
  createTodoSuccess,
  loadTodos,
  loadTodosSuccess,
  updateTodo,
  updateTodoSuccess,
} from './todo.actions';
import { TodoListStore } from './todo-list.store';

describe('TodoEffects', () => {
  let actions$: Subject<Action>;
  let effects: TodoEffects;
  let api: any;
  let todoStore: any;

  const todos = [
    {
      todoId: "1",
      title: 'First todo',
      description: 'Test todo 1',
      completed: false,
      dueDate: new Date('2026-10-10'),
    },
  ];

  beforeEach(() => {
    actions$ = new Subject<Action>();
    api = {
      getTodos: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
    };
    todoStore = {
      todos: signal(todos),
      setTodos: vi.fn(),
      setError: vi.fn(),
      addTodo: vi.fn(),
      updateTodo: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TodoEffects,
        provideMockActions(() => actions$),
        { provide: TodoApiService, useValue: api },
        { provide: TodoListStore, useValue: todoStore },
      ],
    });

    effects = TestBed.inject(TodoEffects);
  });

  it('should load todos from api', () => {
    api.getTodos.mockReturnValue(of(todos));

    effects.loadTodos$.subscribe((action) => {
      expect(action).toEqual(loadTodosSuccess({ todos }));
      expect(todoStore.setTodos).toHaveBeenCalledWith(todos);
    });

    actions$.next(loadTodos());
  });

  it('should create a todo item', () => {
    const newTodo = { ...todos[0], todoId: "2", title: 'Created todo' };
    api.createTodo.mockReturnValue(of(newTodo));

    effects.createTodo$.subscribe((action) => {
      expect(action).toEqual(createTodoSuccess({ todo: newTodo }));
      expect(todoStore.addTodo).toHaveBeenCalledWith(newTodo);
    });

    actions$.next(createTodo({ todo: newTodo }));
  });

  it('should update a todo item', () => {
    const updatedTodo = { ...todos[0], title: 'Updated title' };
    api.updateTodo.mockReturnValue(of(updatedTodo));

    effects.updateTodo$.subscribe((action) => {
      expect(action).toEqual(updateTodoSuccess({ todo: updatedTodo }));
      expect(todoStore.updateTodo).toHaveBeenCalledWith(updatedTodo);
    });

    actions$.next(updateTodo({ todo: updatedTodo }));
  });
});
