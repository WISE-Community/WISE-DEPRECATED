import { FormGroup } from '@angular/forms';

export function passwordMatchValidator(passwordsFormGroup: FormGroup) {
  const newPassword = passwordsFormGroup.get('newPassword').value;
  const confirmNewPassword = passwordsFormGroup.get('confirmNewPassword').value;
  if (newPassword === confirmNewPassword) {
    return null;
  } else {
    const error = { passwordDoesNotMatch: true };
    passwordsFormGroup.controls['confirmNewPassword'].setErrors(error);
    return error;
  }
}
