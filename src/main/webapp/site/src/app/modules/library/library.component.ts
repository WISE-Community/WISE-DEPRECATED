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

        // populate the flat list of library projects
        for (let group of this.libraryGroups) {
          this.getProjects(group);
        }

        // populate the filter options
        this.getFilterOptions();
      });
  }

  getProjects(item): void {
    if (item.type === 'project') {
      item.visible = true;
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
    for (let project of this.projects) {
      let visible = true;
      let searchMatch = true;

      // check for
      if (this.searchValue) {
        searchMatch = this.isSearchMatch(project, this.searchValue);
      }

      if (searchMatch) {
        // project matches the search text, so check for filter matches
      } else {
        visible = false;
      }

      project.visible = visible;
    }
  }

  /**
   * Remove duplicates from an object array by property
   * @param array Array to process
   * @param prop Property to check for duplicate
   * TODO: extract to util function
   */
  removeDuplicates(array: any[], prop: string): any[] {
    return array.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  /**
   * Sort an object array alphabetically A-Z by property
   * @param array Array to sort
   * @param prop Property to sort on
   * TODO: extract to util function
   */
  sortOptions(array: any[], prop: string): void {
    array.sort( (a: Standard, b: Standard) => {
      const valA = a[prop].toLocaleLowerCase(); // ignore case
      const valB = b[prop].toLocaleLowerCase(); // ignore case
      if (valA < valB) {
        return -1;
      }
      if (valA > valB) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * Check and return whether project metadata contains given search string
   * @param project LibraryProject to check
   * @param filterValue String to match
   * @return boolean
   */
  isSearchMatch(project: LibraryProject, filterValue: string): boolean {
    let metadata = project.metadata;
    return Object.keys(metadata).some(prop => {
      // only check for match in specific metadata fields
      if (prop != 'title' && prop != 'summary' && prop != 'keywords' && prop != 'features') {
        return false;
      } else {
        let value = metadata[prop];
        if (typeof value === 'undefined' || value === null) {
          return false;
        } else {
          return value.toString().toLocaleLowerCase().indexOf(filterValue) !== -1;
        }
      }
    });
  }

  /**
   * Count and return number of projects in a LibraryProject array that are visible
   * @param set Array of LibraryProjects to count
   * @return Number
   */
  countVisibleProjects(set: LibraryProject[]): number {
    return set.filter((project) => 'project' && project.visible).length;
  }
}
