import { Run } from "./run";
import { User } from "../domain/user";

export class Project {
  id: number;
  name: string;
  metadata: any;
  dateCreated: string;
  dateArchived: string;
  lastEdited: string;
  projectThumb: string;
  thumbStyle: any;
  isHighlighted: boolean;
  owner: User;
  sharedOwners: User[] = [];
  run: Run;
  parentId: number;

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
    return this.isOwner(userId) ||
        this.isSharedOwnerWithPermission(userId, Project.VIEW_PERMISSION);
  }

  public canEdit(userId) {
    return this.isOwner(userId) ||
        this.isSharedOwnerWithPermission(userId, Project.EDIT_PERMISSION);
  }

  public isChild() {
    return this.parentId != null;
  }

  isOwner(userId) {
    return this.owner.id == userId;
  }

  isSharedOwnerWithPermission(userId, permissionId) {
    for (let sharedOwner of this.sharedOwners) {
      if (sharedOwner.id == userId) {
        return this.userHasPermission(sharedOwner, permissionId);
      }
    }
    return false;
  }

  userHasPermission(user: User, permission: number) {
    return user.permissions.includes(permission);
  }
}
