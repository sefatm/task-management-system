import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Role } from './models/models';
import { SessionService } from './services/session.service';

/** Route guard: must be logged in, and (when the route lists `data.roles`) hold one of those roles. */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.session.isLoggedIn()) {
      this.session.clear();
      return this.router.parseUrl('/login');
    }
    const roles = route.data['roles'] as Role[] | undefined;
    if (roles && !this.session.hasRole(...roles)) {
      return this.router.parseUrl('/dashboard');
    }
    return true;
  }
}
