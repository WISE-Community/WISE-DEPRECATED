import { Component, Inject } from '@angular/core';
import { Run } from "../../domain/run";
import { TeacherService } from "../teacher.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ShareItemDialogComponent } from "../../modules/library/share-item-dialog/share-item-dialog.component";

@Component({
  selector: 'app-share-run-dialog',
  templateUrl: './share-run-dialog.component.html',
  styleUrls: ['./share-run-dialog.component.scss']
})
export class ShareRunDialogComponent extends ShareItemDialogComponent {

  run: Run;

  constructor(public dialogRef: MatDialogRef<ShareItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public teacherService: TeacherService) {
    super(dialogRef, data, teacherService);
    this.runId = data.run.id;
    this.teacherService.getRun(this.runId).subscribe((run: Run) => {
      this.run = run;
      this.project = run.project;
      this.projectId = run.project.id;
      this.populateSharedOwners(run.sharedOwners);
    });
  }

  ngOnInit() {
    super.ngOnInit();
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

  setDefaultProjectPermissions(sharedOwner) {
    sharedOwner.projectPermissions = {
      1: false,  // View the project
      2: false,  // Edit the project
      16: false  // Admin (read, write, share)
    };
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

  unshareRun(sharedOwner) {
    this.teacherService.removeSharedOwner(this.runId, sharedOwner.username)
        .subscribe((response) => {
      this.removeSharedOwner(sharedOwner);
    });
  }
}
