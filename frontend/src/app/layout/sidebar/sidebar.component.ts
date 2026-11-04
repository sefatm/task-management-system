import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../../services/layout.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnDestroy {
  private sub = new Subscription();

  constructor(
    public session: SessionService,
    public layout: LayoutService,
    private router: Router
  ) {
    // Automatically close sidebar drawer on mobile upon successful route change
    this.sub.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          if (typeof window !== 'undefined' && window.innerWidth < 992) {
            this.layout.setSidebarCollapsed(true);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
