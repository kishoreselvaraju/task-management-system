import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';

import { LoginComponent } from './login/login.component';
import { TasksComponent } from './tasks/tasks.component';
import { AuditComponent } from './audit/audit.component';

// 👇 Guard: must be logged in
export const authGuard = () => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      router.navigate(['/login']);
      return false;
    }
  } catch {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

// 👇 Guard: must be ADMIN or OWNER
export const roleGuard = () => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'ADMIN' || payload.role === 'OWNER') {
      return true;
    }
  } catch {
    // fall through
  }

  alert('You are not authorized to view this page');
  router.navigate(['/tasks']);
  return false;
};

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
  { path: 'audit', component: AuditComponent, canActivate: [roleGuard] },
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
];
