import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { Store } from '@ngrx/store';
import { AuthState } from '../authentication/auth.interfaces';
import { NotificationsService } from '../services/notifications.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    notificationsService: NotificationsService
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
