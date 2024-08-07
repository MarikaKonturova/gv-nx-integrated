import { TestBed } from '@angular/core/testing';
import { ValidationErrors } from '@angular/forms';

import { PasswordsErrorsPipe } from './passwordsErrors.pipe';

describe('PasswordsErrorsPipe', () => {
  let pipe: PasswordsErrorsPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PasswordsErrorsPipe],
    });
    pipe = TestBed.inject(PasswordsErrorsPipe);
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('should return "Password is required." when the "required" error is true', () => {
    const errors: ValidationErrors = { required: true };
    expect(pipe.transform(errors)).toBe('Password is required.');
  });

  it('should return "The length of the password should be at least 6 characters." when the "minlength" error is true', () => {
    const errors: ValidationErrors = { minlength: true };
    expect(pipe.transform(errors)).toBe(
      'The length of the password should be at least 6 characters.'
    );
  });

  it('should return "Password should contain at least one lowercase character." when the "passwordStrength.hasLowerCase" error is true', () => {
    const errors: ValidationErrors = { passwordStrength: { hasLowerCase: true } };
    expect(pipe.transform(errors)).toBe(
      'Password should contain at least one lowercase character.'
    );
  });

  it('should return "Password should contain at least one numeric character." when the "passwordStrength.hasNumeric" error is true', () => {
    const errors: ValidationErrors = { passwordStrength: { hasNumeric: true } };
    expect(pipe.transform(errors)).toBe('Password should contain at least one numeric character.');
  });

  it('should return "Password should contain at least one uppercase character." when the "passwordStrength.hasUpperCase" error is true', () => {
    const errors: ValidationErrors = { passwordStrength: { hasUpperCase: true } };
    expect(pipe.transform(errors)).toBe(
      'Password should contain at least one uppercase character.'
    );
  });

  it('should return null when no errors are present', () => {
    const errors: ValidationErrors = {};
    expect(pipe.transform(errors)).toBeNull();
  });

  it('should return null when errors are null', () => {
    expect(pipe.transform(null)).toBeNull();
  });

  it('should return the first relevant error message', () => {
    const errors: ValidationErrors = {
      minlength: true,
      required: true,
    };
    expect(pipe.transform(errors)).toBe('Password is required.');
  });
});
