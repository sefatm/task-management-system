import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../services/layout.service';
import { SessionService } from '../../services/session.service';
import { ToastService } from '../../services/toast.service';
import { ProfileApi } from '../../services/api.service';
import { AppNotification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  dropdownOpen = false;
  notificationsOpen = false;
  private sub = new Subscription();

  // Unified Profile Settings Modal
  showProfileSettingsModal = false;
  activeTab: 'info' | 'photo' | 'password' = 'info';

  savingProfile = false;
  savingPassword = false;

  // Password visibility flags
  showCurrentPw = false;
  showNewPw = false;
  showConfirmPw = false;

  // Profile Form
  profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: [{ value: '', disabled: true }]
  });

  // Password Form
  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    confirmPassword: ['', Validators.required]
  });

  previewPhotoUrl: string | null = null;

  // 6 Pro Preset Avatars
  presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  ];

  constructor(
    public session: SessionService,
    public auth: AuthService,
    public layout: LayoutService,
    public notifications: NotificationService,
    private profileApi: ProfileApi,
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd)
      ).subscribe((e: NavigationEnd) => {
        // Auto-clear search when landing on dashboard or creation/edit forms
        if (e.urlAfterRedirects === '/dashboard' || e.urlAfterRedirects.includes('/new') || e.urlAfterRedirects.includes('/edit')) {
          if (this.layout.searchQuery$.value) {
            this.layout.setSearchQuery('');
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSearchInput(value: string): void {
    this.layout.setSearchQuery(value);
    const url = this.router.url;
    // If user starts typing from a non-list page (like /dashboard), automatically route to the task view
    if (value.trim().length > 0 && !this.isSearchableRoute(url)) {
      const target = this.session.hasRole('ADMIN', 'MANAGER') ? '/tasks' : '/my-tasks';
      this.router.navigate([target]);
    }
  }

  onSearchEnter(): void {
    const url = this.router.url;
    if (!this.isSearchableRoute(url)) {
      const target = this.session.hasRole('ADMIN', 'MANAGER') ? '/tasks' : '/my-tasks';
      this.router.navigate([target]);
    }
  }

  clearSearch(): void {
    this.layout.setSearchQuery('');
  }

  private isSearchableRoute(url: string): boolean {
    return (url.startsWith('/tasks') && !url.includes('/new') && !url.includes('/edit'))
      || url.startsWith('/my-tasks')
      || url.startsWith('/users')
      || url.startsWith('/reports');
  }

  get userNotifications(): AppNotification[] {
    return this.notifications.getUserNotifications();
  }

  get unreadCount(): number {
    return this.userNotifications.filter(n => !n.read).length;
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
      this.notificationsOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.notificationsOpen = false;
    }
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.dropdownOpen = false;
    }
  }

  closeNotifications(): void {
    this.notificationsOpen = false;
  }

  onNotificationClick(n: AppNotification): void {
    this.notifications.markAsRead(n.id);
    this.notificationsOpen = false;
    if (n.route) {
      this.router.navigateByUrl(n.route);
    }
  }

  markAllRead(): void {
    this.notifications.markAllAsRead();
  }

  clearAll(): void {
    this.notifications.clearAll();
  }

  getTimeAgo(timestamp: number): string {
    return this.notifications.getTimeAgo(timestamp);
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'ASSIGNED': return 'bi-clipboard2-plus-fill';
      case 'COMPLETED': return 'bi-check2-circle';
      case 'IN_PROGRESS': return 'bi-arrow-repeat';
      default: return 'bi-bell-fill';
    }
  }

  getNotifIconClass(type: string): string {
    switch (type) {
      case 'ASSIGNED': return 'notif-icon-blue';
      case 'COMPLETED': return 'notif-icon-green';
      case 'IN_PROGRESS': return 'notif-icon-purple';
      default: return 'notif-icon-gray';
    }
  }

  // Open the unified profile settings modal
  openSettingsModal(tab: 'info' | 'photo' | 'password' = 'info'): void {
    this.closeDropdown();
    this.activeTab = tab;
    this.previewPhotoUrl = this.session.avatar;
    this.profileForm.patchValue({
      fullName: this.session.name,
      email: this.session.email
    });
    this.passwordForm.reset();
    this.showProfileSettingsModal = true;
  }

  closeSettingsModal(): void {
    this.showProfileSettingsModal = false;
  }

  // 1. Save Profile Info
  saveProfile(): void {
    if (this.profileForm.invalid) return;
    const newName = this.profileForm.get('fullName')?.value?.trim();
    if (newName) {
      this.savingProfile = true;
      this.profileApi.update(newName).subscribe({
        next: () => {
          this.savingProfile = false;
          this.session.updateName(newName);
          this.toast.success('Profile details updated successfully.');
          this.closeSettingsModal();
        },
        error: () => (this.savingProfile = false)
      });
    }
  }

  // 2. Photo upload and preset selection
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.toast.error('Image size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.previewPhotoUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  selectPresetAvatar(url: string): void {
    this.previewPhotoUrl = url;
  }

  savePhoto(): void {
    if (this.previewPhotoUrl) {
      this.session.setAvatar(this.previewPhotoUrl);
      this.toast.success('Profile photo updated.');
      this.closeSettingsModal();
    }
  }

  removePhoto(): void {
    this.previewPhotoUrl = null;
    this.session.setAvatar('');
    this.toast.success('Profile photo removed.');
    this.closeSettingsModal();
  }

  // 3. Change Password
  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toast.error('New password and confirm password do not match.');
      return;
    }
    this.savingPassword = true;
    this.profileApi.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordForm.reset();
        this.toast.success('Password updated successfully.');
        this.closeSettingsModal();
      },
      error: () => (this.savingPassword = false)
    });
  }

  // 4. Sign Out
  logout(): void {
    this.closeDropdown();
    this.auth.logout();
    this.toast.success('Signed out successfully.');
  }
}
