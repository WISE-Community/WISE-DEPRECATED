import { Component, OnInit } from '@angular/core';
import { TeacherService } from "../teacher.service";
import { Project } from "../project";

@Component({
  selector: 'app-teacher-project-list',
  templateUrl: './teacher-project-list.component.html',
  styleUrls: ['./teacher-project-list.component.scss']
})
export class TeacherProjectListComponent implements OnInit {

  projects: Project[] = [];
  constructor(private teacherService: TeacherService) { }

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.teacherService.getProjects()
      .subscribe(projects => {
        this.projects = projects;
      });
  }
}
