import { Component, EventEmitter, OnInit, Output, ValueProvider, QueryList, ViewChildren, Injectable } from '@angular/core';
import { LibraryGroup } from "../libraryGroup";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";
import { NGSSStandards } from "../ngssStandards";
import { LibraryService } from "../../../services/library.service";
import { Standard } from "../standard";
import { LibraryProject } from "../libraryProject";
import { PageEvent, MatPaginator, MatPaginatorIntl } from '@angular/material';

export abstract class LibraryComponent implements OnInit {

  projects: LibraryProject[] = [];
  filteredProjects: LibraryProject[] = [];
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
  filterOptions: ProjectFilterOptions = new ProjectFilterOptions();
  showFilters: boolean = false;
  pageSizeOptions: number[] = [12, 24, 48, 96];
  pageIndex: number = 0;
  pageSize: number = 12;
  lowIndex: number = 0;
  highIndex: number = 0;

  @Output('update')
  update: EventEmitter<number> = new EventEmitter<number>();

  @ViewChildren(MatPaginator) paginators !: QueryList<MatPaginator>;

  constructor(protected libraryService: LibraryService) {
    libraryService.projectFilterOptionsSource$.subscribe((projectFilterOptions) => {
      this.filterUpdated(projectFilterOptions);
    });
  }

  ngOnInit() {
  }

  pageChange(event?:PageEvent, scroll?:boolean): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.setPagination();
    if (scroll) {
      const listEl = document.querySelector('.library__content');
      listEl.scrollIntoView();
    }
  }

  setPageBounds(): void {
    this.lowIndex = this.pageIndex * this.pageSize;
    this.highIndex = this.lowIndex + this.pageSize;
  }

  setPagination(): void {
    if (this.paginators) {
      this.paginators.toArray().forEach((paginator) => {
        paginator.pageIndex = this.pageIndex;
      });
      this.setPageBounds();
    }
  }

  isOnPage(index: number): boolean {
    return (index >= this.lowIndex && index < this.highIndex);
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
  filterUpdated(filterOptions: ProjectFilterOptions = null): void {
    if (filterOptions) {
      this.filterOptions = filterOptions;
    }
    this.filteredProjects = [];
    this.searchValue = this.filterOptions.searchValue;
    this.disciplineValue = this.filterOptions.disciplineValue;
    this.dciArrangementValue = this.filterOptions.dciArrangementValue;
    this.peValue = this.filterOptions.peValue;
    for (let project of this.projects) {
      let filterMatch = false;
      let searchMatch = this.isSearchMatch(project, this.searchValue);
      if (searchMatch) {
        filterMatch = this.isFilterMatch(project);
      }
      project.visible = searchMatch && filterMatch;
      if (searchMatch && filterMatch) {
        this.filteredProjects.push(project);
      }
    }
    this.emitNumberOfProjectsVisible();
    this.pageIndex = 0;
    this.setPagination();
  }

  emitNumberOfProjectsVisible(numProjectsVisible: number = null) {
    if (numProjectsVisible) {
      this.update.emit(numProjectsVisible);
    } else {
      this.update.emit(this.filteredProjects.length);
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
    if (searchValue) {
      let data: any = project.metadata;
      data.id = project.id;
      return Object.keys(data).some(prop => {
        // only check for match in specific metadata fields
        if (prop != 'title' && prop != 'summary' && prop != 'keywords' &&
          prop != 'features' &&  prop != 'standardsAddressed' && prop != 'id') {
          return false;
        } else {
          let value = data[prop];
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
    } else {
      return true;
    }
  }

  /**
   * Check and return whether project metadata matches any of the filter values
   * @param {LibraryProject} project
   * @return {boolean}
   */
  isFilterMatch(project: LibraryProject): boolean {
     if (this.hasFilters()) {
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
    } else {
      return true;
    }
  }

  countVisibleProjects(set: LibraryProject[]): number {
    return set.filter((project) => 'project' && project.visible).length;
  }
}
