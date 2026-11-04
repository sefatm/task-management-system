import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TaskApi } from '../../../services/api.service';
import { PRIORITIES, STATUSES, Task, TaskFilter, TaskStatus } from '../../../models/models';
import { ToastService } from '../../../services/toast.service';
import { LayoutService } from '../../../services/layout.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  filter: TaskFilter = { status: '', priority: '' };
  statuses = STATUSES;
  priorities = PRIORITIES;
  loaded = false;
  searchQuery = '';
  private sub = new Subscription();

  constructor(
    private api: TaskApi, 
    private toast: ToastService,
    public layout: LayoutService,
    private notifications: NotificationService,
    private route: ActivatedRoute
  ) {}

  get filteredTasks(): Task[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.tasks.filter(t => {
      // 1. Status Filter (tabs)
      if (this.filter.status && t.status !== this.filter.status) {
        return false;
      }

      // 2. Priority Filter (dropdown)
      if (this.filter.priority && t.priority !== this.filter.priority) {
        return false;
      }

      // 3. Search query
      if (q) {
        const matchesTitle = !!t.title && t.title.toLowerCase().includes(q);
        const matchesDesc = !!t.description && t.description.toLowerCase().includes(q);
        const matchesAssigner = !!t.assignedByName && t.assignedByName.toLowerCase().includes(q);
        const matchesPriority = !!t.priority && t.priority.toLowerCase().includes(q);
        const matchesStatus = !!t.status && (
          t.status.toLowerCase().includes(q) ||
          (t.status === 'IN_PROGRESS' && (q.includes('progress') || q.includes('in-progress') || q.includes('in progress')))
        );
        if (!matchesTitle && !matchesDesc && !matchesAssigner && !matchesPriority && !matchesStatus) {
          return false;
        }
      }

      return true;
    });
  }

  get totalCount(): number {
    return this.tasks.length;
  }

  get pendingCount(): number {
    return this.tasks.filter(t => t.status === 'PENDING').length;
  }

  get inProgressCount(): number {
    return this.tasks.filter(t => t.status === 'IN_PROGRESS').length;
  }

  get completedCount(): number {
    return this.tasks.filter(t => t.status === 'DONE').length;
  }

  get completionPercentage(): number {
    if (this.totalCount === 0) return 0;
    return Math.round((this.completedCount / this.totalCount) * 100);
  }

  ngOnInit(): void { 
    this.load(); 
    this.sub.add(
      this.route.queryParams.subscribe(params => {
        if (params['status']) {
          this.filter.status = params['status'];
        }
      })
    );
    this.sub.add(
      this.layout.searchQuery$.pipe(debounceTime(200), distinctUntilChanged()).subscribe(q => {
        this.searchQuery = q;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(): void {
    // Load all tasks for the logged-in employee so badges and metrics remain accurate
    this.api.list({ status: '', priority: '', assigneeId: '' }).subscribe({
      next: (t) => {
        this.tasks = t;
        this.loaded = true;
      },
      error: () => {
        this.loaded = true;
        this.toast.error('Failed to load your tasks.');
      }
    });
  }

  setStatusTab(status: TaskStatus | ''): void {
    this.filter.status = status;
  }

  resetFilter(): void {
    this.filter = { status: '', priority: '' };
    this.searchQuery = '';
    this.layout.setSearchQuery('');
  }

  next(t: Task): TaskStatus | null { 
    return STATUSES[STATUSES.indexOf(t.status) + 1] ?? null; 
  }

  overdue(t: Task): boolean {
    return !!t.deadline && t.status !== 'DONE' && new Date(t.deadline + 'T23:59:59') < new Date();
  }

  advance(t: Task, status: TaskStatus): void {
    this.api.updateStatus(t.id, status).subscribe({
      next: () => {
        if (status === 'DONE') {
          this.notifications.notifyTaskCompleted(t.title, t.assignedToName);
        } else if (status === 'IN_PROGRESS') {
          this.notifications.notifyTaskStarted(t.title, t.assignedToName);
        }
        this.toast.success(status === 'IN_PROGRESS' ? 'Task started: moved to In Progress' : 'Great job! Task marked as Done');
        this.load();
      }
    });
  }
}
