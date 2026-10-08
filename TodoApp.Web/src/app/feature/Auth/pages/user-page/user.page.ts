import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth/auth.service';
import { UpdateUserProfile } from '../../../../core/auth/auth.models';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-user-page',
  styleUrl: './user.page.scss',
  templateUrl: './user.page.html',
})
export class UserPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form: UpdateUserProfile = {
    name: this.auth.currentUser()?.name ?? '',
    email: this.auth.currentUser()?.email ?? '',
    userName: this.auth.currentUser()?.userName ?? '',
  };
  readonly submitting = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');

  save(): void {
    this.submitting.set(true);
    this.message.set('');
    this.errorMessage.set('');
    this.auth
      .updateProfile(this.form)
      .pipe(
        take(1),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => this.message.set('Your profile has been updated.'),
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  backToTodoList(): void {
    void this.router.navigate(['/todo-list']);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body: unknown = error.error;
      if (typeof body === 'string' && body.trim()) {
        return body;
      }

      if (body && typeof body === 'object') {
        const errorBody = body as Record<string, unknown>;
        for (const key of ['message', 'error', 'title', 'detail']) {
          const value = errorBody[key];
          if (typeof value === 'string' && value.trim()) {
            return value;
          }
        }
      }
    }

    return error instanceof Error ? error.message : 'The profile could not be updated.';
  }
}
