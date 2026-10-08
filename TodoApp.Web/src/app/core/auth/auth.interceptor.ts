import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = request.url.startsWith(`${API_BASE_URL}/`);
  const isPublicAuthRequest =
    request.url === `${API_BASE_URL}/auth/login` || request.url === `${API_BASE_URL}/auth/register`;
  const token = !isApiRequest || isPublicAuthRequest ? null : auth.getAccessToken();
  const authorizedRequest =
    token === null
      ? request
      : request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token !== null) {
        auth.logout();
        void router.navigate(['/login'], {
          queryParams: { authError: 'session-expired' },
          replaceUrl: true,
        });
      }
      return throwError(() => error);
    }),
  );
};
