import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Project } from "../project";
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
  project: Project;
  teacherName: string;
  ownerName: string;
  myControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  constructor(public dialogRef: MatDialogRef<ShareRunDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private teacherService: TeacherService) {
    this.project = data.project;
    this.ownerName = data.owner
    for (let sharedOwner of this.project.run.sharedOwners) {
      this.populatePermissionsObj(sharedOwner);
    }
    this.teacherService.retrieveAllTeacherUsernames().subscribe((teacherUsernames) => {
      this.options = teacherUsernames;
    })
  }

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
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

  permissionChanged(sharedOwnerId, permissionId, isAddingPermission) {
    console.log(sharedOwnerId, permissionId, isAddingPermission);
    if (isAddingPermission) {
      this.teacherService.addSharedPermissionToRun(this.project.run.id, sharedOwnerId, permissionId)
          .subscribe((response) => {
            if (response.status == "success") {
              this.addPermissionToSharedOwner(sharedOwnerId, permissionId);
            }
      })
    } else {
      this.teacherService.removeSharedPermissionFromRun(this.project.run.id, sharedOwnerId, permissionId)
        .subscribe((response) => {
          if (response.status == "success") {
            this.removePermissionFromSharedOwner(sharedOwnerId, permissionId);
          }
      })
    }
  }

  addPermissionToSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.permissions.push(permissionId);
  }

  removePermissionFromSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    const indexOfPermission = sharedOwner.permissions.indexOf(permissionId);
    sharedOwner.permissions.splice(indexOfPermission, 1);
  }

  getSharedOwner(sharedOwnerId) {
    for (let sharedOwner of this.project.run.sharedOwners) {
      if (sharedOwner.id == sharedOwnerId) {
        return sharedOwner;
      }
    }
    return { permissions: [] };
  }

  addSharedOwner() {
    const sharedOwnerUsername = this.myControl.value;
    if (this.options.includes(sharedOwnerUsername) && !this.isSharedOwner(sharedOwnerUsername)) {
      this.teacherService.addSharedOwner(this.project.run.id, sharedOwnerUsername)
          .subscribe((newSharedOwner) => {
        if (newSharedOwner != null) {
          this.populatePermissionsObj(newSharedOwner);
          this.project.run.sharedOwners.push(newSharedOwner);
          this.myControl.value = '';
        }
      });
    } else {
      console.log("invalid username");
    }
  }

  isSharedOwner(username) {
    for (let sharedOwner of this.project.run.sharedOwners) {
      if (sharedOwner.username == username) {
        return true;
      }
    }
    return false;
  }

  removeSharedOwner(sharedOwner) {
    this.teacherService.removeSharedOwner(this.project.run.id, sharedOwner.username)
        .subscribe((response) => {
      this.removeSharedOwnerLocally(sharedOwner);
    });
  }

  removeSharedOwnerLocally(sharedOwner) {
    for (let i = 0; i < this.project.run.sharedOwners.length; i ++) {
      if (this.project.run.sharedOwners[i].id == sharedOwner.id) {
        this.project.run.sharedOwners.splice(i, 1);
        return;
      }
    }
  }

  populatePermissionsObj(sharedOwner) {
    sharedOwner.permissionsObj = {
      1: true,  // View student work
      2: false,  // Grade and manage run
      3: false,  // View student names
      16: false  // Admin (read, write, share)
    }
    for (let permission of sharedOwner.permissions) {
      sharedOwner.permissionsObj[permission] = true;
    }
  }

  teacherNameChanged() {
  }

}
