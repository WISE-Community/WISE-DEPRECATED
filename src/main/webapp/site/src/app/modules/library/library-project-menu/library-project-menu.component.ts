import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Project } from '../../../domain/project';
import { TeacherService } from '../../../teacher/teacher.service';
import { ShareProjectDialogComponent } from '../share-project-dialog/share-project-dialog.component';
import { UserService } from '../../../services/user.service';
import { CopyProjectDialogComponent } from '../copy-project-dialog/copy-project-dialog.component';
import { ConfigService } from '../../../services/config.service';
import { EditRunWarningDialogComponent } from '../../../teacher/edit-run-warning-dialog/edit-run-warning-dialog.component';

@Component({
  selector: 'app-library-project-menu',
  templateUrl: './library-project-menu.component.html',
  styleUrls: ['./library-project-menu.component.scss']
})
export class LibraryProjectMenuComponent {
  @Input()
  project: Project;

  @Input()
  isRun: boolean;

  editLink: string = '';
  previewLink: string = '';
  isCanEdit: boolean = false;
  isCanShare: boolean = false;
  isChild: boolean = false;

  constructor(
    private dialog: MatDialog,
    private teacherService: TeacherService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.isCanEdit = this.isOwner() || this.isSharedOwnerWithEditPermission();
    this.isCanShare = this.isOwner() && !this.isRun;
    this.editLink = `${this.configService.getContextPath()}/teacher/edit/unit/${this.project.id}`;
    this.isChild = this.project.isChild();
  }

  isOwner() {
    return this.userService.getUserId() == this.project.owner.id;
  }

  isSharedOwnerWithEditPermission() {
    const userId = this.userService.getUserId();
    for (let sharedOwner of this.project.sharedOwners) {
      if (userId == sharedOwner.id) {
        return this.hasEditPermission(sharedOwner);
      }
    }
    return false;
  }

  hasEditPermission(sharedOwner) {
    return sharedOwner.permissions.includes(Project.EDIT_PERMISSION);
  }

  copyProject() {
    this.teacherService.copyProject(this.project, this.dialog);
  }

  editProject() {
    this.teacherService.getProjectLastRun(this.project.id).subscribe((projectRun) => {
      if (projectRun != null) {
        projectRun.project = this.project;
        this.dialog.open(EditRunWarningDialogComponent, {
          data: { run: projectRun },
          panelClass: 'mat-dialog--sm'
        });
      } else {
        window.location.href = this.editLink;
      }
    });
  }

  shareProject() {
    this.dialog.open(ShareProjectDialogComponent, {
      data: { project: this.project },
      panelClass: 'mat-dialog--md'
    });
  }
}
