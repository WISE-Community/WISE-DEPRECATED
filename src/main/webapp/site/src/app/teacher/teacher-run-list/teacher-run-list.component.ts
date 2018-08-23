import { Component, OnInit } from '@angular/core';
import { TeacherService } from "../teacher.service";
import { Run } from "../../domain/run";

@Component({
  selector: 'app-teacher-run-list',
  templateUrl: './teacher-run-list.component.html',
  styleUrls: ['./teacher-run-list.component.scss']
})
export class TeacherRunListComponent implements OnInit {

  runs: Run[] = [];
  filteredRuns: Run[] = [];
  loaded: boolean = false; // whether array of runs has been retrieved from server
  searchValue: string = '';
  filterOptions: any[] = [
    { value: 'active', viewValue: 'Active' },
    { value: 'archived', viewValue: 'Archived' }

  ];
  filterValue: string = 'projectsAndRuns';

  constructor(private teacherService: TeacherService) {
    teacherService.newRunSource$.subscribe(run => {
      run.isHighlighted = true;
      this.runs.unshift(run);
      this.performSearchAndFilter();
    });
  }

  ngOnInit() {
    this.getRuns();
  }

  getRuns() {
    this.teacherService.getRuns()
      .subscribe(runs => {
        this.runs = runs;
        this.filteredRuns = runs;
        this.performSearchAndFilter();
        this.loaded = true;
      });
  }

  performSearchAndFilter() {
    this.filteredRuns = this.searchValue ? this.performSearch(this.searchValue) : this.runs;
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
      case 'active': {
        this.filteredRuns = this.filteredRuns.filter((run: Run) => {
          return run.endTime == null;
        });
        break;
      }
      case 'archived': {
        this.filteredRuns = this.filteredRuns.filter((run: Run) => {
          return run.endTime != null;
        });
        break;
      }
    }
  }

  performSearch(searchValue: string) {
    searchValue = searchValue.toLocaleLowerCase();
    // TODO: extract this for global use?
    return this.runs.filter((run: Run) =>
      Object.keys(run).some(prop => {
        let value = run[prop];
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
