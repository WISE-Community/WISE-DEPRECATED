import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Project } from "../../../teacher/project";
import { Observable } from 'rxjs';
import { TeacherService } from "../../../teacher/teacher.service";
import { LibraryService } from "../../../services/library.service";
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-share-project-dialog',
  templateUrl: './share-project-dialog.component.html',
  styleUrls: ['./share-project-dialog.component.scss']
})
export class ShareProjectDialogComponent implements OnInit {

  project: Project;
  projectId: number;
  teacherSearchControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  sharedOwners: any[] = [];

  constructor(public dialogRef: MatDialogRef<ShareProjectDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private libraryService: LibraryService,
              private teacherService: TeacherService) {
    this.projectId = data.project.id;

    this.libraryService.getProjectInfo(this.projectId).subscribe((project: Project) => {
      this.project = project;
      this.populateSharedOwners(project.sharedOwners);
    });
    this.teacherService.retrieveAllTeacherUsernames().subscribe((teacherUsernames) => {
      this.options = teacherUsernames;
    })
  }

  ngOnInit() {
    this.filteredOptions = this.teacherSearchControl.valueChanges.pipe(
      debounceTime(1000),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    if (filterValue == '') {
      return [];
    }
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  populateSharedOwners(sharedOwners) {
    for (let sharedOwner of sharedOwners) {
      const localSharedOwner = JSON.parse(JSON.stringify(sharedOwner));
      this.populatePermissions(localSharedOwner);
      delete localSharedOwner.permissions;
      this.sharedOwners.push(localSharedOwner);
    }
  }

  populatePermissions(sharedOwner) {
    this.addProjectPermissions(sharedOwner);
  }

  addProjectPermissions(sharedOwner) {
    this.setDefaultProjectPermissions(sharedOwner);
    const sharedProjectOwner = this.getSharedProjectOwner(sharedOwner.id);
    for (let permission of sharedProjectOwner.permissions) {
      sharedOwner.projectPermissions[permission] = true;
    }
  }

  setDefaultProjectPermissions(sharedOwner) {
    sharedOwner.projectPermissions = {
      1: true,  // View the project
      2: false,  // Edit the project
      16: false  // Admin (read, write, share)
    };
  }

  getSharedProjectOwner(userId) {
    for (let sharedOwner of this.project.sharedOwners) {
      if (sharedOwner.id == userId) {
        return sharedOwner;
      }
    }
    return { permissions: [] };
  }

  projectPermissionChanged(sharedOwnerId, permissionId, isAddingPermission) {
    if (isAddingPermission) {
      this.teacherService.addSharedOwnerProjectPermission(this.project.id, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status == "success") {
            this.addProjectPermissionToSharedOwner(sharedOwnerId, permissionId);
          }
        })
    } else {
      this.teacherService.removeSharedOwnerProjectPermission(this.project.id, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status == "success") {
            this.removeProjectPermissionFromSharedOwner(sharedOwnerId, permissionId);
          }
        })
    }
  }

  addProjectPermissionToSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.projectPermissions[permissionId] = true;
  }

  removeProjectPermissionFromSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.projectPermissions[permissionId] = false;
  }

  getSharedOwner(sharedOwnerId): any {
    for (let sharedOwner of this.sharedOwners) {
      if (sharedOwner.id == sharedOwnerId) {
        return sharedOwner;
      }
    }
    return { permissions: [] };
  }

  shareProject() {
    const sharedOwnerUsername = this.teacherSearchControl.value;
    if (this.options.includes(sharedOwnerUsername) && !this.isSharedOwner(sharedOwnerUsername)) {
      this.teacherService.addSharedProjectOwner(this.project.id, sharedOwnerUsername)
        .subscribe((newSharedOwner) => {
          if (newSharedOwner != null) {
            this.setDefaultProjectPermissions(newSharedOwner);
            this.sharedOwners.push(newSharedOwner);
            this.teacherSearchControl.setValue('');
          }
        });
    } else {
      console.log("invalid username");
    }
  }

  isSharedOwner(username) {
    for (let sharedOwner of this.sharedOwners) {
      if (sharedOwner.username == username) {
        return true;
      }
    }
    return false;
  }

  unshareProject(sharedOwner) {
    this.teacherService.removeSharedProjectOwner(this.project.id, sharedOwner.username)
      .subscribe((response) => {
        this.removeSharedOwner(sharedOwner);
      });
  }

  removeSharedOwner(sharedOwner) {
    for (let i = 0; i < this.sharedOwners.length; i ++) {
      if (this.sharedOwners[i].id == sharedOwner.id) {
        this.sharedOwners.splice(i, 1);
        return;
      }
    }
  }

}
