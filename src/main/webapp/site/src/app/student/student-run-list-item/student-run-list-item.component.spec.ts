import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRun } from '../student-run';
import { StudentRunListItemComponent } from './student-run-list-item.component';
import { StudentModule } from "../student.module";
import { Observable } from "rxjs/Observable";
import { Config } from "../../domain/config";
import { ConfigService } from "../../services/config.service";

describe('StudentRunListItemComponent', () => {
  let component: StudentRunListItemComponent;
  let fixture: ComponentFixture<StudentRunListItemComponent>;

  beforeEach(async(() => {
    const configServiceStub = {
      getConfig(): Observable<Config> {
        const config : Config = {"context":"vle","logOutURL":"/logout","currentTime":20180730};
        return Observable.create( observer => {
          observer.next(config);
          observer.complete();
        });
      }
    };
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ StudentModule ],
      providers: [ { provide: ConfigService, useValue: configServiceStub } ]
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
    run.startTime = 20180612
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

  it('should say a run is available', () => {
    expect(component.isAvailable).toBeTruthy();
  });

  it('should say a run is not available yet', () => {
    component.run.startTime = 20180801;
    component.ngOnInit();
    expect(component.isAvailable).toBeFalsy();
  });
});
