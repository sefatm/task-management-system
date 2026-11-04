import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SessionService } from './session.service';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'ASSIGNED' | 'COMPLETED' | 'IN_PROGRESS' | 'INFO';
  timestamp: number;
  read: boolean;
  targetRole?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'ALL';
  targetEmail?: string;
  targetUserId?: number;
  senderName?: string;
  route?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly STORAGE_KEY = 'taskflow_notifications_v1';
  private allNotifications: AppNotification[] = [];

  readonly notifications$ = new BehaviorSubject<AppNotification[]>([]);
  readonly unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private session: SessionService) {
    this.loadFromStorage();

    // Automatically seed realistic default notifications if first time
    if (this.allNotifications.length === 0) {
      this.seedInitialNotifications();
    }

    // Refresh when user session or login changes
    this.session.session$.subscribe(() => {
      this.refreshUserNotifications();
    });
  }

  private loadFromStorage(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        this.allNotifications = JSON.parse(raw);
      } catch {
        this.allNotifications = [];
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.allNotifications));
    this.refreshUserNotifications();
  }

  private seedInitialNotifications(): void {
    const now = Date.now();
    this.allNotifications = [
      {
        id: 'notif_seed_1',
        title: 'Task Completed',
        message: '"Clean up customer database" was marked as Done by Emma Employee.',
        type: 'COMPLETED',
        timestamp: now - 1000 * 60 * 35, // 35m ago
        read: false,
        targetRole: 'ALL',
        senderName: 'Emma Employee',
        route: '/tasks'
      },
      {
        id: 'notif_seed_2',
        title: 'New Task Assigned',
        message: 'You were assigned "Update onboarding checklist" by Mia Manager.',
        type: 'ASSIGNED',
        timestamp: now - 1000 * 60 * 60 * 2, // 2h ago
        read: false,
        targetRole: 'EMPLOYEE',
        senderName: 'Mia Manager',
        route: '/my-tasks'
      },
      {
        id: 'notif_seed_3',
        title: 'New Task Assigned',
        message: 'You were assigned "Prepare monthly sales report" by System Admin.',
        type: 'ASSIGNED',
        timestamp: now - 1000 * 60 * 60 * 5, // 5h ago
        read: false,
        targetRole: 'EMPLOYEE',
        senderName: 'System Admin',
        route: '/my-tasks'
      },
      {
        id: 'notif_seed_4',
        title: 'Task Completed',
        message: '"Prepare quarterly audit draft" was marked as Done by Evan Employee.',
        type: 'COMPLETED',
        timestamp: now - 1000 * 60 * 60 * 24, // 1 day ago
        read: true,
        targetRole: 'ALL',
        senderName: 'Evan Employee',
        route: '/tasks'
      }
    ];
    this.saveToStorage();
  }

  getUserNotifications(): AppNotification[] {
    const role = this.session.role;
    const email = this.session.email ? this.session.email.toLowerCase() : '';

    return this.allNotifications.filter(n => {
      // Direct recipient by email
      if (n.targetEmail && email && n.targetEmail.toLowerCase() === email) {
        return true;
      }
      // Employee role notifications
      if (n.targetRole === 'EMPLOYEE' && role === 'EMPLOYEE') {
        return true;
      }
      // Manager/Admin task completed notifications
      if (n.type === 'COMPLETED' && (role === 'ADMIN' || role === 'MANAGER')) {
        return true;
      }
      // Admin notifications
      if (n.targetRole === 'ADMIN' && role === 'ADMIN') {
        return true;
      }
      // Manager notifications
      if (n.targetRole === 'MANAGER' && role === 'MANAGER') {
        return true;
      }
      // Global broadcast notifications
      if (n.targetRole === 'ALL') {
        return true;
      }
      return false;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  refreshUserNotifications(): void {
    const userNotifs = this.getUserNotifications();
    this.notifications$.next(userNotifs);
    const unread = userNotifs.filter(n => !n.read).length;
    this.unreadCount$.next(unread);
  }

  // Action: Notify when task is assigned to an employee
  notifyTaskAssigned(taskTitle: string, assigneeName?: string, assigneeEmail?: string): void {
    const notif: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: 'New Task Assigned',
      message: `You were assigned "${taskTitle}" by ${this.session.name || 'your manager'}.`,
      type: 'ASSIGNED',
      timestamp: Date.now(),
      read: false,
      targetRole: 'EMPLOYEE',
      targetEmail: assigneeEmail,
      senderName: this.session.name,
      route: '/my-tasks'
    };
    this.allNotifications.unshift(notif);
    this.saveToStorage();
  }

  // Action: Notify when an employee completes a task
  notifyTaskCompleted(taskTitle: string, completedByName?: string): void {
    const worker = completedByName || this.session.name || 'An employee';
    const notif: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: 'Task Completed',
      message: `"${taskTitle}" was marked as Completed by ${worker}.`,
      type: 'COMPLETED',
      timestamp: Date.now(),
      read: false,
      targetRole: 'ALL', // delivers to Admin and Manager
      senderName: worker,
      route: '/tasks'
    };
    this.allNotifications.unshift(notif);
    this.saveToStorage();
  }

  // Action: Notify when an employee starts a task (In Progress)
  notifyTaskStarted(taskTitle: string, workerName?: string): void {
    const worker = workerName || this.session.name || 'An employee';
    const notif: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: 'Task In Progress',
      message: `${worker} started working on "${taskTitle}".`,
      type: 'IN_PROGRESS',
      timestamp: Date.now(),
      read: false,
      targetRole: 'ALL',
      senderName: worker,
      route: '/tasks'
    };
    this.allNotifications.unshift(notif);
    this.saveToStorage();
  }

  markAsRead(id: string): void {
    const item = this.allNotifications.find(n => n.id === id);
    if (item && !item.read) {
      item.read = true;
      this.saveToStorage();
    }
  }

  markAllAsRead(): void {
    const userNotifIds = new Set(this.getUserNotifications().map(n => n.id));
    this.allNotifications.forEach(n => {
      if (userNotifIds.has(n.id)) {
        n.read = true;
      }
    });
    this.saveToStorage();
  }

  clearAll(): void {
    const userNotifIds = new Set(this.getUserNotifications().map(n => n.id));
    this.allNotifications = this.allNotifications.filter(n => !userNotifIds.has(n.id));
    this.saveToStorage();
  }

  getTimeAgo(timestamp: number): string {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }
}
