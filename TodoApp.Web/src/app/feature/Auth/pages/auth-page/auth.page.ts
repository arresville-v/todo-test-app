import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoginCredentials, RegisterDetails } from '../../../../core/auth/auth.models';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-auth-page',
  styleUrl: './auth.page.scss',
  templateUrl: './auth.page.html',
})
export class AuthPage {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isRegisterPage = this.route.snapshot.data['mode'] === 'register';
  readonly registered = this.route.snapshot.queryParamMap.has('registered');
  readonly form: RegisterDetails = {
    name: '',
    userName: '',
    email: '',
    password: '',
  };
  readonly submitting = signal(false);
  readonly errorMessage = signal(
    this.route.snapshot.queryParamMap.get('authError') === 'session-expired'
      ? 'Your session expired. Please sign in again.'
      : '',
  );

  submit(): void {
    this.submitting.set(true);
    this.errorMessage.set('');

    if (this.isRegisterPage) {
      this.auth.register(this.form).subscribe({
        next: () => {
          void this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        },
        error: (error: unknown) => this.showError(error),
        complete: () => this.submitting.set(false),
      });
      return;
    }

    const credentials: LoginCredentials = {
      userName: this.form.userName,
      password: this.form.password,
    };
    this.auth.login(credentials).subscribe({
      next: () => void this.router.navigate(['/todo-list']),
      error: (error: unknown) => this.showError(error),
      complete: () => this.submitting.set(false),
    });
  }

  private showError(error: unknown): void {
    this.submitting.set(false);
    if (error instanceof HttpErrorResponse && error.status === 401 && !this.isRegisterPage) {
      this.errorMessage.set('Email or password is incorrect. Please try again.');
      return;
    }
    if (
      error instanceof HttpErrorResponse &&
      error.error &&
      typeof error.error === 'object' &&
      'error' in error.error
    ) {
      this.errorMessage.set(String(error.error.error));
      return;
    }
    this.errorMessage.set(
      error instanceof HttpErrorResponse
        ? `The request failed (HTTP ${error.status}). Please try again.`
        : error instanceof Error
          ? error.message
          : 'The request could not be completed.',
    );
  }
}
