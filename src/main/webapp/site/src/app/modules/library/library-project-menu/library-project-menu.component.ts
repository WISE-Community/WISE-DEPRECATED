import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Project } from "../../../domain/project";
import { TeacherService } from "../../../teacher/teacher.service";
import { ShareProjectDialogComponent } from "../share-project-dialog/share-project-dialog.component";
import { UserService } from "../../../services/user.service";

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
  isCanShare:boolean = false;

  constructor(public dialog: MatDialog,
              public teacherService: TeacherService,
              public userService: UserService) {
  }

  ngOnInit() {
    this.isCanShare = this.calculateIsCanShare();
    this.editLink = `/wise/author/authorproject.html?projectId=${ this.project.id }`;
  }

  calculateIsCanShare() {
    return this.isOwner() || this.isSharedOwner();
  }

  isOwner() {
    return this.userService.getUserId() == this.project.owner.id;
  }

  isSharedOwner() {
    const userId = this.userService.getUserId();
    for (let sharedOwner of this.project.sharedOwners) {
      if (userId == sharedOwner.id) {
        return true;
      }
    }
    return false;
  }

  copyProject() {
    this.select.emit('copy');
  }

  shareProject() {
    this.dialog.open(ShareProjectDialogComponent, {
      data: { project: this.project }
    });
  }

  editProject() {
    this.select.emit('edit');
  }
}
