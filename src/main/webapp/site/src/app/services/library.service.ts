import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { LibraryGroup } from "../modules/library/libraryGroup";
import { ProjectFilterOptions } from "../domain/projectFilterOptions";
import { LibraryProject } from "../modules/library/libraryProject";
import { Project } from "../domain/project";

@Injectable()
export class LibraryService {

  private libraryGroupsUrl = 'api/project/library';
  private communityProjectsUrl = 'api/project/community';
  private personalProjectsUrl = 'api/project/personal';
  private sharedProjectsUrl = 'api/project/shared';
  private copyProjectUrl = 'api/project/copy';
  private projectInfoUrl = 'api/project/info';
  public libraryGroups: LibraryGroup[];
  private libraryGroupsSource = new Subject<LibraryGroup[]>();
  public libraryGroupsSource$ = this.libraryGroupsSource.asObservable();
  private officialLibraryProjectsSource = new Subject<LibraryProject[]>();
  public officialLibraryProjectsSource$ = this.officialLibraryProjectsSource.asObservable();
  private communityLibraryProjectsSource = new Subject<LibraryProject[]>();
  public communityLibraryProjectsSource$ = this.communityLibraryProjectsSource.asObservable();

  private personalLibraryProjectsSource = new Subject<LibraryProject[]>();
  public personalLibraryProjectsSource$ = this.personalLibraryProjectsSource.asObservable();

  private sharedLibraryProjectsSource = new Subject<LibraryProject[]>();
  public sharedLibraryProjectsSource$ = this.sharedLibraryProjectsSource.asObservable();

  private projectFilterOptionsSource = new Subject<ProjectFilterOptions>();
  public projectFilterOptionsSource$ = this.projectFilterOptionsSource.asObservable();

  private newProjectSource = new Subject<LibraryProject>();
  public newProjectSource$ = this.newProjectSource.asObservable();

  private tabIndexSource = new Subject<number>();
  public tabIndexSource$ = this.tabIndexSource.asObservable();

  constructor(private http: HttpClient) { }

  getOfficialLibraryProjects() {
    this.http.get<LibraryGroup[]>(this.libraryGroupsUrl).subscribe((libraryGroups) => {
      const projects: LibraryProject[] = [];
      this.libraryGroups = this.convertLibraryGroups(libraryGroups);
      for (let group of this.libraryGroups) {
        this.populateProjects(group, projects);
      }
      this.officialLibraryProjectsSource.next(projects);
      this.libraryGroupsSource.next(this.libraryGroups);
    });
  }

  convertLibraryGroups(libraryGroups: LibraryGroup[]) {
    const convertedLibraryGroups: LibraryGroup[] = [];
    for (let libraryGroup of libraryGroups) {
      convertedLibraryGroups.push(this.convertLibraryGroup(libraryGroup));
    }
    return convertedLibraryGroups;
  }

  convertLibraryGroup(libraryObj: any) {
    if (libraryObj.type === 'project') {
      return new LibraryProject(libraryObj);
    } else if (libraryObj.type === 'group') {
      const children = libraryObj.children;
      const convertedLibraryGroup = [];
      for (let child of children) {
        convertedLibraryGroup.push(this.convertLibraryGroup(child));
      }
      libraryObj.children = convertedLibraryGroup;
      return libraryObj;
    }
  }

  getCommunityLibraryProjects() {
    this.http.get<LibraryProject[]>(this.communityProjectsUrl).subscribe((projects) => {
      const communityLibraryProjects: LibraryProject[] = this.convertToLibraryProjects(projects);
      this.communityLibraryProjectsSource.next(communityLibraryProjects);
    });
  }

  getPersonalLibraryProjects() {
    this.http.get<LibraryProject[]>(this.personalProjectsUrl).subscribe((projects) => {
      const personalLibraryProjects: LibraryProject[] = this.convertToLibraryProjects(projects);
      this.personalLibraryProjectsSource.next(personalLibraryProjects);
    });
  }

  getSharedLibraryProjects() {
    this.http.get<LibraryProject[]>(this.sharedProjectsUrl).subscribe((projects) => {
      const sharedLibraryProjects: LibraryProject[] = this.convertToLibraryProjects(projects);
      for (let sharedLibraryProject of sharedLibraryProjects) {
        sharedLibraryProject.shared = true;
      }
      this.sharedLibraryProjectsSource.next(sharedLibraryProjects);
    });
  }

  convertToLibraryProjects(projectsJSON) {
    const libraryProjects: LibraryProject[] = [];
    for (let project of projectsJSON) {
      const libraryProject = new LibraryProject(project);
      libraryProjects.push(libraryProject);
    }
    return libraryProjects;
  }

  /**
   * Add given project or all child projects from a given group to the list of projects
   * @param item
   * @param {LibraryProject[]} projects
   */
  populateProjects(item: any, projects: LibraryProject[]): void {
    if (item.type === 'project') {
      item.visible = true;
      projects.push(item);
    } else if (item.type === 'group') {
      let children = item.children;
      for (let child of children) {
        this.populateProjects(child, projects);
      }
    }
  }

  copyProject(projectId) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('projectId', projectId + "");
    return this.http.post(this.copyProjectUrl, body, { headers: headers });
  }

  filterOptions(projectFilterOptions: ProjectFilterOptions) {
    this.projectFilterOptionsSource.next(projectFilterOptions);
  }

  setTabIndex(index: number) {
    this.tabIndexSource.next(index);
  }

  addPersonalLibraryProject(project: LibraryProject) {
    this.newProjectSource.next(project);
  }

  getProjectInfo(projectId): Observable<Project> {
    return this.http.get<Project>(this.projectInfoUrl + "/" + projectId);
  }
}
