import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserProfile } from '../../../../core/auth/auth.models';
import { UserPage } from './user.page';

describe('UserPage', () => {
  it('shows success and clears the saving state when the update responds', async () => {
    const update = new Subject<UserProfile>();
    const auth = {
      currentUser: () => null,
      updateProfile: vi.fn(() => update.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [UserPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserPage);
    fixture.detectChanges();
    fixture.componentInstance.save();

    expect(fixture.componentInstance.submitting()).toBe(true);

    update.next({
      userId: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      createdAt: '',
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.submitting()).toBe(false);
    expect(fixture.componentInstance.message()).toBe('Your profile has been updated.');
    expect(fixture.nativeElement.textContent).toContain('Your profile has been updated.');
  });

  it('shows the API error message and clears the saving state on failure', async () => {
    const auth = {
      currentUser: () => null,
      updateProfile: vi.fn(() =>
        throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Email is already in use.' } })),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [UserPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserPage);
    fixture.detectChanges();
    fixture.componentInstance.save();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitting()).toBe(false);
    expect(fixture.componentInstance.errorMessage()).toBe('Email is already in use.');
    expect(fixture.nativeElement.textContent).toContain('Email is already in use.');
  });
});
