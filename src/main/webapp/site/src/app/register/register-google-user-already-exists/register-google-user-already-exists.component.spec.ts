import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterGoogleUserAlreadyExistsComponent } from './register-google-user-already-exists.component';
import { RegisterModule } from "../register.module";
import { Observable } from "rxjs";
import { Config } from "../../domain/config";
import { ConfigService } from "../../services/config.service";

describe('RegisterGoogleUserAlreadyExistsComponent', () => {
  let component: RegisterGoogleUserAlreadyExistsComponent;
  let fixture: ComponentFixture<RegisterGoogleUserAlreadyExistsComponent>;

  beforeEach(async(() => {
    const configServiceStub = {
      getConfig(): Observable<Config> {
        const config : Config = {"contextPath":"vle","logOutURL":"/logout","currentTime":20180730};
        return Observable.create( observer => {
          observer.next(config);
          observer.complete();
        });
      },
      getContextPath(): string {
        return '/wise';
      }
    };
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ RegisterModule ],
      providers: [
        { provide: ConfigService, useValue: configServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterGoogleUserAlreadyExistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
