import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component';
import { LoginComponent } from './modules/login/login/login.component';
import { MyTasksComponent } from './modules/tasks/my-tasks/my-tasks.component';
import { ReportComponent } from './modules/reports/report/report.component';
import { TaskFormComponent } from './modules/tasks/task-form/task-form.component';
import { TaskListComponent } from './modules/tasks/task-list/task-list.component';
import { UserListComponent } from './modules/users/user-list/user-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'MANAGER'] } },
  { path: 'tasks/new', component: TaskFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'MANAGER'] } },
  { path: 'tasks/:id/edit', component: TaskFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'MANAGER'] } },
  { path: 'my-tasks', component: MyTasksComponent, canActivate: [AuthGuard], data: { roles: ['EMPLOYEE'] } },
  { path: 'reports', component: ReportComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'MANAGER'] } },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
