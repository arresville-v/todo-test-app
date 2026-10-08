import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { Todo } from '../../models/todo-list.model';
import { TodoListStore } from '../../state/todo-list.store';
import { TodoListPage } from './todo-list.page';

describe('TodoListPage', () => {
  let component: TodoListPage;
  let fixture: ComponentFixture<TodoListPage>;
  const mockStore = {
    todos: signal<Todo[]>([
      {
        todoId: '1',
        title: 'Initial todo',
        description: 'Exists',
        completed: false,
        dueDate: new Date('2026-10-08'),
      },
    ]),
    totalTodos: signal(1),
    completedTodos: signal(0),
    remainingTodos: signal(1),
    error: signal(null),
    loadTodos: vi.fn(),
    addTodo: vi.fn(),
    updateTodo: vi.fn(),
    removeTodo: vi.fn(),
    deleteTodo: vi.fn(),
    toggleTodo: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListPage],
      providers: [
        { provide: TodoListStore, useValue: mockStore },
        { provide: AuthService, useValue: { currentUser: signal({ name: 'Test user' }) } },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load todos on init', () => {
    expect(component).toBeTruthy();
    expect(mockStore.loadTodos).toHaveBeenCalled();
  });

  it('should open the add todo modal on desktop', () => {
    component.isMobile = false;
    component.openAddTodo();

    expect(component.isModalOpen).toBeTruthy();
    expect(component.selectedTodoId).toBeNull();
  });

  it('should group todos by due-date window and completed status', () => {
    const dueInDays = (days: number): Date => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    };
    mockStore.todos.set([
      { todoId: 'overdue', title: 'Overdue', completed: false, dueDate: dueInDays(-1) },
      { todoId: 'today', title: 'Today', completed: false, dueDate: dueInDays(0) },
      { todoId: 'week', title: 'Next week', completed: false, dueDate: dueInDays(7) },
      { todoId: 'fortnight', title: 'Next fortnight', completed: false, dueDate: dueInDays(14) },
      { todoId: 'later', title: 'Later', completed: false, dueDate: dueInDays(15) },
      { todoId: 'none', title: 'No due date', completed: false },
      { todoId: 'done', title: 'Completed', completed: true, dueDate: dueInDays(0) },
    ]);

    expect(component.todoGroups().map((group) => group.label)).toEqual([
      'Overdue',
      'Today',
      'Next week',
      'Next fortnight',
      'More than 2 weeks',
      'No due date',
      'Completed',
    ]);
  });
});
