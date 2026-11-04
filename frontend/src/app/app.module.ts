import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LabelPipe } from './pipes/label.pipe';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component';
import { LoginComponent } from './modules/login/login/login.component';
import { MyTasksComponent } from './modules/tasks/my-tasks/my-tasks.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { ReportComponent } from './modules/reports/report/report.component';
import { TaskFormComponent } from './modules/tasks/task-form/task-form.component';
import { TaskListComponent } from './modules/tasks/task-list/task-list.component';
import { UserListComponent } from './modules/users/user-list/user-list.component';

@NgModule({
  declarations: [
    AppComponent, 
    LabelPipe, 
    NavbarComponent, 
    SidebarComponent, 
    LoginComponent, 
    DashboardComponent,
    UserListComponent, 
    TaskListComponent, 
    TaskFormComponent, 
    MyTasksComponent, 
    ReportComponent
  ],
  imports: [
    BrowserModule, 
    HttpClientModule, 
    FormsModule, 
    ReactiveFormsModule, 
    AppRoutingModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}
