import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { LibraryGroupThumbsComponent } from './library-group-thumbs.component';
import { LibraryGroup } from "../libraryGroup";

describe('LibraryGroupThumbsComponent', () => {
  let component: LibraryGroupThumbsComponent;
  let fixture: ComponentFixture<LibraryGroupThumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ BrowserAnimationsModule ],
      declarations: [ LibraryGroupThumbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryGroupThumbsComponent);
    component = fixture.componentInstance;
    const group: LibraryGroup = new LibraryGroup();
    group.id = 'testingGroup';
    group.type = 'group';
    group.notes = 'Testing Group';
    group.children = [];
    component.group = group;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
