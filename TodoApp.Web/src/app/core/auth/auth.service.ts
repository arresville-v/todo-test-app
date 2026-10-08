import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../api-base-url';
import {
  LoginCredentials,
  LoginResponse,
  RegisterDetails,
  UpdateUserProfile,
  UserProfile,
} from './auth.models';

const tokenStorageKey = 'todo.accessToken';
const userStorageKey = 'todo.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(null);
  readonly currentUser = signal<UserProfile | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null && this.currentUser() !== null);
  private profileVerified = false;

  constructor() {
    this.restoreSession();
  }

  getAccessToken(): string | null {
    return this.token();
  }

  login(credentials: LoginCredentials): Observable<void> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      tap((response) => this.saveSession(response)),
      map(() => undefined),
    );
  }

  register(details: RegisterDetails): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${API_BASE_URL}/auth/register`, details);
  }

  updateProfile(details: UpdateUserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${API_BASE_URL}/auth/me`, details).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.storeUser(user);
      }),
    );
  }

  ensureAuthenticated(): Observable<boolean> {
    const token = this.token();
    if (!token || !this.isTokenCurrent(token)) {
      this.clearSession();
      return of(false);
    }

    if (this.profileVerified && this.currentUser()) {
      return of(true);
    }

    return this.http.get<UserProfile>(`${API_BASE_URL}/auth/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.storeUser(user);
        this.profileVerified = true;
      }),
      map(() => true),
      catchError((error: unknown) => {
        if (this.isInvalidSession(error)) {
          this.clearSession();
          return of(false);
        }
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.clearSession();
  }

  private restoreSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.sessionStorage.getItem(tokenStorageKey);
    const userJson = window.sessionStorage.getItem(userStorageKey);

    if (!token || !userJson || !this.isTokenCurrent(token)) {
      this.clearSession();
      return;
    }

    try {
      this.token.set(token);
      this.currentUser.set(JSON.parse(userJson) as UserProfile);
    } catch {
      this.clearSession();
    }
  }

  private saveSession(response: LoginResponse): void {
    this.token.set(response.token);
    this.currentUser.set(response.user);
    this.profileVerified = true;

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(tokenStorageKey, response.token);
      this.storeUser(response.user);
    }
  }

  private storeUser(user: UserProfile): void {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(userStorageKey, JSON.stringify(user));
    }
  }

  private clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.profileVerified = false;

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(tokenStorageKey);
      window.sessionStorage.removeItem(userStorageKey);
    }
  }

  private isTokenCurrent(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return false;
      }
      const decoded = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
      return typeof decoded.exp === 'number' && decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private isInvalidSession(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error.status === 401 || error.status === 404)
    );
  }
}
