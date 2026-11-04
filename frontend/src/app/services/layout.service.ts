import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  isCollapsed = typeof window !== 'undefined' ? window.innerWidth < 992 : false;
  readonly isSidebarCollapsed$ = new BehaviorSubject<boolean>(this.isCollapsed);
  readonly searchQuery$ = new BehaviorSubject<string>('');

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.isSidebarCollapsed$.next(this.isCollapsed);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.isCollapsed = collapsed;
    this.isSidebarCollapsed$.next(collapsed);
  }

  closeSidebarOnMobile(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      this.isCollapsed = true;
      this.isSidebarCollapsed$.next(true);
    }
  }

  setSearchQuery(q: string): void {
    this.searchQuery$.next(q);
  }
}
