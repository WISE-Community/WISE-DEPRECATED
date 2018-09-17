export class LibraryProject {
  id: number;
  name: string;
  implementationModel: string;
  metadata: any;
  notes: string;
  projectThumb: string;
  thumbStyle: any;
  type: string;
  visible: boolean = true;
  shared: boolean = false;

  constructor(jsonObject: any = {}) {
    for (let key of Object.keys(jsonObject)) {
      const value = jsonObject[key];
      this[key] = value;
    }
  }
}
