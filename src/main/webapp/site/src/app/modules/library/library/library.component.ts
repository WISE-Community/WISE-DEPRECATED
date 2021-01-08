import { EventEmitter, OnInit, Output, QueryList, ViewChildren, Directive } from '@angular/core';
import { ProjectFilterValues } from '../../../domain/projectFilterValues';
import { LibraryService } from '../../../services/library.service';
import { Standard } from '../standard';
import { LibraryProject } from '../libraryProject';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

@Directive()
export abstract class LibraryComponent implements OnInit {
  projects: LibraryProject[] = [];
  filteredProjects: LibraryProject[] = [];
  searchValue: string = '';
  dciArrangementOptions: Standard[] = [];
  dciArrangementValue = [];
  disciplineOptions: Standard[] = [];
  disciplineValue = [];
  peOptions: Standard[] = [];
  peValue = [];
  filterValues: ProjectFilterValues = new ProjectFilterValues();
  showFilters: boolean = false;
  pageSizeOptions: number[] = [12, 24, 48, 96];
  pageIndex: number = 0;
  pageSize: number = 12;
  lowIndex: number = 0;
  highIndex: number = 0;

  @Output('update')
  update: EventEmitter<number> = new EventEmitter<number>();

  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;

  constructor(protected libraryService: LibraryService) {
    libraryService.projectFilterValuesSource$.subscribe((projectFilterValues) => {
      this.filterUpdated(projectFilterValues);
    });
  }

  ngOnInit() {}

  pageChange(event?: PageEvent, scroll?: boolean): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.setPagination();
    if (scroll) {
      const listEl = document.querySelector('.library');
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
    return index >= this.lowIndex && index < this.highIndex;
  }

  filterUpdated(filterValues: ProjectFilterValues = null): void {
    if (filterValues) {
      this.filterValues = filterValues;
    }
    this.filteredProjects = [];
    this.searchValue = this.filterValues.searchValue;
    this.disciplineValue = this.filterValues.disciplineValue;
    this.dciArrangementValue = this.filterValues.dciArrangementValue;
    this.peValue = this.filterValues.peValue;
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
    this.emitNumberOfProjectsVisible(this.countVisibleProjects(this.filteredProjects));
    this.pageIndex = 0;
    this.setPagination();
  }

  emitNumberOfProjectsVisible(numProjectsVisible: number = null) {}

  hasFilters(): boolean {
    return (
      this.dciArrangementValue.length > 0 ||
      this.peValue.length > 0 ||
      this.disciplineValue.length > 0
    );
  }

  isSearchMatch(project: LibraryProject, searchValue: string): boolean {
    if (searchValue) {
      let data: any = project.metadata;
      data.id = project.id;
      return Object.keys(data).some((prop) => {
        // only check for match in specific metadata fields
        if (
          prop != 'title' &&
          prop != 'summary' &&
          prop != 'keywords' &&
          prop != 'features' &&
          prop != 'standardsAddressed' &&
          prop != 'id'
        ) {
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
