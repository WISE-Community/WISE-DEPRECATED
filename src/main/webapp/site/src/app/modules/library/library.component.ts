import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LibraryService } from "../../services/library.service";
import { LibraryGroup } from "./libraryGroup";
import { Standard } from "./standard";
import { LibraryProject } from "./libraryProject";
import { StudentRun } from "../../student/student-run";
import { NGSSStandards } from "./ngssStandards";

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LibraryComponent implements OnInit {

  libraryGroups: LibraryGroup[] = [];
  searchValue: string = '';
  arrangement: string = 'californiaIntegrated';
  expandedGroups: object = {};
  initialGroup: number = 0;
  projects: LibraryProject[] = [];
  dciArrangementOptions: Standard[] = [];
  dciArrangementValue = [];
  peOptions: Standard[] = [];
  peValue = [];
  disciplineOptions: Standard[] = [];
  disciplineValue = [];

  constructor(private libraryService: LibraryService) { }

  ngOnInit() {
    this.getLibraryGroups();
  }

  getLibraryGroups(): void {
    this.libraryService.getLibraryGroups()
      .subscribe(libraryGroups => {
        this.libraryGroups = libraryGroups;
        this.filterUpdated();

        // randomly select group to expand on load
        this.initialGroup = Math.floor(Math.random() * (this.libraryGroups.length));

        // populate the flat list of library projects
        for (let group of this.libraryGroups) {
          this.getProjects(group);
        }

        // remove project duplicates
        this.projects = this.removeDuplicates(this.projects, 'id');

        // populate the filter options
        this.getFilterOptions();
      });
  }

  getProjects(item): void {
    if (item.type === 'project') {
      this.projects.push(item);
    } else if (item.type === 'group') {
      let children = item.children;
      for (let child of children) {
        this.getProjects(child);
      }
    }
  }

  getFilterOptions(): void {
    for (let project of this.projects) {
      let standardsAddressed = project.metadata.standardsAddressed;
      if (standardsAddressed && standardsAddressed.ngss) {
        let ngss: NGSSStandards = standardsAddressed.ngss;
        let pe = ngss.pe;
        for (let e of pe) {
          let dciArrangement: Standard = new Standard();
          dciArrangement.id = e.id;
          dciArrangement.name = `${e.id} ${e.name}`;
          this.dciArrangementOptions.push(dciArrangement);
          if (e.children) {
            for (let p of e.children) {
              let peStandard: Standard = new Standard();
              peStandard.id = p.id;
              peStandard.name = `${p.id}: ${p.name}`;
              this.peOptions.push(peStandard);
            }
          }
        }

        let disciplines = ngss.disciplines;
        if (disciplines) {
          for (let d of disciplines) {
            let discipline: Standard = new Standard();
            discipline.id = d.id;
            discipline.name = d.name;
            this.disciplineOptions.push(discipline);
          }
        }
      }
    }

    // remove duplicates and sort alphabetically
    this.dciArrangementOptions = this.removeDuplicates(this.dciArrangementOptions, 'id');
    this.sortOptions(this.dciArrangementOptions, 'id');
    this.disciplineOptions = this.removeDuplicates(this.disciplineOptions, 'id');
    this.sortOptions(this.disciplineOptions, 'name');
    this.peOptions = this.removeDuplicates(this.peOptions, 'id');
    this.sortOptions(this.peOptions, 'id');
  }

  searchUpdated(value: string): void {
    this.searchValue = value.toLocaleLowerCase();
    this.filterUpdated();
  }

  filterUpdated(): void {
    // TODO: add filtering
  }

  // TODO: extract to util function
  removeDuplicates(array, prop) {
    return array.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  sortOptions(array, prop) {
    array.sort( (a: Standard, b: Standard) => {
      const valA = a[prop].toLocaleLowerCase(); // ignore upper and lowercase
      const valB = b[prop].toLocaleLowerCase(); // ignore upper and lowercase
      if (valA < valB) {
        return -1;
      }
      if (valA > valB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
  }
}
