import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { UpgradeModule } from "@angular/upgrade/static";
import { configureTestSuite } from "ng-bullet";
import { Subscription } from "rxjs";
import { AnnotationService } from "../../../../../wise5/services/annotationService";
import { ConfigService } from "../../../../../wise5/services/configService";
import { NotebookService } from "../../../../../wise5/services/notebookService";
import { ProjectService } from "../../../../../wise5/services/projectService";
import { SessionService } from "../../../../../wise5/services/sessionService";
import { StudentAssetService } from "../../../../../wise5/services/studentAssetService";
import { StudentDataService } from "../../../../../wise5/services/studentDataService";
import { TagService } from "../../../../../wise5/services/tagService";
import { UtilService } from "../../../../../wise5/services/utilService";
import { NotebookComponent } from "./notebook.component";

let component: NotebookComponent;

describe('NotebookComponent', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      declarations: [ NotebookComponent ],
      providers: [
        AnnotationService,
        ConfigService,
        NotebookService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TagService,
        UtilService
      ]
    });
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(NotebookComponent);
    component = fixture.componentInstance;
    component.addNoteSubscription = new Subscription();
    component.closeNotebookSubscription = new Subscription();
    component.editNoteSubscription = new Subscription();
    component.notebookUpdatedSubscription = new Subscription();
    component.openNotebookSubscription = new Subscription();
  });

  closeNotes();
});

function closeNotes() {
  it('should close notes', () => {
    component.notesVisible = true;
    component.insertMode = true;
    component.closeNotes();
    expect(component.notesVisible).toEqual(false);
    expect(component.insertMode).toEqual(false);
  });
}
