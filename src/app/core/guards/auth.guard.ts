import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$().pipe(
      take(1),
      map((loggedIn) => {
        return loggedIn
          ? true
          : this.router.createUrlTree(['/login']);
      })
    );
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.checkLogin();
  }

  private checkLogin(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$().pipe(
      take(1),
      map((loggedIn) => {
        return loggedIn
          ? true
          : this.router.createUrlTree(['/login']);
      })
    );
  }
}
