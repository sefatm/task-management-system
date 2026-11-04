import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TaskApi } from '../../../services/api.service';
import { PRIORITIES, STATUSES, Task, TaskFilter, TaskStatus, User } from '../../../models/models';
import { SessionService } from '../../../services/session.service';
import { ToastService } from '../../../services/toast.service';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  allTasks: Task[] = [];
  assignees: User[] = [];
  filter: TaskFilter = { status: '', priority: '', assigneeId: '' };
  statuses = STATUSES;
  priorities = PRIORITIES;
  loaded = false;
  page = 0;
  readonly pageSize = 10;
  readonly Math = Math;
  searchQuery = '';
  private sub = new Subscription();

  constructor(
    public session: SessionService, 
    private api: TaskApi, 
    private toast: ToastService,
    public layout: LayoutService,
    private route: ActivatedRoute
  ) {}

  get filteredTasks(): Task[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.allTasks.filter(t => {
      if (this.filter.status && t.status !== this.filter.status) return false;
      if (this.filter.priority && t.priority !== this.filter.priority) return false;
      if (this.filter.assigneeId && t.assignedToId !== +this.filter.assigneeId) return false;
      if (q) {
        const matchesTitle = !!t.title && t.title.toLowerCase().includes(q);
        const matchesDesc = !!t.description && t.description.toLowerCase().includes(q);
        const matchesAssignee = !!t.assignedToName && t.assignedToName.toLowerCase().includes(q);
        const matchesAssigner = !!t.assignedByName && t.assignedByName.toLowerCase().includes(q);
        const matchesStatus = !!t.status && (
          t.status.toLowerCase().includes(q) ||
          (t.status === 'IN_PROGRESS' && (q.includes('progress') || q.includes('in-progress') || q.includes('in progress')))
        );
        if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesAssigner && !matchesStatus) {
          return false;
        }
      }
      return true;
    });
  }

  get totalCount(): number { 
    return this.allTasks.length; 
  }
  get pendingCount(): number { 
    return this.allTasks.filter(t => t.status === 'PENDING').length; 
  }
  get inProgressCount(): number { 
    return this.allTasks.filter(t => t.status === 'IN_PROGRESS').length; 
  }
  get completedCount(): number { 
    return this.allTasks.filter(t => t.status === 'DONE').length; 
  }

  get paged(): Task[] { 
    return this.filteredTasks.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize); 
  }

  get totalPages(): number { 
    return Math.ceil(this.filteredTasks.length / this.pageSize); 
  }

  ngOnInit(): void {
    this.api.assignees().subscribe(a => (this.assignees = a));

    this.load();

    this.sub.add(
      this.route.queryParams.subscribe(params => {
        if (params['status']) {
          this.filter.status = params['status'];
          this.page = 0;
        }
      })
    );

    this.sub.add(
      this.layout.searchQuery$.pipe(debounceTime(200), distinctUntilChanged()).subscribe(q => {
        this.searchQuery = q;
        this.page = 0;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(): void {
    this.api.list({ status: '', priority: '', assigneeId: '' }).subscribe({
      next: (t) => {
        this.allTasks = t;
        this.loaded = true;
      },
      error: () => {
        this.loaded = true;
        this.toast.error('Failed to load tasks.');
      }
    });
  }

  setStatusTab(status: TaskStatus | ''): void {
    this.filter.status = status;
    this.page = 0;
  }

  resetFilter(): void {
    this.filter = { status: '', priority: '', assigneeId: '' };
    this.searchQuery = '';
    this.layout.setSearchQuery('');
    this.page = 0;
  }

  isOverdue(t: Task): boolean {
    return !!t.deadline && t.status !== 'DONE' && new Date(t.deadline + 'T23:59:59') < new Date();
  }

  remove(task: Task): void {
    if (!confirm(`Are you sure you want to delete task "${task.title}"?`)) { return; }
    this.api.remove(task.id).subscribe(() => {
      this.toast.success('Task deleted successfully.');
      this.load();
    });
  }
}
