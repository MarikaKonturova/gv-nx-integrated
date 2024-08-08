// nx test gv --watch
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
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
  let debugElement: DebugElement;

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

    debugElement = fixture.debugElement;

    router = TestBed.inject(Router);

    //@ts-expect-error ts does not recognize jest mock types, but tests still work
    authService = TestBed.inject(AuthService);

    fixture.autoDetectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    const { email, passwords, userName } = component.form.controls;

    expect(component.form).toBeDefined();

    expect(email).toBeDefined();

    expect(userName).toBeDefined();

    expect(passwords).toBeDefined();

    expect(email.errors).not.toBeNull();

    expect(userName.errors).not.toBeNull();

    expect(passwords?.controls.password?.errors).not.toBeNull();

    expect(passwords?.controls.confirmPassword?.errors).not.toBeNull();

    expect(email.errors?.['required']).toBeTruthy();

    expect(userName.errors?.['required']).toBeTruthy();

    expect(passwords.controls.password?.errors?.['required']).toBeTruthy();

    expect(passwords.controls.confirmPassword?.errors?.['required']).toBeTruthy();
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
    const emailFormControl = component.form.controls.email;

    emailFormControl.setValue('test@example.com');

    expect(emailFormControl.valid).toBeTruthy();
  });

  it('should display error message if email is invalid or required', async () => {
    const emailFormControl = component.form.controls.email;

    //const emailForm = debugElement.query(By.css('[data-testid="email"]'));
    //emailForm.triggerEventHandler('input', '');
    emailFormControl.markAsTouched();

    emailFormControl.markAsDirty();

    await fixture.whenStable();

    const form = component.form;
    const emailControl = form.controls.email;

    expect(emailControl.errors?.['required']).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="email-required"]')?.textContent).toContain(
      'Email is required'
    );

    emailFormControl.markAsUntouched();

    emailFormControl.markAsPristine();

    await fixture.whenStable();

    emailFormControl.setValue('invalid-email');

    emailFormControl.markAsTouched();

    emailFormControl.markAsDirty();

    emailFormControl.updateValueAndValidity();

    await fixture.whenStable();

    expect(emailControl.errors?.['email']).toBeTruthy();

    expect(compiled.querySelector('[data-testid="email-valid"]')?.textContent).toContain(
      'Please enter a valid email address'
    );
  });

  it('should display error message if userName is required', async () => {
    const userNameFormControl = component.form.controls.userName;

    userNameFormControl.setValue('');

    userNameFormControl.markAsTouched();

    userNameFormControl.markAsDirty();

    await fixture.whenStable();

    const form = component.form;
    const userNameControl = form.controls.email;

    expect(userNameControl.errors?.['required']).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;

    debugElement.query(By.css('[data-testid="userName-required"]'));

    expect(compiled.querySelector('[data-testid="userName-required"]')?.textContent).toContain(
      'username is required'
    );

    expect(debugElement.nativeElement.textContent).toContain('username is required');
  });

  it('should display server error on login failure', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };

    authService.login.mockReturnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();

    expect(component.serverError()).toBe('Invalid credentials');
  });
});
