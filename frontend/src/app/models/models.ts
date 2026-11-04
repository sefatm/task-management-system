export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export const STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];
export const ROLES: Role[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

export interface LoginResponse { 
  token: string; 
  role: Role; 
  name: string; 
}

export interface User {
  id: number; 
  fullName: string; 
  email: string; 
  role: Role;
  managerId: number | null; 
  managerName: string | null; 
  active: boolean; 
  createdAt: string;
}

export interface UserRequest {
  fullName: string; 
  email: string; 
  password?: string; 
  role: Role; 
  managerId: number | null;
}

export interface Page<T> { 
  content: T[]; 
  totalElements: number; 
  totalPages: number; 
  number: number; 
  size: number; }

export interface Task {
  id: number; 
  title: string; 
  description: string | null; 
  status: TaskStatus; 
  priority: Priority;
  deadline: string | null; 
  assignedToId: number; 
  assignedToName: string;
  assignedById: number; 
  assignedByName: string; 
  createdAt: string; 
  updatedAt: string | null;
}

export interface TaskRequest {
  title: string; 
  description: string | null; 
  deadline: string | null; 
  priority: Priority; 
  assignedTo: number;
}

export interface TaskFilter { 
  status?: TaskStatus | ''; 
  priority?: Priority | ''; 
  assigneeId?: number | ''; 
}

export interface DashboardStats {
  totalUsers: number | null; 
  totalTasks: number | null; 
  completedTasks: number | null;
  teamSize: number | null; 
  tasksByStatus: Record<string, number> | null;
}
