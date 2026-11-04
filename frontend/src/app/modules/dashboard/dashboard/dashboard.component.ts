import { Component, OnInit } from '@angular/core';
import { DashboardApi, TaskApi } from '../../../services/api.service';
import { DashboardStats, STATUSES, TaskStatus } from '../../../models/models';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  statuses = STATUSES;
  today = new Date();

  constructor(
    public session: SessionService, 
    private api: DashboardApi,
    private taskApi: TaskApi
  ) {}

  get subtitle(): string {
    switch (this.session.role) {
      case 'ADMIN': return 'System-wide analytics, users, and enterprise task metrics.';
      case 'MANAGER': return 'Team capacity, employee workload, and delegated task progress.';
      default: return 'Your assigned workload, deadlines, and personal task status.';
    }
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.api.stats().subscribe(s => {
      this.stats = s;
      this.ensureStatusCounts();
    });
  }

  private ensureStatusCounts(): void {
    if (!this.stats) return;

    // Check if tasksByStatus is null/missing or has all 0s
    const hasCounts = this.stats.tasksByStatus && 
      Object.values(this.stats.tasksByStatus).some(c => (c ?? 0) > 0);

    if (!hasCounts) {
      // Real-time fallback: fetch task list to compute accurate live counts
      this.taskApi.list({ status: '', priority: '', assigneeId: '' }).subscribe(tasks => {
        if (!this.stats) return;
        const counts: { [key: string]: number } = { PENDING: 0, IN_PROGRESS: 0, DONE: 0 };
        tasks.forEach(t => {
          if (t.status && counts[t.status] !== undefined) {
            counts[t.status]++;
          }
        });
        this.stats.tasksByStatus = counts;
      });
    }
  }

  count(status: string): number {
    const val = this.stats?.tasksByStatus?.[status];
    if (val !== undefined && val !== null) return val;
    if (status === 'DONE' && this.stats?.completedTasks !== undefined && this.stats?.completedTasks !== null) {
      return this.stats.completedTasks;
    }
    return 0;
  }

  get totalMyTasks(): number {
    if (!this.stats?.tasksByStatus) return 0;
    return Object.values(this.stats.tasksByStatus).reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
  }

  get completionPercentage(): number {
    const total = this.stats?.totalTasks || this.totalMyTasks;
    if (!total || total === 0) return 0;
    const done = this.stats?.completedTasks ?? this.count('DONE');
    return Math.round((done / total) * 100);
  }

  getStatusIcon(status: TaskStatus | string): string {
    switch (status) {
      case 'PENDING': return 'bi-hourglass-split';
      case 'IN_PROGRESS': return 'bi-arrow-repeat';
      case 'DONE': return 'bi-check2-circle';
      default: return 'bi-circle';
    }
  }
}
