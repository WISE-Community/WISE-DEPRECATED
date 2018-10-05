import { Component, OnInit } from '@angular/core';
import { DateFormatPipe } from 'ngx-moment';
import { TeacherService } from '../teacher.service';
import { TeacherRun } from '../teacher-run';

@Component({
  selector: 'app-teacher-run-list',
  templateUrl: './teacher-run-list.component.html',
  styleUrls: ['./teacher-run-list.component.scss'],
})
export class TeacherRunListComponent implements OnInit {
  runs: TeacherRun[] = [];
  personalRuns: TeacherRun[] = [];
  sharedRuns: TeacherRun[] = [];
  filteredRuns: TeacherRun[] = [];
  filteredActiveTotal: number = 0;
  filteredCompletedTotal: number = 0;
  filteredScheduledTotal: number = 0;
  loaded: boolean = false; // whether array of runs has been retrieved from server
  searchValue: string = '';
  periods: string[] = [];
  filterOptions: any[] = [{ value: '', label: 'All Periods' }];
  filterValue: string = '';
  isPersonalRunsRetrieved: boolean = false;
  isSharedRunsRetrieved: boolean = false;

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
    this.getSharedRuns();
  }

  getRuns(): void {
    this.teacherService.getRuns().subscribe(runs => {
      this.personalRuns = [];
      for (let personalRun of runs) {
        this.personalRuns.push(new TeacherRun(personalRun));
      }
      this.isPersonalRunsRetrieved = true;
      this.processRunsIfReady();
    });
  }

  getSharedRuns(): void {
    this.teacherService.getSharedRuns().subscribe(runs => {
      this.sharedRuns = [];
      for (let sharedRun of runs) {
        const teacherRun = new TeacherRun(sharedRun);
        teacherRun.shared = true;
        this.sharedRuns.push(teacherRun);
      }
      this.isSharedRunsRetrieved = true;
      this.processRunsIfReady();
    });
  }

  processRunsIfReady() {
    if (this.isPersonalRunsRetrieved && this.isSharedRunsRetrieved) {
      this.processRuns();
    }
  }

  processRuns() {
    const runs = this.personalRuns.concat(this.sharedRuns);
    runs.sort(this.sortByStartTimeDesc);
    this.runs = runs;
    this.filteredRuns = runs;
    this.populatePeriods(runs);
    this.sortPeriods();
    this.populateFilterOptions();
    this.performSearchAndFilter();
    this.loaded = true;
  }

  sortByStartTimeDesc(a, b) {
    if (a.startTime < b.startTime) {
      return 1;
    } else if (a.startTime > b.startTime) {
      return -1;
    } else {
      return 0;
    }
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

  sortPeriods(): void {
    this.periods.sort(this.compareNumbers);
  }

  populateFilterOptions(): void {
    for (let period of this.periods) {
      this.filterOptions.push({ value: period, label: period });
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
    const startYear = new DateFormatPipe().transform(run.startTime, 'Y');
    const endYear = new DateFormatPipe().transform(run.endTime, 'Y');
    return startYear != endYear;
  }

  runSpansMonths(run: TeacherRun) {
    const startMonth = new DateFormatPipe().transform(run.startTime, 'M');
    const endMonth = new DateFormatPipe().transform(run.endTime, 'M');
    return startMonth != endMonth;
  }

  runSpansDays(run: TeacherRun) {
    const startDay = new DateFormatPipe().transform(run.startTime, 'D');
    const endDay = new DateFormatPipe().transform(run.endTime, 'D');
    return startDay != endDay;
  }

  runIsActive(run: TeacherRun) {
    if (run.endTime) {
      return false;
    }
    let startTime = new Date(run.startTime).getTime();
    let now = new Date().getTime();
    if (startTime <= now) {
      return true;
    }
    return false;
  }

  performSearchAndFilter(): void {
    this.filteredRuns = this.searchValue
      ? this.performSearch(this.searchValue)
      : this.runs;
    this.performFilter(this.filterValue);
    this.filteredActiveTotal = 0;
    this.filteredCompletedTotal = 0;
    this.filteredScheduledTotal = 0;
    let now: Date = new Date();
    for (let run of this.filteredRuns) {
      if (run.endTime) {
        this.filteredCompletedTotal++;
      } else if (this.runIsActive(run)) {
        this.filteredActiveTotal++;
      } else {
        this.filteredScheduledTotal++;
      }
    }
  }

  searchChanged(searchValue: string): void {
    this.searchValue = searchValue;
    this.performSearchAndFilter();
  }

  filterChanged(value: string): void {
    this.filterValue = value;
    this.performSearchAndFilter();
  }

  performFilter(value: string) {
    this.filteredRuns = this.filteredRuns.filter((run: TeacherRun) => {
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
          return (
            JSON.stringify(value)
              .toLocaleLowerCase()
              .indexOf(searchValue) !== -1
          );
        } else {
          return (
            value
              .toString()
              .toLocaleLowerCase()
              .indexOf(searchValue) !== -1
          );
        }
      }),
    );
  }

  reset(): void {
    this.searchValue = '';
    this.filterValue = '';
    this.performSearchAndFilter();
  }
}
