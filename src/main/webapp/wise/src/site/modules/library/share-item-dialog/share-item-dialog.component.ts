import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { TeacherService } from "../../../teacher/teacher.service";
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from "@angular/material";
import { map, debounceTime } from 'rxjs/operators';
import { Project } from "../../../domain/project";
import { I18n } from '@ngx-translate/i18n-polyfill';

export abstract class ShareItemDialogComponent implements OnInit {

  project: Project;
  projectId: number;
  runId: number;
  teacherSearchControl = new FormControl();
  allTeacherUsernames: string[] = [];
  filteredTeacherUsernames: Observable<string[]>;
  sharedOwners: any[] = [];
  private sharedOwners$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.sharedOwners);

  constructor(public dialogRef: MatDialogRef<ShareItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public teacherService: TeacherService,
              public snackBar: MatSnackBar,
              public i18n: I18n) {
    this.teacherService.retrieveAllTeacherUsernames().subscribe((teacherUsernames) => {
      this.allTeacherUsernames = teacherUsernames;
    })
  }

  ngOnInit() {
    this.filteredTeacherUsernames = this.teacherSearchControl.valueChanges.pipe(
      debounceTime(1000),
      map(value => this._filter(value))
    );
  }

  getSharedOwners(): BehaviorSubject<any[]> {
    return this.sharedOwners$;
  }

  public _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    if (filterValue == '') {
      return [];
    }
    return this.allTeacherUsernames.filter(option => option.toLowerCase().includes(filterValue));
  }

  populateSharedOwners(sharedOwners) {
    for (let sharedOwner of sharedOwners) {
      const localSharedOwner = JSON.parse(JSON.stringify(sharedOwner));
      this.populatePermissions(localSharedOwner);
      delete localSharedOwner.permissions;
      this.sharedOwners.push(localSharedOwner);
    }
    this.sharedOwners$.next(this.sharedOwners);
  }

  abstract populatePermissions(sharedOwner);

  addProjectPermissions(sharedOwner) {
    this.setDefaultProjectPermissions(sharedOwner);
    const sharedProjectOwner = this.getSharedProjectOwner(sharedOwner.id, this.project);
    for (let permission of sharedProjectOwner.permissions) {
      sharedOwner.projectPermissions[permission] = true;
    }
  }

  abstract setDefaultProjectPermissions(sharedOwner);

  getSharedProjectOwner(userId, item) {
    for (let sharedOwner of item.sharedOwners) {
      if (sharedOwner.id == userId) {
        return sharedOwner;
      }
    }
    return { permissions: [] };
  }

  getSharedOwner(sharedOwnerId): any {
    for (let sharedOwner of this.sharedOwners) {
      if (sharedOwner.id == sharedOwnerId) {
        return sharedOwner;
      }
    }
    return { permissions: [] };
  }

  projectPermissionChanged(project, sharedOwnerId, permissionId, isAddingPermission) {
    if (isAddingPermission) {
      this.teacherService.addSharedOwnerProjectPermission(project.id, sharedOwnerId, permissionId)
        .subscribe((response: any) => {
          if (response.status == "success") {
            this.addProjectPermissionToSharedOwner(sharedOwnerId, permissionId);
          }
        })
    } else {
      this.teacherService.removeSharedOwnerProjectPermission(project.id, sharedOwnerId, permissionId)
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
    this.snackBar.open(this.i18n('Sharing permissions updated for {{username}}.', {username: sharedOwner.username}));
  }

  removeProjectPermissionFromSharedOwner(sharedOwnerId, permissionId) {
    const sharedOwner = this.getSharedOwner(sharedOwnerId);
    sharedOwner.projectPermissions[permissionId] = false;
    this.snackBar.open(this.i18n('Sharing permissions updated for {{username}}.', {username: sharedOwner.username}));
  }

  isSharedOwner(username) {
    for (let sharedOwner of this.sharedOwners) {
      if (sharedOwner.username == username) {
        return true;
      }
    }
    return false;
  }

  addSharedOwner(sharedOwner) {
    this.sharedOwners.push(sharedOwner);
    this.sharedOwners$.next(this.sharedOwners);
    this.snackBar.open(this.i18n('Added shared teacher: {{username}}.', {username: sharedOwner.username}));
  }

  removeSharedOwner(sharedOwner) {
    for (let i = 0; i < this.sharedOwners.length; i++) {
      if (this.sharedOwners[i].id == sharedOwner.id) {
        this.sharedOwners.splice(i, 1);
        this.sharedOwners$.next(this.sharedOwners);
        this.snackBar.open(this.i18n('Removed shared teacher: {{username}}.', {username: sharedOwner.username}));
        return;
      }
    }
  }
}
