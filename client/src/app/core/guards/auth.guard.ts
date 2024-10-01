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
console.log('token1000: ', token)
    if (token && !this.authService.isTokenExpired(token)) {
      console.log('Devuelve true')
      return true;
    } else {
      console.log('Devuelve false')
      this.authService.logout();
      return false;
    }
  }
}
