import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { clearAuth, login } from './auth-store/auth.actions';
import { AuthState } from './auth.interfaces';
import { LoginData, LoginResponse } from '../http/http.interfaces';
import { HttpBaseService } from '../http/http.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends HttpBaseService {
  constructor(private store: Store<AuthState>, private http: HttpClient) {
    super();
  }

  login(userData: LoginData): void {
    this.store.dispatch(login(userData));
  }

  postLogin(userData: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.BASIC_URL}/auth/login`,
      userData,
      this.httpOptions
    );
  }

  logout(): void {
    this.store.dispatch(clearAuth());
  }

  // Obtener el token almacenado en las cookies
  getToken(): string | null {
    return this.getCookie('access_token');
  }

  // Verifica si el token ha expirado
  isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(new Date().getTime() / 1000);
    console.log('Comparacion: ', decoded.exp, currentTime)
    return decoded.exp < currentTime;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}
