import { Component, Inject } from '@angular/core';
import { TeacherService } from '../teacher.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ShareItemDialogComponent } from '../../modules/library/share-item-dialog/share-item-dialog.component';
import { UserService } from '../../services/user.service';
import { UtilService } from '../../services/util.service';
import { TeacherRun } from '../teacher-run';

@Component({
  selector: 'app-share-run-dialog',
  templateUrl: './share-run-dialog.component.html',
  styleUrls: ['./share-run-dialog.component.scss']
})
export class ShareRunDialogComponent extends ShareItemDialogComponent {
  run: TeacherRun;
  dataSource: MatTableDataSource<any[]> = new MatTableDataSource<any[]>();
  displayedColumns: string[] = ['name', 'permissions'];
  isDuplicateSharedTeacher: boolean = false;
  isOwner: boolean = false;
  isTransfer: boolean = false;
  transferRunWarning: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ShareItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public teacherService: TeacherService,
    private userService: UserService,
    private utilService: UtilService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    super(dialogRef, data, teacherService, snackBar);
    this.teacherService.getRun(this.data.run.id).subscribe((run: TeacherRun) => {
      this.run = new TeacherRun(run);
      this.runId = this.run.id;
      this.project = this.run.project;
      this.owner = this.run.owner;
      this.isOwner = this.run.isOwner(this.userService.getUserId());
      this.populateSharedOwners(this.run.sharedOwners);
      this.getSharedOwners().subscribe((sharedOwners) => {
        this.sharedOwners = sharedOwners.sort(this.utilService.sortByUsername);
        this.updateAllOwners();
      });
    });
  }

  ngOnInit() {
    super.ngOnInit();
  }

  updateAllOwners() {
    let allOwners = [];
    allOwners.push({
      sharedOwner: this.run.owner,
      isOwner: true
    });
    allOwners = allOwners.concat(this.sharedOwners);
    this.dataSource = new MatTableDataSource(allOwners);
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
      1: true, // View student work
      2: false, // Grade and manage run
      3: false, // View student names
      16: false // Admin (read, write, share)
    };
  }

  setDefaultProjectPermissions(sharedOwner) {
    sharedOwner.projectPermissions = {
      1: false, // View the project
      2: false, // Edit the project
      16: false // Admin (read, write, share)
    };
  }

  runPermissionChanged(sharedOwnerId, permissionId, isAddingPermission) {
    if (isAddingPermission) {
      this.teacherService
        .addSharedOwnerRunPermission(this.runId, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status === 'success') {
            this.addRunPermissionToSharedOwner(sharedOwnerId, permissionId);
          }
        });
    } else {
      this.teacherService
        .removeSharedOwnerRunPermission(this.runId, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status === 'success') {
            this.removeRunPermissionFromSharedOwner(sharedOwnerId, permissionId);
          }
        });
    }
  }

  addRunPermissionToSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.runPermissions[permissionId] = true;
    this.notifyRunPermissionChange(sharedOwner);
  }

  removeRunPermissionFromSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.runPermissions[permissionId] = false;
    this.notifyRunPermissionChange(sharedOwner);
  }

  shareRun() {
    this.isDuplicateSharedTeacher = false;
    const sharedOwnerUsername = this.teacherSearchControl.value;
    if (
      this.run.owner.username !== sharedOwnerUsername &&
      (!this.isSharedOwner(sharedOwnerUsername) || this.isTransfer)
    ) {
      if (this.isTransfer) {
        this.transferRunWarning = true;
      } else {
        this.teacherService
          .addSharedOwner(this.runId, sharedOwnerUsername)
          .subscribe((newSharedOwner) => {
            this.setDefaultRunPermissions(newSharedOwner);
            this.setDefaultProjectPermissions(newSharedOwner);
            this.addSharedOwner(newSharedOwner);
            this.teacherSearchControl.setValue('');
          });
        document.getElementById('share-run-dialog-search').blur();
      }
    } else {
      this.isDuplicateSharedTeacher = true;
    }
  }

  completeRunOwnershipTransfer() {
    const newOwnerUsername = this.teacherSearchControl.value;
    this.teacherService.transferRunOwnership(this.runId, newOwnerUsername).subscribe((run) => {
      if (run != null) {
        this.updateRunAndProjectPermissions(run);
        this.closeTransferRunDialog();
      }
      this.teacherSearchControl.setValue('');
    });
  }

  updateRunAndProjectPermissions(run) {
    this.run = new TeacherRun(run);
    this.transferRunOwnership(this.run);
  }

  transferRunOwnership(run: TeacherRun) {
    this.sharedOwners = [];
    this.project = run.project;
    this.owner = run.owner;
    this.isOwner = run.isOwner(this.userService.getUserId());
    this.populateSharedOwners(run.sharedOwners);
    this.snackBar.open(
      $localize`Transferred classroom unit ownership to ${run.owner.firstName}:firstName: ${run.owner.lastName}:lastName:.`
    );
  }

  unshareRun(sharedOwner) {
    this.teacherService
      .removeSharedOwner(this.runId, sharedOwner.username)
      .subscribe((response) => {
        this.removeSharedOwner(sharedOwner);
      });
  }

  openTransferRunDialog() {
    this.isTransfer = true;
  }

  closeTransferRunDialog() {
    this.isTransfer = false;
    this.transferRunWarning = false;
    this.teacherSearchControl.setValue('');
  }

  copyProject() {
    this.teacherService.copyProject(this.project, this.dialog);
  }
}
