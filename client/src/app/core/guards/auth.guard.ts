import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { selectUser } from '../authentication/auth-store/auth.selectors';
import { AuthState } from '../authentication/auth.interfaces';
import { NotificationsService } from '../services/notifications.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private store: Store<AuthState>, private router: Router, private notificationsService: NotificationsService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store.select(selectUser).pipe(
      tap(user => {
        if (!user) {
          this.notificationsService.emitNotification(
            'Debes iniciar sesión para acceder a esta página.',
            'error',
            3000
          );
          this.router.navigate(['/login']);
        }
      }),
      map(user => !!user)
    );
  }
}
