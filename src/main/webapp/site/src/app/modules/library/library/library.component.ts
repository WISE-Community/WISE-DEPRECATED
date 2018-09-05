import { Component, OnInit } from '@angular/core';
import { LibraryGroup } from "../libraryGroup";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { NGSSStandards } from "../ngssStandards";
import { LibraryService } from "../../../services/library.service";
import { Standard } from "../standard";
import { LibraryProject } from "../libraryProject";

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  projects: LibraryProject[] = [];
  libraryGroups: LibraryGroup[] = [];
  expandedGroups: object = {};
  implementationModelValue: string = '';
  implementationModelOptions: LibraryGroup[] = [];
  searchValue: string = '';
  dciArrangementOptions: Standard[] = [];
  dciArrangementValue = [];
  disciplineOptions: Standard[] = [];
  disciplineValue = [];
  peOptions: Standard[] = [];
  peValue = [];
  showFilters: boolean = false;

  constructor(private libraryService: LibraryService) {
  }

  ngOnInit() {
  }

  /**
   * Add given project or all child projects from a given group to the list of projects
   * @param item
   * @param {string} implementationModel
   */
  populateProjects(item: any, implementationModel: string, projects: LibraryProject[]): void {
    if (item.type === 'project') {
      item.visible = true;
      item.implementationModel = implementationModel;
      projects.push(item);
    } else if (item.type === 'group') {
      let children = item.children;
      for (let child of children) {
        this.populateProjects(child, implementationModel, projects);
      }
    }
  }

  /**
   * Iterate through list of projects to populate metadata filter options
   */
  populateFilterOptions(): void {
    for (let project of this.projects) {
      const standardsAddressed = project.metadata.standardsAddressed;
      if (standardsAddressed && standardsAddressed.ngss) {
        const ngss: NGSSStandards = standardsAddressed.ngss;
        const dciArrangements = ngss.dciArrangements;
        for (let dciStandard of dciArrangements) {
          this.dciArrangementOptions.push(this.createDCIStandard(dciStandard));
          if (dciStandard.children) {
            for (let peStandard of dciStandard.children) {
              this.peOptions.push(this.createPEStandard(peStandard));
            }
          }
        }

        const disciplines = ngss.disciplines;
        if (disciplines) {
          for (let discipline of disciplines) {
            this.disciplineOptions.push(this.createDisciplineStandard(discipline));
          }
        }
      }
    }
    this.removeDuplicatesAndSortAlphabetically();
  }

  createDCIStandard(standardIn: any) {
    const dciStandard: Standard = new Standard();
    dciStandard.id = standardIn.id;
    dciStandard.name = `${standardIn.id} ${standardIn.name}`;
    return dciStandard;
  }

  createPEStandard(standardIn: any) {
    const peStandard: Standard = new Standard();
    peStandard.id = standardIn.id;
    peStandard.name = `${standardIn.id}: ${standardIn.name}`;
    return peStandard;
  }

  createDisciplineStandard(standardIn: any) {
    const standard: Standard = new Standard();
    standard.id = standardIn.id;
    standard.name = standardIn.name;
    return standard;
  }

  removeDuplicatesAndSortAlphabetically() {
    this.dciArrangementOptions = this.removeDuplicates(this.dciArrangementOptions, 'id');
    this.sortOptions(this.dciArrangementOptions, 'id');
    this.disciplineOptions = this.removeDuplicates(this.disciplineOptions, 'id');
    this.sortOptions(this.disciplineOptions, 'name');
    this.peOptions = this.removeDuplicates(this.peOptions, 'id');
    this.sortOptions(this.peOptions, 'id');
  }

  /**
   * Filter options or search string have changed, so update visible projects
   * @param {ProjectFilterOptions} filterOptions
   */
  filterUpdated(filterOptions: ProjectFilterOptions): void {
    this.searchValue = filterOptions.searchValue;
    this.disciplineValue = filterOptions.disciplineValue;
    this.dciArrangementValue = filterOptions.dciArrangementValue;
    this.peValue = filterOptions.peValue;
    for (let project of this.projects) {
      let searchMatch = false;
      let filterMatch = false;
      if (this.searchValue) {
        searchMatch = this.isSearchMatch(project, this.searchValue);
      }
      if (!searchMatch && this.hasFilters()) {
        filterMatch = this.isFilterMatch(project);
      } else if (!this.searchValue) {
        filterMatch = true;
      }
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
    const metadata = project.metadata;
    return Object.keys(metadata).some(prop => {
      // only check for match in specific metadata fields
      if (prop != 'title' && prop != 'summary' && prop != 'keywords' &&
        prop != 'features' &&  prop != 'standardsAddressed') {
        return false;
      } else {
        let value = metadata[prop];
        if (prop === 'standardsAddressed') {
          value = JSON.stringify(value);
        }
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
    return false;
  }

  countVisibleProjects(set: LibraryProject[], implementationModel: string): number {
    return set.filter((project) => 'project' && project.visible &&
      project.implementationModel === implementationModel).length;
  }

  implementationModelUpdated(value: string): void {
    this.implementationModelValue = value;
  }
}
