import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Project } from "../../../domain/project";
import { TeacherService } from "../../../teacher/teacher.service";
import { ShareProjectDialogComponent } from "../share-project-dialog/share-project-dialog.component";
import { UserService } from "../../../services/user.service";
import { CopyProjectDialogComponent } from "../copy-project-dialog/copy-project-dialog.component";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: 'app-library-project-menu',
  templateUrl: './library-project-menu.component.html',
  styleUrls: ['./library-project-menu.component.scss']
})
export class LibraryProjectMenuComponent implements OnInit {

  @Input()
  project: Project;

  @Output('menuAction')
  select: EventEmitter<string> = new EventEmitter<string>();

  editLink: string = '';
  previewLink: string = '';
  isCanEdit: boolean = false;
  isCanShare: boolean = false;
  isChild: boolean = false;

  constructor(public dialog: MatDialog,
              public teacherService: TeacherService,
              public userService: UserService,
              private configService: ConfigService) {
  }

  ngOnInit() {
    this.isCanEdit = this.isOwner() || this.isSharedOwnerWithEditPermission();
    this.isCanShare = this.isOwner();
    this.editLink = `${this.configService.getContextPath()}/author/authorproject.html?projectId=${ this.project.id }`;
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
    this.dialog.open(CopyProjectDialogComponent, {
      data: { project: this.project },
      panelClass: 'mat-dialog--sm'
    });
  }

  shareProject() {
    this.dialog.open(ShareProjectDialogComponent, {
      data: { project: this.project },
      panelClass: 'mat-dialog--md'
    });
  }
}
