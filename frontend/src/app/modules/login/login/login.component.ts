import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';

interface DemoRole {
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  label: string;
  email: string;
  pass: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  showPassword = false;
  rememberMe = true;

  demoRoles: DemoRole[] = [
    { role: 'ADMIN', label: 'Admin', email: 'admin@demo.com', pass: 'Admin@123' },
    { role: 'MANAGER', label: 'Manager', email: 'manager@demo.com', pass: 'Manager@123' },
    { role: 'EMPLOYEE', label: 'Employee', email: 'emp1@demo.com', pass: 'Emp@123' }
  ];

  selectedRole: DemoRole = this.demoRoles[0];

  form = this.fb.group({
    email: ['admin@demo.com', [Validators.required, Validators.email]],
    password: ['Admin@123', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private session: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.session.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const savedEmail = localStorage.getItem('tms.remember_email');
    if (savedEmail) {
      this.form.patchValue({ email: savedEmail });
      const matched = this.demoRoles.find(r => r.email === savedEmail);
      if (matched) {
        this.selectedRole = matched;
        this.form.patchValue({ password: matched.pass });
      }
    }
  }

  selectRole(role: DemoRole): void {
    this.selectedRole = role;
    this.form.patchValue({
      email: role.email,
      password: role.pass
    });
    this.form.markAsDirty();
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { email, password } = this.form.value;

    if (this.rememberMe && email) {
      localStorage.setItem('tms.remember_email', email);
    } else {
      localStorage.removeItem('tms.remember_email');
    }

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => (this.loading = false)
    });
  }
}
