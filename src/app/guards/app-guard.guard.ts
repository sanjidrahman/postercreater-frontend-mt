import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const appGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const temp = localStorage.getItem('selectedTemp')
  if (temp) {
    return true
  } else {
    router.navigate(['/home'])
    return false
  }
};
