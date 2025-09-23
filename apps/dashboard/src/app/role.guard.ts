import { inject } from '@angular/core';
import { Router } from '@angular/router';

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
  } catch (e) {
    console.error('Invalid token', e);
  }

  alert('❌ You are not authorized to view this page');
  router.navigate(['/tasks']);
  return false;
};
