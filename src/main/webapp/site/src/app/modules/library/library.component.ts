import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LibraryService } from "../../services/library.service";
import { LibraryGroup } from "./libraryGroup";
import { LibraryProject } from "./libraryProject";
import { NGSSStandards } from "./ngssStandards";
import { Standard } from "./standard";

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LibraryComponent implements OnInit {
  libraryGroups: LibraryGroup[] = [];
  expandedGroups: object = {};
  implementationModelValue: string = '';
  implementationModelOptions: LibraryGroup[] = [];
  projects: LibraryProject[] = [];
  searchValue: string = '';
  dciArrangementOptions: Standard[] = [];
  dciArrangementValue = [];
  disciplineOptions: Standard[] = [];
  disciplineValue = [];
  peOptions: Standard[] = [];
  peValue = [];

  constructor(private libraryService: LibraryService) { }

  ngOnInit() {
    this.getLibraryGroups();
  }

  /**
   * Get library project groups from LibraryService and populate list of projects and filter options
   */
  getLibraryGroups(): void {
    this.libraryService.getLibraryGroups()
      .subscribe(libraryGroups => {
        this.libraryGroups = libraryGroups;

        // populate the flat list of library projects
        for (let group of this.libraryGroups) {
          if (!this.implementationModelValue) {
            this.implementationModelValue = group.id;
          }
          this.implementationModelOptions.push(group);
          this.getProjects(group, group.id);
        }

        // populate the filter options
        this.getFilterOptions();
      });
  }

  /**
   * Add given project or all child projects from a given group to the list of projects
   * @param item
   * @param {string} implementationModel
   */
  getProjects(item: any, implementationModel: string): void {
    if (item.type === 'project') {
      item.visible = true;
      item.implementationModel = implementationModel;
      this.projects.push(item);
    } else if (item.type === 'group') {
      let children = item.children;
      for (let child of children) {
        this.getProjects(child, implementationModel);
      }
    }
  }

  /**
   * Iterate through list of projects to populate metadata filter options
   */
  getFilterOptions(): void {
    for (let project of this.projects) {
      let standardsAddressed = project.metadata.standardsAddressed;
      if (standardsAddressed && standardsAddressed.ngss) {
        let ngss: NGSSStandards = standardsAddressed.ngss;
        let dciArrangements = ngss.dciArrangements;
        for (let e of dciArrangements) {
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

  /**
   * Given new search string, filter for visible projects
   * @param {string} value
   */
  searchUpdated(value: string): void {
    this.searchValue = value.toLocaleLowerCase();
    this.filterUpdated();
  }

  /**
   * Filter options or search string have changed, so update visible projects
   * @param {string[]} value
   * @param {string} context
   */
  filterUpdated(value: string[] = [], context: string = ''): void {
    switch(context) {
      case 'discipline':
        this.disciplineValue = value;
        break;
      case 'dci':
        this.dciArrangementValue = value;
        break;
      case 'pe':
        this.peValue = value;
        break;
    }

    for (let project of this.projects) {
      let searchMatch = false;
      let filterMatch = false;

      // if there is a search string, check for search match
      if (this.searchValue) {
        searchMatch = this.isSearchMatch(project, this.searchValue);
      }
      if (!searchMatch && this.hasFilters()) {
        // there is no search string or project doesn't match the search text, so check for filter matches
        filterMatch = this.isFilterMatch(project);
      } else if (!this.searchValue) {
        // there is no search string and no filters selected, so project should be visible
        filterMatch = true;
      }

      // set project to visible if there is either a search or filter match
      project.visible = searchMatch || filterMatch;
    }
  }

  /**
   * Check and return whether there are any active filters
   * @return {boolean}
   */
  hasFilters(): boolean {
    return this.dciArrangementValue.length > 0 || this.peValue.length > 0 || this.disciplineValue.length > 0;
  }

  /**
   * Remove duplicates from an object array by property
   * TODO: extract to util function
   * @param {any[]} array
   * @param {string} prop
   * @return {any[]}
   */
  removeDuplicates(array: any[], prop: string): any[] {
    return array.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  /**
   * Sort an object array alphabetically A-Z by property
   * TODO: extract to util function
   * @param {any[]} array
   * @param {string} prop
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
   * Check and return whether project metadata contains given search value
   * @param {LibraryProject} project
   * @param {string} searchValue
   * @return {boolean}
   */
  isSearchMatch(project: LibraryProject, searchValue: string): boolean {
    let metadata = project.metadata;
    return Object.keys(metadata).some(prop => {
      // only check for match in specific metadata fields; TODO: include standards?
      if (prop != 'title' && prop != 'summary' && prop != 'keywords' && prop != 'features') {
        return false;
      } else {
        let value = metadata[prop];
        if (typeof value === 'undefined' || value === null) {
          return false;
        } else {
          return value.toString().toLocaleLowerCase().indexOf(searchValue) !== -1;
        }
      }
    });
  }

  /**
   * Check and return whether project metadata matches any of the filter values
   * @param {LibraryProject} project
   * @return {boolean}
   */
  isFilterMatch(project: LibraryProject): boolean {
    const standardsAddressed = project.metadata.standardsAddressed;
    if (standardsAddressed.ngss) {
      const ngss = standardsAddressed.ngss;

      // check for DCI Arrangement filter match
      if (this.dciArrangementValue.length) {
        const dciArrangements: Standard[] = ngss.dciArrangements ? ngss.dciArrangements : [];
        for (let val of dciArrangements) {
          for (let filter of this.dciArrangementValue) {
            if (val.id === filter) {
              return true;
            }
          }
        }
      }

      // check for Performance Expectation filter match
      if (this.peValue.length) {
        const dciArrangements: Standard[] = ngss.dciArrangements ? ngss.dciArrangements : [];
        for (let arrangement of dciArrangements) {
          for (let val of arrangement.children) {
            for (let filter of this.peValue) {
              if (val.id === filter) {
                return true;
              }
            }
          }
        }
      }

      // check for Discipline filter match
      if (this.disciplineValue.length) {
        const disciplines: Standard[] = ngss.disciplines ? ngss.disciplines : [];
        for (let val of disciplines) {
          for (let filter of this.disciplineValue) {
            if (val.id === filter) {
              return true;
            }
          }
        }
      }
    }

    // there are no matches
    return false;
  }

  /**
   * Reset the filters and search string
   */
  reset(): void {
    this.dciArrangementValue = this.disciplineValue = this.peValue = [];
    this.searchValue = '';
    this.filterUpdated();
  }

  /**
   * Count and return number of visible projects in a LibraryProject array
   * @param {LibraryProject[]} set
   * @param {string} implementationModel
   * @return {number}
   */
  countVisibleProjects(set: LibraryProject[], implementationModel: string): number {
    return set.filter((project) => 'project' && project.visible &&
      project.implementationModel === implementationModel).length;
  }

  /**
   * Selected implementation model has changed
   * @param {string} value
   */
  implementationModelUpdated(value: string): void {
    this.implementationModelValue = value;
  }
}
