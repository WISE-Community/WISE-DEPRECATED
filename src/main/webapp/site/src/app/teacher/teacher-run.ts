import { Run } from '../domain/run';

export class TeacherRun extends Run {
  isHighlighted: boolean;
  shared: boolean;

  constructor(jsonObject: any = {}) {
    super(jsonObject);
  }
}
