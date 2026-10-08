import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    data: { mode: 'login' },
    loadComponent: () =>
      import('./feature/Auth/pages/auth-page/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'register',
    data: { mode: 'register' },
    loadComponent: () =>
      import('./feature/Auth/pages/auth-page/auth.page').then((m) => m.AuthPage),
  },
  {
    path: '',
    redirectTo: 'todo-list',
    pathMatch: 'full',
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/Auth/pages/user-page/user.page').then((m) => m.UserPage),
  },
  {
    path: 'todo-list',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/TodoList/pages/todo-list/todo-list.page').then((m) => m.TodoListPage),
  },
  {
    path: 'todo-list/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/TodoList/pages/todo-form/todo-form.page').then((m) => m.TodoFormPage),
  },
  {
    path: 'todo-list/edit/:todoId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./feature/TodoList/pages/todo-form/todo-form.page').then((m) => m.TodoFormPage),
  },
  {
    path: '**',
    redirectTo: 'todo-list',
  },
];
