import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { matchPasswordsValidator } from './validators/matchpasswords.validator';
import { passwordStrengthValidator } from './validators/passwordstrength.validator';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, JsonPipe],
  selector: 'app-singup',
  standalone: true,
  templateUrl: './singup.component.html',
})
export class SingupComponent {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],

    passwords: this.fb.nonNullable.group(
      {
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
        password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator()]],
      },
      {
        validators: [matchPasswordsValidator()],
      }
    ),
    userName: ['', [Validators.required]],
  });
  serverError = signal<string>('');

  onSubmit(): void {
    const form = this.form.getRawValue();
    const formToBackend = {
      email: form.email,
      password: form.passwords.password,
    };

    this.authService.login(formToBackend).subscribe({
      error: error => {
        this.serverError.set(error.error.message);
      },
      next: response => {
        this.authService.currentUserSig.set({
          email: response.user.email,
          id: response.user.id,
          username: response.user.username,
        });
        this.router.navigateByUrl('/');
      },
    });
  }
}
