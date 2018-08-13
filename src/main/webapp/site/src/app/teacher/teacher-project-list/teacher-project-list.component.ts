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
  filteredProjects: Project[] = [];
  loaded: boolean = false; // whether array of runs has been retrieved from server
  searchValue: string = '';
  filterOptions: any[] = [
    { value: 'projectsAndRuns', viewValue: 'Projects & Runs' },
    { value: 'projectsOnly', viewValue: 'Projects Only' },
    { value: 'runsOnly', viewValue: 'Runs Only' },
    { value: 'archivedProjectsAndRuns', viewValue: 'Archived Projects & Runs' }
  ];
  filterValue: string = 'projectsAndRuns';

  constructor(private teacherService: TeacherService) {
    teacherService.newProjectSource$.subscribe(project => {
      project.highlighted = true;
      this.projects.unshift(project);
      this.performSearchAndFilter();
    });
  }

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.teacherService.getProjects()
      .subscribe(projects => {
        this.projects = projects;
        this.filteredProjects = projects;
        this.performSearchAndFilter();
        this.loaded = true;
      });
  }

  performSearchAndFilter() {
    this.filteredProjects = this.searchValue ? this.performSearch(this.searchValue) : this.projects;
    this.performFilter(this.filterValue);
  }

  searchChanged(searchValue: string) {
    this.searchValue = searchValue;
    this.performSearchAndFilter();
  }

  filterChanged(value: string) {
    this.filterValue = value;
    this.performSearchAndFilter();
  }

  performFilter(filterValue: string) {
    switch(filterValue) {
      case 'projectsAndRuns': {
        this.hideArchivedItems();
        break;
      }
      case 'projectsOnly': {
        this.filteredProjects = this.filteredProjects.filter((project: Project) => {
          return project.run == null;
        });
        this.hideArchivedItems();
        break;
      }
      case 'runsOnly': {
        this.filteredProjects = this.filteredProjects.filter((project: Project) => {
          return project.run != null;
        });
        this.hideArchivedItems();
        break;
      }
      case 'archivedProjectsAndRuns': {
        this.filteredProjects = this.filteredProjects.filter((project: Project) => {
          return project.dateArchived != null || (project.run != null && project.run.endTime != null);
        });
        break;
      }
    }
  }

  hideArchivedItems() {
    this.filteredProjects = this.filteredProjects.filter((project: Project) => {
      return project.dateArchived == null && (project.run == null || (project.run != null && project.run.endTime == null));
    });
  }

  performSearch(searchValue: string) {
    searchValue = searchValue.toLocaleLowerCase();
    // TODO: extract this for global use?
    return this.projects.filter((project: Project) =>
      Object.keys(project).some(prop => {
        let value = project[prop];
        if (typeof value === 'undefined' || value === null) {
          return false;
        } else if (typeof value === 'object') {
          return JSON.stringify(value).toLocaleLowerCase().indexOf(searchValue) !== -1;
        } else {
          return value.toString().toLocaleLowerCase().indexOf(searchValue) !== -1;
        }
      })
    );
  }
}
