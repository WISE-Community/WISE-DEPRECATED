import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Run } from "../../domain/run";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { TeacherService } from "../teacher.service";
import { Observable, timer } from 'rxjs';
import { map, startWith, debounce, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-share-run-dialog',
  templateUrl: './share-run-dialog.component.html',
  styleUrls: ['./share-run-dialog.component.scss']
})
export class ShareRunDialogComponent implements OnInit {

  @Input()
  run: Run;
  projectId: number;
  runId: number;
  teacherSearchControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  sharedOwners: any[] = [];

  constructor(public dialogRef: MatDialogRef<ShareRunDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private teacherService: TeacherService) {
    this.projectId = data.run.project.id;
    this.runId = data.run.id;

    this.teacherService.getRun(this.runId).subscribe((run: Run) => {
      this.run = run;
      this.populateSharedOwners(run.sharedOwners);
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
    this.addRunPermissions(sharedOwner);
    this.addProjectPermissions(sharedOwner);
  }

  addRunPermissions(sharedOwner) {
    this.setDefaultRunPermissions(sharedOwner);
    for (let permission of sharedOwner.permissions) {
      sharedOwner.runPermissions[permission] = true;
    }
  }

  setDefaultRunPermissions(sharedOwner) {
    sharedOwner.runPermissions = {
      1: true,  // View student work
      2: false,  // Grade and manage run
      3: false,  // View student names
      16: false  // Admin (read, write, share)
    };
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
      1: false,  // View the project
      2: false,  // View and edit the project
      16: false  // Admin (read, write, share)
    };
  }

  getSharedProjectOwner(userId) {
    for (let sharedOwner of this.run.project.sharedOwners) {
      if (sharedOwner.id == userId) {
        return sharedOwner;
      }
    }
    return { permissions: [] };
  }

  runPermissionChanged(sharedOwnerId, permissionId, isAddingPermission) {
    if (isAddingPermission) {
      this.teacherService.addSharedOwnerRunPermission(this.runId, sharedOwnerId, permissionId)
          .subscribe((response: any) => {
            if (response.status == "success") {
              this.addRunPermissionToSharedOwner(sharedOwnerId, permissionId);
            }
      })
    } else {
      this.teacherService.removeSharedOwnerRunPermission(this.runId, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status == "success") {
            this.removeRunPermissionFromSharedOwner(sharedOwnerId, permissionId);
          }
      })
    }
  }

  addRunPermissionToSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.runPermissions[permissionId] = true;
  }

  removeRunPermissionFromSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.runPermissions[permissionId] = false;
  }

  projectPermissionChanged(sharedOwnerId, permissionId, isAddingPermission) {
    if (isAddingPermission) {
      this.teacherService.addSharedOwnerProjectPermission(this.run.project.id, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status == "success") {
            this.addProjectPermissionToSharedOwner(sharedOwnerId, permissionId);
          }
        })
    } else {
      this.teacherService.removeSharedOwnerProjectPermission(this.run.project.id, sharedOwnerId, permissionId)
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

  shareRun() {
    const sharedOwnerUsername = this.teacherSearchControl.value;
    if (this.options.includes(sharedOwnerUsername) && !this.isSharedOwner(sharedOwnerUsername)) {
      this.teacherService.addSharedOwner(this.runId, sharedOwnerUsername)
          .subscribe((newSharedOwner) => {
        if (newSharedOwner != null) {
          this.setDefaultRunPermissions(newSharedOwner);
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

  unshareRun(sharedOwner) {
    this.teacherService.removeSharedOwner(this.runId, sharedOwner.username)
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
