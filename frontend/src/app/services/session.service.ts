import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoginResponse, Role } from '../models/models';

/**
 * Holds the login session (JWT + role + name + avatar). Kept separate from AuthService
 * so the HTTP interceptor can read the token without creating a circular dependency.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly KEY = 'tms.session';
  private readonly AVATAR_KEY = 'tms.avatar_';

  private cachedSession: LoginResponse | null = null;
  readonly session$ = new BehaviorSubject<LoginResponse | null>(null);
  readonly avatar$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const raw = localStorage.getItem(this.KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw) as LoginResponse;
        if (this.isValidToken(s?.token)) {
          this.cachedSession = s;
        } else {
          this.cachedSession = null;
          localStorage.removeItem(this.KEY);
        }
      } catch {
        this.cachedSession = null;
      }
    } else {
      this.cachedSession = null;
    }
    this.session$.next(this.cachedSession);
    this.refreshAvatar();
  }

  save(session: LoginResponse): void {
    this.cachedSession = session;
    localStorage.setItem(this.KEY, JSON.stringify(session));
    this.session$.next(session);
    this.refreshAvatar();
  }

  clear(): void {
    this.cachedSession = null;
    localStorage.removeItem(this.KEY);
    this.session$.next(null);
    this.avatar$.next(null);
  }

  get session(): LoginResponse | null {
    return this.cachedSession;
  }

  get token(): string | null { return this.cachedSession?.token ?? null; }
  get role(): Role | null { return this.cachedSession?.role ?? null; }
  get name(): string { return this.cachedSession?.name ?? ''; }

  get email(): string {
    const token = this.token;
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.sub || '';
    } catch {
      return '';
    }
  }

  get avatar(): string | null {
    const email = this.email || 'default';
    return localStorage.getItem(this.AVATAR_KEY + email);
  }

  setAvatar(dataUrl: string): void {
    const email = this.email || 'default';
    localStorage.setItem(this.AVATAR_KEY + email, dataUrl);
    this.avatar$.next(dataUrl);
  }

  updateName(newName: string): void {
    if (this.cachedSession) {
      this.cachedSession.name = newName;
      this.save(this.cachedSession);
    }
  }

  private refreshAvatar(): void {
    this.avatar$.next(this.avatar);
  }

  private isValidToken(token?: string | null): boolean {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isLoggedIn(): boolean {
    return !!this.cachedSession && this.isValidToken(this.cachedSession.token);
  }

  hasRole(...roles: Role[]): boolean {
    return !!this.role && roles.includes(this.role);
  }
}
