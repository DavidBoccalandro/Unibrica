import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { loginFailure, loginSuccess } from './auth.actions';
import { NotificationsService } from '../../services/notifications.service';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType('[Login] Login Attempt'),
      switchMap(({ username, password }) =>
        this.authService.postLogin({ username, password }).pipe(
          map((loginResponse) => loginSuccess({
            user:{
              name:loginResponse.username,
              email: loginResponse.email,
              role:''}
          })),
          catchError((error) => of(loginFailure({ error: error.error.message || error.message})))
        )
      ),
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType('[Login] Login Success'),
        tap(() => {
          this.router.navigate(['/dashboard']);
          this.notificationService.emitNotification('Tus credenciales fueron correctas. Ingresaste exitosamente.', 'success', 2000);
        })
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginFailure),
        tap((action) => {
          throw new Error(action.error)
        })
      ),
    { dispatch: false }
  );

  tokenExpired$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType('[Auth] Clear Auth'),
        tap(() => {
          this.notificationService.emitNotification('Session expired', 'error');
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );


  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationsService
  ) {}
}
