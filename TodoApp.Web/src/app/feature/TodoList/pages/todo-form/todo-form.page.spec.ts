import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoFormPage } from './todo-form.page';
import { TodoListStore } from '../../state/todo-list.store';

describe('TodoFormPage', () => {
  const mockTodo = {
    todoId: '42',
    title: 'Existing todo',
    description: 'Todo description',
    completed: false,
    dueDate: new Date('2026-10-15'),
  };

  const buildStore = () => ({
    todos: signal([mockTodo]),
    totalTodos: signal(1),
    completedTodos: signal(0),
    remainingTodos: signal(1),
    createTodo: vi.fn(),
    updateExistingTodo: vi.fn(),
    loadTodos: vi.fn(),
    addTodo: vi.fn(),
    updateTodo: vi.fn(),
    removeTodo: vi.fn(),
    toggleTodo: vi.fn(),
  });

  it('should create a todo when route is new', async () => {
    const mockStore = buildStore();

    await TestBed.configureTestingModule({
      imports: [TodoFormPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { routeConfig: { path: 'new' }, paramMap: { get: () => null } } } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: TodoListStore, useValue: mockStore },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoFormPage);
    const component = fixture.componentInstance;
    component.form = {
      title: 'New todo',
      description: 'A new item',
      dueDate: '2026-10-20',
    };

    component.saveTodo();

    expect(mockStore.createTodo).toHaveBeenCalled();
  });

  it('should populate edit values and update an existing todo when route is edit', async () => {
    const mockStore = buildStore();

    await TestBed.configureTestingModule({
      imports: [TodoFormPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              routeConfig: { path: 'edit/:todoId' },
              paramMap: { get: (key: string) => (key === 'todoId' ? '42' : null) },
            },
          },
        },
        { provide: TodoListStore, useValue: mockStore },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TodoFormPage);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(component.isEditMode).toBeTruthy();
    expect(component.form.title).toBe('Existing todo');

    component.form.title = 'Updated todo';
    component.saveTodo();

    expect(mockStore.updateExistingTodo).toHaveBeenCalled();
  });
});
