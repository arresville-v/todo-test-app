import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const hadSession = auth.getAccessToken() !== null;

  return auth.ensureAuthenticated().pipe(
    map(
      (authenticated) =>
        authenticated ||
        router.createUrlTree(['/login'], {
          queryParams: hadSession ? { authError: 'session-expired' } : undefined,
        }),
    ),
  );
};
