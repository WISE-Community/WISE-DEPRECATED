import { Project } from '../../domain/project';

export class LibraryProject extends Project {
  notes: string;
  type: string;
  visible: boolean = true;
  shared: boolean = false;

  constructor(jsonObject: any = {}) {
    super();
    for (let key of Object.keys(jsonObject)) {
      const value = jsonObject[key];
      this[key] = value;
    }
  }
}
