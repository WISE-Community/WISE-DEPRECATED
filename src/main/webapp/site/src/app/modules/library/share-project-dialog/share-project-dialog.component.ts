import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { TeacherService } from '../../../teacher/teacher.service';
import { LibraryService } from '../../../services/library.service';
import { ShareItemDialogComponent } from '../share-item-dialog/share-item-dialog.component';
import { Project } from '../../../domain/project';

@Component({
  selector: 'app-share-project-dialog',
  templateUrl: './share-project-dialog.component.html',
  styleUrls: ['./share-project-dialog.component.scss']
})
export class ShareProjectDialogComponent extends ShareItemDialogComponent {
  dataSource: MatTableDataSource<any[]> = new MatTableDataSource<any[]>();
  displayedColumns: string[] = ['name', 'permissions'];
  duplicate: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ShareItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public libraryService: LibraryService,
    public teacherService: TeacherService,
    public snackBar: MatSnackBar
  ) {
    super(dialogRef, data, teacherService, snackBar);
    this.project = data.project;
    this.projectId = data.project.id;
    this.libraryService.getProjectInfo(this.projectId).subscribe((project: Project) => {
      this.project = project;
      this.populateSharedOwners(project.sharedOwners);
    });
  }

  ngOnInit() {
    super.ngOnInit();
    this.getSharedOwners().subscribe((sharedOwners) => {
      let owners = [...sharedOwners];
      owners.reverse();
      if (this.project.owner) {
        owners.unshift({
          sharedOwner: this.project.owner,
          isOwner: true
        });
      }
      this.dataSource = new MatTableDataSource(owners);
    });
  }

  populatePermissions(sharedOwner) {
    this.addProjectPermissions(sharedOwner);
  }

  setDefaultProjectPermissions(sharedOwner) {
    sharedOwner.projectPermissions = {
      1: true, // View the project
      2: false, // Edit the project
      16: false // Admin (read, write, share)
    };
  }

  shareProject() {
    this.duplicate = false;
    const sharedOwnerUsername = this.teacherSearchControl.value;
    if (
      this.project.owner.username !== sharedOwnerUsername &&
      !this.isSharedOwner(sharedOwnerUsername)
    ) {
      this.teacherService
        .addSharedProjectOwner(this.project.id, sharedOwnerUsername)
        .subscribe((newSharedOwner) => {
          if (newSharedOwner != null) {
            this.setDefaultProjectPermissions(newSharedOwner);
            this.addSharedOwner(newSharedOwner);
            this.teacherSearchControl.setValue('');
          }
        });
    } else {
      this.duplicate = true;
    }
    document.getElementById('share-project-dialog-search').blur();
  }

  unshareProject(sharedOwner) {
    this.teacherService
      .removeSharedProjectOwner(this.project.id, sharedOwner.username)
      .subscribe((response) => {
        this.removeSharedOwner(sharedOwner);
      });
  }
}
