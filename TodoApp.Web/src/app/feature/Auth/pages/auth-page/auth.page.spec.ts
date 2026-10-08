import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthPage } from './auth.page';

describe('AuthPage', () => {
  it('shows a helpful message when login returns 401', async () => {
    const auth = {
      login: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 401 }))),
      register: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode: 'login' },
              queryParamMap: { has: () => false, get: () => null },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AuthPage);
    fixture.detectChanges();
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(auth.login).toHaveBeenCalled();
    expect(fixture.componentInstance.errorMessage()).toBe('Email or password is incorrect. Please try again.');
    expect(fixture.nativeElement.textContent).toContain('Email or password is incorrect.');
  });

  it('shows an expired-session message when redirected after unauthorized API response', async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { login: vi.fn(), register: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode: 'login' },
              queryParamMap: { has: () => false, get: () => 'session-expired' },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AuthPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Your session expired. Please sign in again.');
  });
});
