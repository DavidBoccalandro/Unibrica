import { createReducer, on } from '@ngrx/store';

import { AuthState } from '../auth.interfaces';
import * as AuthActions from './auth.actions';


export const initialAuthState: AuthState = {
  error: null,
  isLoading: false,
  user: null
};

export const AuthReducer = createReducer(initialAuthState,
  on(AuthActions.login, state => ({ ...state, isLoading: true })),
  on(AuthActions.loginSuccess, (state, { user }) => ({ ...state, error: null, user, isLoading: false })),
  on(AuthActions.loginFailure, (_state, { error }) => ({ error, token: null, isLoading: false, user: null })),
  on(AuthActions.clearAuth, () => (initialAuthState)),
  on(AuthActions.logout, () => (initialAuthState))
);
