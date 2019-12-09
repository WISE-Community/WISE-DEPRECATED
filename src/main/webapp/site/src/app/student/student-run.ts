import { Run } from '../domain/run';

export class StudentRun extends Run {
  periodName: string;
  maxStudentsPerTeam: number;
  teacherFirstname: string;
  teacherLastname: string;
  workgroupId: number;
  workgroupMembers: any;
  workgroupNames: string;
  status: string;
  messageCode: string;
  isHighlighted: boolean;
}
