import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from '../app.routes';
import { authInterceptor } from './auth/auth.interceptor';
import { TodoEffects } from '../feature/TodoList/state/todo.effects';
import { TodoListStore } from '../feature/TodoList/state/todo-list.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore(),
    provideEffects(TodoEffects),
    TodoListStore,
  ],
};
