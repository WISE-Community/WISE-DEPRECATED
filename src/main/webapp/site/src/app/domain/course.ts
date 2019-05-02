export class Course {
  id: string;
  name: string;
  descriptionHeading: string;
  constructor(jsonObject: any = {}) {
    for (const key of Object.keys(jsonObject)) {
      this[key] = jsonObject[key];
    }
  }
}
