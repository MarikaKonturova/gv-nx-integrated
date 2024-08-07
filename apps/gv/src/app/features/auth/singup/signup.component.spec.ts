// nx test gv --watch
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { SingupComponent } from './singup.component';

describe('SingupComponent', () => {
  let component: SingupComponent;
  let authService: {
    currentUserSig: {
      set: jest.Mock;
    };
    login: jest.Mock;
  };
  let router: Router;
  let fixture: ComponentFixture<SingupComponent>;

  beforeEach(() => {
    const authServiceMock = {
      currentUserSig: {
        set: jest.fn(),
      },
      login: jest.fn(),
    };

    const routerMock = {
      navigateByUrl: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SingupComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SingupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    //@ts-expect-error ts does not recognize jest mock types, but tests still work
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.form).toBeDefined();
    expect(component.form.controls.email).toBeDefined();
    expect(component.form.controls.userName).toBeDefined();
    expect(component.form.controls.passwords).toBeDefined();
  });

  it('should display server error on login failure', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authService.login.mockReturnValue(throwError(() => errorResponse));
    component.onSubmit();
    expect(authService.login).toHaveBeenCalled();
    expect(component.serverError()).toBe('Invalid credentials');
  });

  it('should navigate to home on successful login', () => {
    const response = {
      user: {
        email: 'test@example.com',
        id: '1',
        username: 'testuser',
      },
    };
    authService.login.mockReturnValue(of(response));

    component.form.setValue({
      email: 'test@example.com',
      passwords: {
        confirmPassword: 'password123',
        password: 'password123',
      },
      userName: 'testuser',
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(authService.currentUserSig.set).toHaveBeenCalledWith({
      email: response.user.email,
      id: response.user.id,
      username: response.user.username,
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });
  it('should be invalid if email is correct', () => {
    component.form.controls.email.setValue('test@example.com');
    expect(component.form.controls.email.valid).toBeTruthy();
  });

  it('should display error message if email is invalid or required', () => {
    component.form.controls.email.setValue('');

    component.form.controls.email.markAsTouched();
    component.form.controls.email.markAsDirty();
    fixture.detectChanges();

    const form = component.form;
    const emailControl = form.controls.email;
    expect(emailControl.errors?.['required']).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="email-required"]')?.textContent).toContain(
      'Email is required'
    );
    component.form.controls.email.markAsUntouched();
    component.form.controls.email.markAsPristine();
    fixture.detectChanges();

    component.form.controls.email.setValue('invalid-email');
    component.form.controls.email.markAsTouched();
    component.form.controls.email.markAsDirty();
    component.form.controls.email.updateValueAndValidity();
    fixture.detectChanges();

    expect(emailControl.errors?.['email']).toBeTruthy();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-testid="email-valid"]')?.textContent).toContain(
      'Please enter a valid email address'
    );
  });
  it('should display error message if userName is required', () => {
    component.form.controls.userName.setValue('');
    component.form.controls.userName.markAsTouched();
    component.form.controls.userName.markAsDirty();
    fixture.detectChanges();

    const form = component.form;
    const userNameControl = form.controls.email;
    expect(userNameControl.errors?.['required']).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="userName-required"]')?.textContent).toContain(
      'username is required'
    );
  });
});
