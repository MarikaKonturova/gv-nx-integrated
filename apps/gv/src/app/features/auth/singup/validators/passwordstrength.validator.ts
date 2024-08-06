import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): null | ValidationErrors => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]+/.test(value);

    const hasLowerCase = /[a-z]+/.test(value);

    const hasNumeric = /[0-9]+/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;

    return !passwordValid
      ? {
          passwordStrength: {
            hasLowerCase: !hasLowerCase,
            hasNumeric: !hasNumeric,
            hasUpperCase: !hasUpperCase,
          },
        }
      : null;
  };
}
