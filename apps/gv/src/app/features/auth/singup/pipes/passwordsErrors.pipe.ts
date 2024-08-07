import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'passwordsErrors',
  standalone: true,
})
export class PasswordsErrorsPipe implements PipeTransform {
  transform(passwordErrors: null | ValidationErrors): null | string {
    if (passwordErrors?.['required']) {
      return 'Password is required.';
    }
    if (passwordErrors?.['minlength']) {
      return 'The length of the password should be at least 6 characters.';
    }
    if (passwordErrors?.['passwordStrength']) {
      if (passwordErrors['passwordStrength'].hasLowerCase) {
        return 'Password should contain at least one lowercase character.';
      }
      if (passwordErrors['passwordStrength'].hasNumeric) {
        return 'Password should contain at least one numeric character.';
      }
      if (passwordErrors['passwordStrength'].hasUpperCase) {
        return 'Password should contain at least one uppercase character.';
      }
    }

    return null;
  }
}
