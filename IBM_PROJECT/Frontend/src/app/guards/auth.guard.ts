import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map,take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const AuthGuard: CanActivateFn = (): Observable<boolean | import("@angular/router").UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthState().pipe(
    take(1),
    map(isLoggedIn => {
      console.log('AuthGuard Check:', isLoggedIn); // Debugging log
      return isLoggedIn ? true : router.createUrlTree(['/login']);
    })
  );
};
