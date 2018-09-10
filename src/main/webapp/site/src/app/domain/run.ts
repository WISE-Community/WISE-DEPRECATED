import { Project } from "../teacher/project";

export class Run {
  accessCode: string;
  endTime: number;
  id: number;
  name: string;
  projectId: number;
  projectThumb: string;
  startTime: number;
  numStudents: number;
  periods: string[];
  teacherFirstName: string;
  teacherLastName: string;
  teacherDisplayName: string;
  sharedOwners: any[] = [];
  project: Project;
}
