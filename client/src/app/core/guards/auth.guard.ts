import { Injectable } from '@angular/core';
import { AuthService } from '../authentication/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
  ) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    if (token && !this.authService.isTokenExpired(token)) {
      return true;
    } else {
      this.authService.logout();
      return false;
    }
  }
}
