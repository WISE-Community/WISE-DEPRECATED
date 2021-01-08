import { Component, OnInit } from '@angular/core';
import { DateFormatPipe } from 'ngx-moment';
import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { ConfigService } from '../../services/config.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AddProjectDialogComponent } from '../add-project-dialog/add-project-dialog.component';

@Component({
  selector: 'app-student-run-list',
  templateUrl: './student-run-list.component.html',
  styleUrls: ['./student-run-list.component.scss']
})
export class StudentRunListComponent implements OnInit {
  runs: StudentRun[] = [];
  filteredRuns: StudentRun[] = [];
  search: string = '';
  loaded: boolean = false;
  showAll: boolean = false;

  constructor(
    private studentService: StudentService,
    private configService: ConfigService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    studentService.newRunSource$.subscribe((run) => {
      run.isHighlighted = true;
      this.runs.unshift(new StudentRun(run));
      if (!this.showAll) {
        let index = this.getRunIndex(run);
        if (index > 9) {
          this.showAll = true;
        }
      }
      setTimeout(() => {
        document.getElementById(`run${run.id}`).scrollIntoView();
      }, 1000);
    });
  }

  ngOnInit() {
    this.getRuns();
  }

  getRuns() {
    this.studentService.getRuns().subscribe((runs) => {
      for (let run of runs) {
        this.runs.push(new StudentRun(run));
      }
      this.filteredRuns = runs;
      this.searchUpdated(this.search);
      this.loaded = true;
      this.route.queryParams.subscribe((params) => {
        if (params['accessCode'] != null) {
          this.handleClassroomAccessCode(params['accessCode']);
        }
      });
    });
  }

  sortByStartTimeDesc(a, b) {
    let aStartTime = a.startTime;
    let bStartTime = b.startTime;
    if (aStartTime < bStartTime) {
      return 1;
    } else if (aStartTime > bStartTime) {
      return -1;
    } else {
      return 0;
    }
  }

  getRunIndex(run: StudentRun) {
    for (let i = 0; i < this.runs.length; i++) {
      if (this.runs[i].id === run.id) {
        return i;
      }
    }
    return null;
  }

  runSpansYears(run: StudentRun) {
    const startYear = new DateFormatPipe().transform(run.startTime, 'Y');
    const endYear = new DateFormatPipe().transform(run.endTime, 'Y');
    return startYear != endYear;
  }

  runSpansMonths(run: StudentRun) {
    if (this.runSpansYears(run)) {
      return true;
    }
    const startMonth = new DateFormatPipe().transform(run.startTime, 'M');
    const endMonth = new DateFormatPipe().transform(run.endTime, 'M');
    return startMonth != endMonth;
  }

  runSpansDays(run: StudentRun) {
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
    for (let run of this.filteredRuns) {
      if (run.isActive(now)) {
        total++;
      }
    }
    return total;
  }

  completedTotal(): number {
    let total = 0;
    const now = this.configService.getCurrentServerTime();
    for (let run of this.filteredRuns) {
      if (run.isCompleted(now)) {
        total++;
      }
    }
    return total;
  }

  scheduledTotal(): number {
    let total = 0;
    const now = this.configService.getCurrentServerTime();
    for (let run of this.filteredRuns) {
      if (run.isScheduled(now)) {
        total++;
      }
    }
    return total;
  }

  searchUpdated(value: string) {
    this.search = value;
    this.filteredRuns = this.search ? this.performFilter(this.search) : this.runs;
  }

  performFilter(filterValue: string) {
    filterValue = this.search.toLocaleLowerCase();
    // TODO: extract this for global use?
    return this.runs.filter((run: StudentRun) =>
      Object.keys(run).some((prop) => {
        let value: any;
        if (prop === 'owner') {
          value = run[prop].displayName;
        } else {
          value = run[prop];
        }
        if (typeof value === 'undefined' || value === null) {
          return false;
        } else {
          return value.toString().toLocaleLowerCase().indexOf(filterValue) !== -1;
        }
      })
    );
  }

  handleClassroomAccessCode(accessCode: string) {
    for (const run of this.runs) {
      if (accessCode.toLowerCase() === run.runCode.toLowerCase()) {
        return setTimeout(() => {
          document.getElementById(`run${run.id}`).scrollIntoView();
        }, 1500);
      }
    }
    this.dialog.open(AddProjectDialogComponent);
  }

  reset(): void {
    this.searchUpdated('');
  }

  isRunActive(run) {
    return run.isActive(this.configService.getCurrentServerTime());
  }
}
