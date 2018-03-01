import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRun } from '../student-run';
import { StudentRunListItemComponent } from './student-run-list-item.component';
import { MatCardModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule } from "@angular/material";
import {MomentModule} from "angular2-moment";

describe('StudentRunListItemComponent', () => {
  let component: StudentRunListItemComponent;
  let fixture: ComponentFixture<StudentRunListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentRunListItemComponent ],
      imports: [
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MomentModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentRunListItemComponent);
    component = fixture.componentInstance;
    const run: StudentRun = new StudentRun();
    run.id = 1;
    run.name = "Photosynthesis";
    run.teacherFirstname = "Mr.";
    run.teacherLastname = "Happy";
    run.projectThumb = "Happy.png";
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    try {
      expect(component).toBeTruthy();
    } catch (e) {
      console.log(e);
    }
  });
});
