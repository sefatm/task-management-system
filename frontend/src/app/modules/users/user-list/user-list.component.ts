import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { UserApi } from '../../../services/api.service';
import { Page, ROLES, User } from '../../../models/models';
import { ToastService } from '../../../services/toast.service';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  data: Page<User> | null = null;
  managers: User[] = [];
  roles = ROLES;
  query = '';
  page = 0;
  readonly size = 10;

  showForm = false;
  saving = false;
  editing: User | null = null;
  search$ = new Subject<string>();
  private sub = new Subscription();

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6), Validators.maxLength(100)]],
    role: ['EMPLOYEE', Validators.required],
    managerId: [null as number | null]
  });

  constructor(
    private fb: FormBuilder, 
    private api: UserApi, 
    private toast: ToastService,
    private layout: LayoutService
  ) {}

  ngOnInit(): void {
    this.sub.add(this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      this.query = q;
      this.page = 0;
      this.load();
    }));

    // Listen to global topbar search as well
    this.sub.add(this.layout.searchQuery$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      this.query = q;
      this.page = 0;
      this.load();
    }));

    this.load();
    this.api.list('', 0, 200).subscribe(p => (this.managers = p.content.filter(u => u.role === 'MANAGER')));
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  load(): void { this.api.list(this.query, this.page, this.size).subscribe(p => (this.data = p)); }
  go(page: number): void { this.page = page; this.load(); }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  openForm(user: User | null): void {
    this.editing = user;
    this.form.reset({
      fullName: user?.fullName ?? '', email: user?.email ?? '', password: '',
      role: user?.role ?? 'EMPLOYEE', managerId: user?.managerId ?? null
    });
    // password is mandatory only when creating
    const pw = this.form.get('password')!;
    pw.setValidators(user ? [Validators.minLength(6), Validators.maxLength(100)]
                          : [Validators.required, Validators.minLength(6), Validators.maxLength(100)]);
    pw.updateValueAndValidity();
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const body = {
      fullName: v.fullName, email: v.email, role: v.role,
      password: v.password || undefined,
      managerId: v.role === 'EMPLOYEE' ? v.managerId : null
    };
    this.saving = true;
    const request = this.editing ? this.api.update(this.editing.id, body) : this.api.create(body);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.toast.success(this.editing ? 'User updated.' : 'User created.');
        this.load();
      },
      error: () => (this.saving = false)
    });
  }

  remove(user: User): void {
    if (!confirm(`Delete ${user.fullName}? They will no longer be able to sign in.`)) { return; }
    this.api.remove(user.id).subscribe(() => {
      this.toast.success('User deleted.');
      this.load();
    });
  }
}
