import { TestBed } from "@angular/core/testing";
import { configureTestSuite } from "ng-bullet";
import { NotebookLauncherComponent } from "./notebook-launcher.component";

let component: NotebookLauncherComponent;

describe('NotebookLauncherComponent', () => {

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ NotebookLauncherComponent ]
    });
  })

  beforeEach(() => {
    const fixture = TestBed.createComponent(NotebookLauncherComponent);
    component = fixture.componentInstance;
    component.config = createConfig();
  })

  isShowButton();
});

function createConfig() {
  return {
    itemTypes: {
      note: {
        enableAddNote: true
      }
    }
  };
}

function isShowButton() {
  it('should check if we should show the button when notes are not visible', () => {
    component.notesVisible = false;
    expect(component.isShowButton()).toEqual(true);
  });
  it('should check if we should show the button when notes are visible and add note is enabled',
      () => {
    component.notesVisible = true;
    component.config.itemTypes.note.enableAddNote = true;
    expect(component.isShowButton()).toEqual(true);
  });
  it('should check if we should show the button when notes are visible and add note is not enabled',
      () => {
    component.notesVisible = true;
    component.config.itemTypes.note.enableAddNote = false;
    expect(component.isShowButton()).toEqual(false);
  });
}
