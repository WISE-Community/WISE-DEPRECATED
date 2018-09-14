import { Run } from "../domain/run";
import { User } from "../domain/user";

export class Project {
  id: number;
  name: string;
  dateCreated: string;
  dateArchived: string;
  thumbIconPath: string;
  isHighlighted: boolean;
  owner: User;
  sharedOwners: User[] = [];
  metadata: object;

  static readonly VIEW_PERMISSION: number = 1;
  static readonly EDIT_PERMISSION: number = 2;

  constructor(jsonObject: any = {}) {
    for (let key of Object.keys(jsonObject)) {
      const value = jsonObject[key];
      if (key == "owner") {
        this[key] = new User(value);
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

  public canView(userId) {
    return this.permissionHelper(userId, Project.VIEW_PERMISSION);
  }

  public canEdit(userId) {
    return this.permissionHelper(userId, Project.EDIT_PERMISSION);
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
