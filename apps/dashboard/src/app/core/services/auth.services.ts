import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { Router }                       from '@angular/router';
import { tap }                          from 'rxjs/operators';
import { environment }                  from '../../../environments/environment';
import {
  User, LoginResponse, Role
} from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

const TOKEN_KEY = 'rbac_access_token';
const USER_KEY  = 'rbac_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl;
  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  private _token       = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  currentUser  = computed(() => this._currentUser());
  isLoggedIn   = computed(() => !!this._token());
  isOwner      = computed(() => this._currentUser()?.role === Role.OWNER);
  isAdmin      = computed(() => this._currentUser()?.role === Role.ADMIN);
  isViewer     = computed(() => this._currentUser()?.role === Role.VIEWER);
  canManage    = computed(() =>
    this._currentUser()?.role === Role.OWNER ||
    this._currentUser()?.role === Role.ADMIN
  );

  register(data: {
    name:           string;
    email:          string;
    password:       string;
    role:           string;
    organizationId: number;
    teamId?:        number;
    }) {
    return this.http
        .post<any>(`${this.api}/auth/register`, data)
        .pipe(
          tap(res => {
            this._token.set(res.access_token);
            localStorage.setItem(TOKEN_KEY, res.access_token);
            const user = this.decodeToken(res.access_token);
            this._currentUser.set(user);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
          }),
        );
  }
  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.api}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          this._token.set(res.access_token);
          localStorage.setItem(TOKEN_KEY, res.access_token);
          const user = this.decodeToken(res.access_token);
          this._currentUser.set(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }),
      );
  }

  logout() {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private decodeToken(token: string): User {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id:             payload.sub,
      email:          payload.email,
      role:           payload.role,
      organizationId: payload.organizationId,
      teamId:         payload.teamId,
      name:           payload.name ?? payload.email,
      createdAt:      new Date().toISOString(),
    };
  }

  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}