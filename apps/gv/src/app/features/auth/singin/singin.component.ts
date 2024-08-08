import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@gv/core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, JsonPipe],
  selector: 'app-singin',
  standalone: true,
  templateUrl: './singin.component.html',
})
export class SinginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  serverError = signal<string>('');
  onSubmit(): void {
    this.authService.login(this.form.getRawValue()).subscribe({
      error: error => {
        this.serverError.set(error.error.message);
      },
      next: response => {
        this.authService.currentUserSig.set({
          email: response.user.email,
          id: response.user.id,
          username: response.user.username,
        });

        this.router.navigateByUrl('/map');
      },
    });
  }
}
