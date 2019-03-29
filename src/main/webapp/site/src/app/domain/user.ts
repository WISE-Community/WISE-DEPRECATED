export class User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  language: string;
  permissions: number[];
  isRecaptchaRequired: boolean;
  isGoogleUser: boolean;

  constructor(jsonObject: any = {}) {
    for (let key of Object.keys(jsonObject)) {
      this[key] = jsonObject[key];
    }
  }
}
