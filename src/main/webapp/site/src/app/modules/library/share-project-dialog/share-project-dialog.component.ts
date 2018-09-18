import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Project } from "../../../teacher/project";
import { TeacherService } from "../../../teacher/teacher.service";
import { LibraryService } from "../../../services/library.service";
import { ShareItemDialogComponent } from "../share-item-dialog/share-item-dialog.component";

@Component({
  selector: 'app-share-project-dialog',
  templateUrl: './share-project-dialog.component.html',
  styleUrls: ['./share-project-dialog.component.scss']
})
export class ShareProjectDialogComponent extends ShareItemDialogComponent {

  constructor(public dialogRef: MatDialogRef<ShareItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public libraryService: LibraryService,
              public teacherService: TeacherService) {
    super(dialogRef, data, teacherService);
    this.projectId = data.project.id;
    this.libraryService.getProjectInfo(this.projectId).subscribe((project: Project) => {
      this.project = project;
      this.populateSharedOwners(project.sharedOwners);
    });
  }

  ngOnInit() {
    super.ngOnInit();
  }

  populatePermissions(sharedOwner) {
    this.addProjectPermissions(sharedOwner);
  }

  setDefaultProjectPermissions(sharedOwner) {
    sharedOwner.projectPermissions = {
      1: true,  // View the project
      2: false,  // Edit the project
      16: false  // Admin (read, write, share)
    };
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

  unshareProject(sharedOwner) {
    this.teacherService.removeSharedProjectOwner(this.project.id, sharedOwner.username)
      .subscribe((response) => {
        this.removeSharedOwner(sharedOwner);
      });
  }
}
