import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskApi } from '../../../services/api.service';
import { PRIORITIES, TaskRequest, User } from '../../../models/models';
import { ToastService } from '../../../services/toast.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  id: number | null = null;
  assignees: User[] = [];
  priorities = PRIORITIES;
  saving = false;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    deadline: [''],
    priority: ['MEDIUM', Validators.required],
    assignedTo: [null as number | null, Validators.required]
  });

  constructor(
    private fb: FormBuilder, 
    private api: TaskApi, 
    private route: ActivatedRoute,
    private router: Router, 
    private toast: ToastService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) || null;
    this.api.assignees().subscribe(a => (this.assignees = a));
    if (this.id) {
      this.api.get(this.id).subscribe(t => this.form.patchValue({
        title: t.title, description: t.description ?? '', deadline: t.deadline ?? '',
        priority: t.priority, assignedTo: t.assignedToId
      }));
    }
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const body: TaskRequest = {
      title: v.title, description: v.description || null, deadline: v.deadline || null,
      priority: v.priority, assignedTo: v.assignedTo
    };
    this.saving = true;
    const request = this.id ? this.api.update(this.id, body) : this.api.create(body);
    request.subscribe({
      next: () => {
        const targetUser = this.assignees.find(a => a.id === v.assignedTo);
        this.notifications.notifyTaskAssigned(v.title, targetUser?.fullName, targetUser?.email);
        this.toast.success(this.id ? 'Task updated.' : 'Task assigned.');
        this.router.navigate(['/tasks']);
      },
      error: () => (this.saving = false)
    });
  }
}
