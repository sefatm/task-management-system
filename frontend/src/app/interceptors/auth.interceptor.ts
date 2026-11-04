import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessionService } from '../services/session.service';
import { ToastService } from '../services/toast.service';

/** Attaches the JWT to every API call and turns any HTTP error into a toast (401 also logs the user out). */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private session: SessionService, private router: Router, private toast: ToastService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.session.token;
    const authReq = token && req.url.startsWith(environment.apiUrl)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        const isLogin = req.url.endsWith('/auth/login');
        if (err.status === 401 && !isLogin) {
          this.session.clear();                                  // token expired / invalid -> logout
          this.router.navigate(['/login']);
          this.toast.error('Your session has expired. Please sign in again.');
        } else {
          this.toast.error(this.messageOf(err));
        }
        return throwError(() => err);
      })
    );
  }

  private messageOf(err: HttpErrorResponse): string {
    if (err.status === 0) { 
      return 'Cannot reach the server. Check your connection and try again.'; 
    }
    if (err.error instanceof Blob) { 
      return 'The request failed. Please try again.'; 
    }
    return err.error?.message || 'Something went wrong. Please try again.';
  }
}
