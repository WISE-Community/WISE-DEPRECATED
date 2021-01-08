import { Project } from './project';
import { User } from './user';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export class Run {
  id: number;
  name: string;
  runCode: string;
  startTime: number;
  endTime: number;
  isLockedAfterEndDate: boolean;
  lastRun: string;
  projectThumb: string;
  numStudents: number;
  maxStudentsPerTeam: number;
  periods: string[];
  owner: User;
  sharedOwners: User[] = [];
  project: Project;
  private sharedOwners$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.sharedOwners);

  static readonly VIEW_STUDENT_WORK_PERMISSION: number = 1;
  static readonly GRADE_AND_MANAGE_PERMISSION: number = 2;
  static readonly VIEW_STUDENT_NAMES_PERMISSION: number = 3;

  constructor(jsonObject: any = {}) {
    for (let key of Object.keys(jsonObject)) {
      const value = jsonObject[key];
      if (key == 'owner') {
        this[key] = new User(value);
      } else if (key == 'project') {
        this[key] = new Project(value);
      } else if (key == 'sharedOwners') {
        const sharedOwners: User[] = [];
        for (let sharedOwner of value) {
          sharedOwners.push(new User(sharedOwner));
        }
        this[key] = sharedOwners;
      } else {
        this[key] = value;
      }
    }
  }

  public canViewStudentWork(userId) {
    return (
      this.isOwner(userId) ||
      this.isSharedOwnerWithPermission(userId, Run.VIEW_STUDENT_WORK_PERMISSION)
    );
  }

  public canGradeAndManage(userId) {
    return (
      this.isOwner(userId) ||
      this.isSharedOwnerWithPermission(userId, Run.GRADE_AND_MANAGE_PERMISSION)
    );
  }

  public canViewStudentNames(userId) {
    return (
      this.isOwner(userId) ||
      this.isSharedOwnerWithPermission(userId, Run.VIEW_STUDENT_NAMES_PERMISSION)
    );
  }

  isOwner(userId) {
    return this.owner.id == userId;
  }

  isSharedOwnerWithPermission(userId, permissionId) {
    for (const sharedOwner of this.sharedOwners) {
      if (sharedOwner.id == userId) {
        return this.userHasPermission(sharedOwner, permissionId);
      }
    }
    return false;
  }

  userHasPermission(user: User, permission: number) {
    return user.permissions.includes(permission);
  }

  isScheduled(now) {
    return now < this.startTime;
  }

  isActive(now) {
    return !this.isScheduled(now) && !this.isCompleted(now);
  }

  isCompleted(now) {
    if (this.hasEndTime()) {
      return this.endTime <= now;
    }
    return false;
  }

  hasEndTime() {
    return this.endTime != null;
  }
}
