import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Priority, Task, TaskStatus, PRIORITIES, STATUSES } from '../../../models/models';
import { ReportApi, TaskApi } from '../../../services/api.service';
import { SessionService } from '../../../services/session.service';
import { ToastService } from '../../../services/toast.service';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  loading = false;
  loadingTable = true;

  // Live filter states
  searchQuery = '';
  selectedStatus: TaskStatus | '' = '';
  selectedPriority: Priority | '' = '';

  // Pagination
  page = 0;
  readonly pageSize = 10;
  readonly Math = Math;

  readonly statuses = STATUSES;
  readonly priorities = PRIORITIES;
  private sub = new Subscription();

  constructor(
    public session: SessionService,
    private reportApi: ReportApi,
    private taskApi: TaskApi,
    private toast: ToastService,
    public layout: LayoutService
  ) {}

  ngOnInit(): void {
    this.loadData();
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

  loadData(): void {
    this.loadingTable = true;
    this.taskApi.list({ status: '', priority: '', assigneeId: '' }).subscribe({
      next: (t) => {
        this.tasks = t;
        this.loadingTable = false;
      },
      error: () => {
        this.loadingTable = false;
        this.toast.error('Failed to load audit records.');
      }
    });
  }

  get filteredTasks(): Task[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.tasks.filter(t => {
      const matchSearch = !q ||
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(q)) ||
        (t.assignedByName && t.assignedByName.toLowerCase().includes(q));

      const matchStatus = !this.selectedStatus || t.status === this.selectedStatus;
      const matchPriority = !this.selectedPriority || t.priority === this.selectedPriority;

      return matchSearch && matchStatus && matchPriority;
    });
  }

  get pagedTasks(): Task[] {
    return this.filteredTasks.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTasks.length / this.pageSize) || 1;
  }

  get doneCount(): number {
    return this.tasks.filter(t => t.status === 'DONE').length;
  }

  get inProgressCount(): number {
    return this.tasks.filter(t => t.status === 'IN_PROGRESS').length;
  }

  get pendingCount(): number {
    return this.tasks.filter(t => t.status === 'PENDING').length;
  }

  get completionPercentage(): number {
    if (!this.tasks.length) return 0;
    return Math.round((this.doneCount / this.tasks.length) * 100);
  }

  isOverdue(t: Task): boolean {
    return !!t.deadline && t.status !== 'DONE' && new Date(t.deadline + 'T23:59:59') < new Date();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.layout.setSearchQuery('');
    this.page = 0;
  }

  download(): void {
    this.loading = true;
    this.reportApi.tasksPdf().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task-report.pdf';
        a.click();
        URL.revokeObjectURL(url);
        this.loading = false;
        this.toast.success('PDF report downloaded successfully.');
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to download PDF report.');
      }
    });
  }
}
