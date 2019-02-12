import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { LibraryProject } from "../libraryProject";
import { LibraryService } from "../../../services/library.service";
import { NGSSStandards } from "../ngssStandards";
import { Standard } from "../standard";
import { ProjectFilterOptions } from "../../../domain/projectFilterOptions";

@Component({
  selector: 'app-library-filters',
  templateUrl: './library-filters.component.html',
  styleUrls: ['./library-filters.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LibraryFiltersComponent implements OnInit {

  allProjects: LibraryProject[] = [];
  libraryProjects: LibraryProject[] = [];
  communityProjects: LibraryProject[] = [];
  sharedProjects: LibraryProject[] = [];
  personalProjects: LibraryProject[] = [];

  @Input()
  split: boolean = false;

  @Output()
  update: EventEmitter<object> = new EventEmitter<object>();

  searchValue: string = '';
  dciArrangementOptions: Standard[] = [];
  dciArrangementValue = [];
  disciplineOptions: Standard[] = [];
  disciplineValue = [];
  peOptions: Standard[] = [];
  peValue = [];
  showFilters: boolean = false;

  constructor(private libraryService: LibraryService) {
    libraryService.officialLibraryProjectsSource$.subscribe((libraryProjects: LibraryProject[]) => {
        this.libraryProjects = libraryProjects;
        this.populateFilterOptions();
      });
    libraryService.communityLibraryProjectsSource$.subscribe((communityProjects: LibraryProject[]) => {
        this.communityProjects = communityProjects;
        this.populateFilterOptions();
      });
    libraryService.sharedLibraryProjectsSource$.subscribe((sharedProjects: LibraryProject[]) => {
        this.sharedProjects = sharedProjects;
        this.populateFilterOptions();
      });
    libraryService.personalLibraryProjectsSource$.subscribe((personalProjects: LibraryProject[]) => {
        this.personalProjects = personalProjects;
        this.populateFilterOptions();
      });
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.projects) {
      this.populateFilterOptions();
    }
  }

  /**
   * Iterate through list of projects to populate metadata filter options
   */
  populateFilterOptions(): void {
    this.allProjects = this.getAllProjects();
    for (let project of this.allProjects) {
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

  getAllProjects() {
    return this.libraryProjects
      .concat(this.communityProjects)
      .concat(this.sharedProjects)
      .concat(this.personalProjects);
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
   * Check and return whether there are any active filters
   * @return {boolean}
   */
  hasFilters(): boolean {
    return this.dciArrangementValue.length > 0 || this.peValue.length > 0 || this.disciplineValue.length > 0;
  }

  /**
   * Given new search string, filter for visible projects
   * @param {string} value
   */
  searchUpdated(value: string): void {
    this.searchValue = value.toLocaleLowerCase();
    this.emitFilterValues();
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
    this.emitFilterValues();
  }

  emitFilterValues() {
    const filterOptions: ProjectFilterOptions = {
      searchValue: this.searchValue,
      disciplineValue: this.disciplineValue,
      dciArrangementValue: this.dciArrangementValue,
      peValue: this.peValue
    };
    this.libraryService.filterOptions(filterOptions);
  }

  reset() {
    this.resetFilterOptions();
    this.emitFilterValues();
  }

  resetFilterOptions() {
    this.dciArrangementValue = [];
    this.disciplineValue = [];
    this.peValue = [];
  }
}
