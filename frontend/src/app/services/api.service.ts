import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStats, Page, Task, TaskFilter, TaskRequest, TaskStatus, User, UserRequest } from '../models/models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class UserApi {
  constructor(private http: HttpClient) {}

  list(q: string, page: number, size: number): Observable<Page<User>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<Page<User>>(`${API}/users`, { params });
  }
  create(body: UserRequest): Observable<User> { 
    return this.http.post<User>(`${API}/users`, body); 
  }
  update(id: number, body: UserRequest): Observable<User> { 
    return this.http.put<User>(`${API}/users/${id}`, body); 
  }
  remove(id: number): Observable<void> { 
    return this.http.delete<void>(`${API}/users/${id}`); 
  }
}

@Injectable({ providedIn: 'root' })
export class TaskApi {
  constructor(private http: HttpClient) {}

  list(filter: TaskFilter): Observable<Task[]> {
    let params = new HttpParams();
    if (filter.status) { 
      params = params.set('status', filter.status); 
    }
    if (filter.priority) { 
      params = params.set('priority', filter.priority); 
    }
    if (filter.assigneeId) { 
      params = params.set('assigneeId', filter.assigneeId); 
    }
    return this.http.get<Task[]>(`${API}/tasks`, { params });
  }
  get(id: number): Observable<Task> { 
    return this.http.get<Task>(`${API}/tasks/${id}`); 
  }
  assignees(): Observable<User[]> { 
    return this.http.get<User[]>(`${API}/tasks/assignees`); 
  }
  create(body: TaskRequest): Observable<Task> { 
    return this.http.post<Task>(`${API}/tasks`, body); 
  }
  update(id: number, body: TaskRequest): Observable<Task> { 
    return this.http.put<Task>(`${API}/tasks/${id}`, body); 
  }
  updateStatus(id: number, status: TaskStatus): Observable<Task> {
    return this.http.put<Task>(`${API}/tasks/${id}/status`, { status });
  }
  remove(id: number): Observable<void> { 
    return this.http.delete<void>(`${API}/tasks/${id}`); 
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  constructor(private http: HttpClient) {}
  stats(): Observable<DashboardStats> { 
    return this.http.get<DashboardStats>(`${API}/dashboard/stats`); 
  }
}

@Injectable({ providedIn: 'root' })
export class ReportApi {
  constructor(private http: HttpClient) {}
  tasksPdf(): Observable<Blob> { 
    return this.http.get(`${API}/reports/tasks/pdf`, { responseType: 'blob' }); 
  }
}

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  constructor(private http: HttpClient) {}
  get(): Observable<User> { return this.http.get<User>(`${API}/profile`); }
  update(fullName: string): Observable<User> { return this.http.put<User>(`${API}/profile`, { fullName }); }
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${API}/profile/password`, { currentPassword, newPassword });
  }
}

