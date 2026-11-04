import { Component } from '@angular/core';
import { LayoutService } from './services/layout.service';
import { SessionService } from './services/session.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentYear = new Date().getFullYear();

  constructor(
    public session: SessionService,
    public layout: LayoutService,
    public toast: ToastService
  ) {}
}
