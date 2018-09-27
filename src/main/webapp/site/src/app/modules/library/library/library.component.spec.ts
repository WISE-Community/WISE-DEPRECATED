import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryComponent } from './library.component';
import { LibraryService } from "../../../services/library.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";

export class MockLibraryService {

}

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryComponent ],
      providers: [
        { provide: LibraryService, useClass: MockLibraryService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(LibraryComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
