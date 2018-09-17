import { Project } from "../../domain/project";

export class LibraryProject extends Project {
  implementationModel: string;
  notes: string;
  type: string;
  visible: boolean = true;
}
