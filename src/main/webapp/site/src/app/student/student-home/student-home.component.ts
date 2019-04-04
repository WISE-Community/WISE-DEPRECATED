import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog"
import { UserService } from "../../services/user.service";
import { User } from "../../domain/user";
import { AddProjectDialogComponent } from "../add-project-dialog/add-project-dialog.component";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.component.html',
  styleUrls: ['./student-home.component.scss']
})
export class StudentHomeComponent implements OnInit {

  user: User = new User();

  constructor(private userService: UserService, public dialog: MatDialog, private route: ActivatedRoute) { }

  ngOnInit() {
    this.getUser();
    this.route.queryParams.subscribe(params => {
      if (params['accessCode'] != null) {
        this.showAddRun();
      }
    });
  }

  getUser() {
    this.userService.getUser()
      .subscribe(user => {
        this.user = user;
      });
  }

  showAddRun() {
    const dialogRef = this.dialog.open(AddProjectDialogComponent);
  }
}
