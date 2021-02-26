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
import { NotebookReportComponent } from "./notebook-report.component";

let component: NotebookReportComponent;

describe('NotebookReportComponent', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      declarations: [ NotebookReportComponent ],
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
    const fixture = TestBed.createComponent(NotebookReportComponent);
    component = fixture.componentInstance;
    component.notebookItemAnnotationReceivedSubscription = new Subscription();
    component.showReportAnnotationsSubscription = new Subscription();
    component.config = createConfig();
  });

  isNoteEnabled();
  setSaveTime();
  clearSaveTime();
});

function createConfig() {
  return {
    itemTypes: {
      note: {
        enabled: true
      }
    }
  }
}

function isNoteEnabled() {
  it('should check if note is enabled when it is not enabled', () => {
    component.config.itemTypes.note.enabled = false;
    expect(component.isNoteEnabled()).toEqual(false);
  });
  it('should check if note is enabled when it is enabled', () => {
    component.config.itemTypes.note.enabled = true;
    expect(component.isNoteEnabled()).toEqual(true);
  });
}

function setSaveTime() {
  it('should set the save time', () => {
    expect(component.saveTime).toEqual(null);
    const saveTimestamp = 1607718407613;
    component.setSaveTime(saveTimestamp);
    expect(component.saveTime).toEqual(saveTimestamp);
  });
}

function clearSaveTime() {
  it('should clear the saved time', () => {
    const saveTimestamp = 1607718407613;
    component.saveTime = saveTimestamp;
    component.clearSaveTime();
    expect(component.saveTime).toEqual(null);
  });
}
