import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@gv/environments/environment';

import { UserInterface } from '../interfaces/user.inteface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/User`;
  private http = inject(HttpClient);
  currentUserSig = signal<null | Omit<UserInterface, 'password'>>(null);
  login(user: { email: string; password: string }) {
    return this.http.post<{
      user: UserInterface;
    }>(`${this.apiUrl}/login`, {
      email: user.email,
      password: user.password,
    });
  }
  register(user: { email: string; password: string }) {
    return this.http.post<{
      refreshToken: string;
      user: UserInterface;
    }>(`${this.apiUrl}/login`, {
      email: user.email,
      password: user.password,
    });
  }
}
