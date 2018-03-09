import { Run } from '../domain/run';

export class StudentRun extends Run {
  periodName: string;
  teacherFirstname: string;
  teacherLastname: string;
  workgroupId: number;
  workgroupMembers: any;
  workgroupNames: string;
}
