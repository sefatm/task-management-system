import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast { id: number; type: 'success' | 'danger'; message: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts$ = new BehaviorSubject<Toast[]>([]);
  private seq = 0;

  success(message: string): void { this.push('success', message); }
  error(message: string): void { this.push('danger', message); }

  dismiss(id: number): void { this.toasts$.next(this.toasts$.value.filter(t => t.id !== id)); }

  private push(type: Toast['type'], message: string): void {
    const toast: Toast = { id: ++this.seq, type, message };
    this.toasts$.next([...this.toasts$.value, toast]);
    setTimeout(() => this.dismiss(toast.id), 4500);
  }
}
