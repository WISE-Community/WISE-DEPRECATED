export class Course {
  id: string;
  name: string;
  section: string;
  constructor(jsonObject: any = {}) {
    for (const key of Object.keys(jsonObject)) {
      this[key] = jsonObject[key];
    }
  }
}
