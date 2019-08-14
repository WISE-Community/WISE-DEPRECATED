import { Component, Inject } from '@angular/core';
import { TeacherService } from "../teacher.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, MatTableDataSource } from "@angular/material";
import { ShareItemDialogComponent } from "../../modules/library/share-item-dialog/share-item-dialog.component";
import { I18n } from '@ngx-translate/i18n-polyfill';
import { UserService } from '../../services/user.service';
import { Teacher } from '../../domain/teacher';
import { TeacherRun } from '../teacher-run';

@Component({
  selector: 'app-share-run-dialog',
  templateUrl: './share-run-dialog.component.html',
  styleUrls: ['./share-run-dialog.component.scss']
})
export class ShareRunDialogComponent extends ShareItemDialogComponent {

  run: TeacherRun = new TeacherRun();
  dataSource: MatTableDataSource<any[]> = new MatTableDataSource<any[]>();
  displayedColumns: string[] = ['name', 'permissions'];
  duplicate: boolean = false;
  isTransfer: boolean = false;
  transferUnitWarning: boolean = false;
  newOwnerUsername: string = '';

  constructor(public dialogRef: MatDialogRef<ShareItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public teacherService: TeacherService,
              private userService: UserService,
              public snackBar: MatSnackBar,
              i18n: I18n) {
    super(dialogRef, data, teacherService, snackBar, i18n);
    this.runId = data.run.id;
    this.teacherService.getRun(this.runId).subscribe((run: TeacherRun) => {
      this.run = run;
      this.project = run.project;
      this.projectId = run.project.id;
      this.populateSharedOwners(run.sharedOwners);
    });
  }

  ngOnInit() {
    super.ngOnInit();
    this.getSharedOwners().subscribe(sharedOwners => {
      let owners = [...sharedOwners];
      owners.reverse();
      if (this.run.owner) {
        owners.unshift({
          sharedOwner: this.run.owner,
          isOwner: true
        });
      }
      this.dataSource = new MatTableDataSource(owners);
    });
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
      });
    } else {
      this.teacherService.removeSharedOwnerRunPermission(this.runId, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status == "success") {
            this.removeRunPermissionFromSharedOwner(sharedOwnerId, permissionId);
          }
      });
    }
  }

  addRunPermissionToSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.runPermissions[permissionId] = true;
    this.snackBar.open(this.i18n('Sharing permissions updated for {{username}}.', {username: sharedOwner.username}));
  }

  removeRunPermissionFromSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.runPermissions[permissionId] = false;
    this.snackBar.open(this.i18n('Sharing permissions updated for {{username}}.', {username: sharedOwner.username}));
  }

  shareRun() {
    this.duplicate = false;
    const sharedOwnerUsername = this.teacherSearchControl.value;
    if (this.run.owner.username !== sharedOwnerUsername &&
      (!this.isSharedOwner(sharedOwnerUsername) || this.isTransfer)) {
      if (this.isTransfer) {
        this.newOwnerUsername = sharedOwnerUsername;
        this.transferUnitWarning = true;
      } else {
        this.completeShareOrTransferUnit(sharedOwnerUsername);
      }
    } else {
      this.duplicate = true;
    }
  }

  completeShareOrTransferUnit(sharedOwnerUsername: string) {
    this.teacherService.addSharedOwner(this.runId, sharedOwnerUsername, this.isTransfer)
      .subscribe((newSharedOwner: Teacher) => {
        if (newSharedOwner != null && !this.isTransfer) {
          this.setDefaultRunPermissions(newSharedOwner);
          this.setDefaultProjectPermissions(newSharedOwner);
          this.addSharedOwner(newSharedOwner);
        } else if (newSharedOwner != null && this.isTransfer) {
          this.updateRunAndProjectPermissions(newSharedOwner);
          this.closeTransferUnitDialog();
        }
        this.teacherSearchControl.setValue('');
      });
    document.getElementById("share-run-dialog-search").blur();
  }

  updateRunAndProjectPermissions(newOwner) {
    const sharedOwner = this.data.run.owner;
    sharedOwner.runPermissions = { 1: true, 2: true, 3: true, 16: false };
    sharedOwner.projectPermissions = { 1: true, 2: true, 16: false };
    this.data.run.owner = newOwner;
    this.data.run.shared = true;
    this.run = this.data.run;
    this.transferUnitOwnership(newOwner, sharedOwner);
  }

  isOwner() {
    return this.data.run.owner.id === this.userService.getUserId();
  }

  unshareRun(sharedOwner) {
    this.teacherService.removeSharedOwner(this.runId, sharedOwner.username)
        .subscribe((response) => {
      this.removeSharedOwner(sharedOwner);
    });
  }

  openTransferUnitDialog() {
    this.isTransfer = true;
  }

  closeTransferUnitDialog() {
    this.isTransfer = false;
    this.transferUnitWarning = false;
  }
}
