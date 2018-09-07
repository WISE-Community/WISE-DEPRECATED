import { Component, OnInit } from '@angular/core';
import { DateFormatPipe } from 'ngx-moment';
import { TeacherService } from "../teacher.service";
import { TeacherRun } from "../teacher-run";

@Component({
  selector: 'app-teacher-run-list',
  templateUrl: './teacher-run-list.component.html',
  styleUrls: ['./teacher-run-list.component.scss']
})
export class TeacherRunListComponent implements OnInit {

  runs: TeacherRun[] = [];
  filteredRuns: TeacherRun[] = [];
  loaded: boolean = false; // whether array of runs has been retrieved from server
  searchValue: string = '';
  periods: string[] = [];
  filterOptions: any[] = [
    { 'value': '', 'label': 'All Periods' }
  ];
  filterValue: string = '';

  constructor(private teacherService: TeacherService) {
    teacherService.newRunSource$.subscribe(run => {
      let teacherRun: TeacherRun = run as TeacherRun;
      teacherRun.isHighlighted = true;
      this.runs.unshift(teacherRun);
      this.populatePeriods([teacherRun]);
      this.sortPeriods();
      this.populateFilterOptions();
      this.performSearchAndFilter();
    });
  }

  ngOnInit() {
    this.getRuns();
  }

  getRuns() {
    this.teacherService.getRuns()
      .subscribe(runs => {
        let teacherRuns: TeacherRun[] = runs as TeacherRun[];
        this.runs = teacherRuns;
        this.filteredRuns = teacherRuns;
        this.populatePeriods(teacherRuns);
        this.sortPeriods();
        this.populateFilterOptions();
        this.performSearchAndFilter();
        this.loaded = true;
      });
  }

  populatePeriods(runs: TeacherRun[]): void {
    for (let run of runs) {
      const periods = run.periods;
      for (let period of periods) {
        if (this.periods.indexOf(period) < 0) {
          this.periods.push(period);
        }
      }
    }
  }

  sortPeriods() {
    this.periods.sort(this.compareNumbers);
  }

  populateFilterOptions(): void {
    for (let period of this.periods) {
      this.filterOptions.push({ 'value': period, 'label': period });
    }
  }

  compareNumbers(a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  runSpansYears(run: TeacherRun) {
    const startYear = (new DateFormatPipe()).transform(run.startTime, 'Y');
    const endYear = (new DateFormatPipe()).transform(run.endTime, 'Y');
    return startYear != endYear;
  }

  runSpansMonths(run: TeacherRun) {
    const startMonth = (new DateFormatPipe()).transform(run.startTime, 'M');
    const endMonth = (new DateFormatPipe()).transform(run.endTime, 'M');
    return startMonth != endMonth;
  }

  runSpansDays(run: TeacherRun) {
    const startDay = (new DateFormatPipe()).transform(run.startTime, 'D');
    const endDay = (new DateFormatPipe()).transform(run.endTime, 'D');
    return startDay != endDay;
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

  performFilter(value: string) {
    this.filteredRuns = this.filteredRuns.filter( (run: TeacherRun) => {
      if (value !== '') {
        return run.periods.indexOf(value) !== -1;
      } else {
        return true;
      }
    });
  }

  performSearch(searchValue: string) {
    searchValue = searchValue.toLocaleLowerCase();
    // TODO: extract this for global use?
    return this.runs.filter((run: TeacherRun) =>
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
