import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme$ = new BehaviorSubject<string>('');
  applyTheme(theme: string) {
    this.theme$.next(theme);
    localStorage.setItem('theme', theme);
  }
  getInitialTheme(): string {
    return localStorage.getItem('theme') || 'forest';
  }
}
