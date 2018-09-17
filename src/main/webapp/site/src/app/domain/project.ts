import { Run } from "./run";

export class Project {
  id: number;
  dateArchived: string;
  dateCreated: string;
  lastEdited: string;
  name: string;
  metadata: any;
  projectThumb: string;
  sharedOwners: any[];
  thumbStyle: any;
  run: Run;
}
