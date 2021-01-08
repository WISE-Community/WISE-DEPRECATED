import { Component, OnInit } from '@angular/core';
import { DateFormatPipe } from 'ngx-moment';
import { TeacherService } from '../teacher.service';
import { TeacherRun } from '../teacher-run';
import { ConfigService } from '../../services/config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-run-list',
  templateUrl: './teacher-run-list.component.html',
  styleUrls: ['./teacher-run-list.component.scss']
})
export class TeacherRunListComponent implements OnInit {
  runs: TeacherRun[] = [];
  personalRuns: TeacherRun[] = [];
  sharedRuns: TeacherRun[] = [];
  filteredRuns: TeacherRun[] = [];
  loaded: boolean = false;
  searchValue: string = '';
  periods: string[] = [];
  filterOptions: any[] = [{ value: '', label: 'All Periods' }];
  filterValue: string = '';
  isPersonalRunsRetrieved: boolean = false;
  isSharedRunsRetrieved: boolean = false;
  showAll: boolean = false;

  constructor(
    private teacherService: TeacherService,
    private configService: ConfigService,
    router: Router
  ) {
    teacherService.newRunSource$.subscribe((run) => {
      const teacherRun: TeacherRun = new TeacherRun(run);
      teacherRun.isHighlighted = true;
      this.runs.unshift(teacherRun);
      this.runs.sort(this.sortByStartTimeDesc);
      this.populatePeriods([teacherRun]);
      this.periods.sort();
      this.populateFilterOptions();
      this.reset();
      if (!this.showAll) {
        const index = this.getRunIndex(teacherRun);
        if (index > 9) {
          this.showAll = true;
        }
      }
      router.navigateByUrl('teacher/home/schedule').then(() => {
        setTimeout(() => {
          document.getElementById(`run${teacherRun.id}`).scrollIntoView();
        }, 1000);
      });
    });
  }

  ngOnInit() {
    this.getRuns();
    this.getSharedRuns();
  }

  getRuns(): void {
    this.teacherService.getRuns().subscribe((runs) => {
      this.personalRuns = [];
      for (const personalRun of runs) {
        this.personalRuns.push(new TeacherRun(personalRun));
      }
      this.isPersonalRunsRetrieved = true;
      this.processRunsIfReady();
    });
  }

  getRunIndex(run: TeacherRun) {
    for (let i = 0; i < this.runs.length; i++) {
      if (this.runs[i].id === run.id) {
        return i;
      }
    }
    return null;
  }

  getSharedRuns(): void {
    this.teacherService.getSharedRuns().subscribe((runs) => {
      this.sharedRuns = [];
      for (const sharedRun of runs) {
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
    this.runs = runs;
    this.filteredRuns = runs;
    this.populatePeriods(runs);
    this.periods.sort();
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
    for (const run of runs) {
      const periods = run.periods;
      for (const period of periods) {
        if (this.periods.indexOf(period) < 0) {
          this.periods.push(period);
        }
      }
    }
  }

  populateFilterOptions(): void {
    for (const period of this.periods) {
      this.filterOptions.push({ value: period, label: period });
    }
  }

  runSpansYears(run: TeacherRun) {
    const startYear = new DateFormatPipe().transform(run.startTime, 'Y');
    const endYear = new DateFormatPipe().transform(run.endTime, 'Y');
    return startYear != endYear;
  }

  runSpansMonths(run: TeacherRun) {
    if (this.runSpansYears(run)) {
      return true;
    }
    const startMonth = new DateFormatPipe().transform(run.startTime, 'M');
    const endMonth = new DateFormatPipe().transform(run.endTime, 'M');
    return startMonth != endMonth;
  }

  runSpansDays(run: TeacherRun) {
    if (this.runSpansMonths(run)) {
      return true;
    }
    const startDay = new DateFormatPipe().transform(run.startTime, 'D');
    const endDay = new DateFormatPipe().transform(run.endTime, 'D');
    return startDay != endDay;
  }

  activeTotal(): number {
    let total = 0;
    const now = this.configService.getCurrentServerTime();
    for (const run of this.filteredRuns) {
      if (run.isActive(now)) {
        total++;
      }
    }
    return total;
  }

  completedTotal(): number {
    let total = 0;
    const now = this.configService.getCurrentServerTime();
    for (const run of this.filteredRuns) {
      if (run.isCompleted(now)) {
        total++;
      }
    }
    return total;
  }

  scheduledTotal(): number {
    let total = 0;
    const now = this.configService.getCurrentServerTime();
    for (const run of this.filteredRuns) {
      if (run.isScheduled(now)) {
        total++;
      }
    }
    return total;
  }

  performSearchAndFilter(): void {
    this.filteredRuns = this.searchValue ? this.performSearch(this.searchValue) : this.runs;
    this.performFilter(this.filterValue);
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
      Object.keys(run).some((prop) => {
        const value = run[prop];
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

  reset(): void {
    this.searchValue = '';
    this.filterValue = '';
    this.performSearchAndFilter();
  }

  isRunActive(run) {
    return run.isActive(this.configService.getCurrentServerTime());
  }
}
