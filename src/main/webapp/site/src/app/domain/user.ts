export class User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  language: string;
  permissions: number[];

  constructor(jsonObject: any = {}) {
    for (let key of Object.keys(jsonObject)) {
      this[key] = jsonObject[key];
    }
  }
}
