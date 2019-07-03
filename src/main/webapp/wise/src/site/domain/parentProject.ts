export class ParentProject {
  id: number;
  title: string;
  authors: any[];
  uri: String;

  constructor(jsonObject: any = {}) {
    for (const key of Object.keys(jsonObject)) {
      this[key] = jsonObject[key];
    }
  }
}
