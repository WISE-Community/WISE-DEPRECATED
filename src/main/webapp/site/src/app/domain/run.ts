import { Project } from "./project";
import { User } from "./user";

export class Run {
  id: number;
  name: string;
  runCode: string;
  startTime: number;
  endTime: number;
  projectThumb: string;
  numStudents: number;
  periods: string[];
  owner: User;
  sharedOwners: User[] = [];
  project: Project;

  static readonly VIEW_STUDENT_WORK_PERMISSION: number = 1;
  static readonly GRADE_AND_MANAGE_PERMISSION: number = 2;
  static readonly VIEW_STUDENT_NAMES_PERMISSION: number = 3;

  constructor(jsonObject: any = {}) {
    for (let key of Object.keys(jsonObject)) {
      const value = jsonObject[key];
      if (key == "owner") {
        this[key] = new User(value);
      } else if (key == "project") {
        this[key] = new Project(value);
      } else if (key == "sharedOwners") {
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
    return this.permissionHelper(userId, Run.VIEW_STUDENT_WORK_PERMISSION);
  }

  public canGradeAndManage(userId) {
    return this.permissionHelper(userId, Run.GRADE_AND_MANAGE_PERMISSION);
  }

  public canViewStudentNames(userId) {
    return this.permissionHelper(userId, Run.VIEW_STUDENT_NAMES_PERMISSION);
  }

  permissionHelper(userId, permissionId) {
    if (this.owner.id == userId) {
      return true;
    } else {
      for (let sharedOwner of this.sharedOwners) {
        if (sharedOwner.id == userId) {
          return this.userHasPermission(sharedOwner, permissionId);
        }
      }
    }
  }

  userHasPermission(user: User, permission: number) {
    return user.permissions.indexOf(permission) != -1;
  }
}
