import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchPasswordsValidator(): ValidatorFn {
  return (control: AbstractControl): null | ValidationErrors => {
    const password = control.get('password')?.value;
    const confirmPassword = control?.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordMatch: true,
      };
    } else {
      return null;
    }
  };
}
