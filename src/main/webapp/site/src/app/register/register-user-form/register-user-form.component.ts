export class RegisterUserFormComponent {
  translateCreateAccountErrorMessageCode(messageCode: string) {
    switch (messageCode) {
      case 'invalidFirstAndLastName':
        return $localize`Error: First Name and Last Name must only contain characters A-Z`;
      case 'invalidFirstName':
        return $localize`Error: First Name must only contain characters A-Z`;
      case 'invalidLastName':
        return $localize`Error: Last Name must only contain characters A-Z`;
    }
    return messageCode;
  }
}
