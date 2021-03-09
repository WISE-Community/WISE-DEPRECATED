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
import { NotebookItemComponent } from "./notebook-item.component";

let component: NotebookItemComponent;

describe('NotebookItemComponent', () => {
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      declarations: [ NotebookItemComponent ],
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
    const fixture = TestBed.createComponent(NotebookItemComponent);
    component = fixture.componentInstance;
    component.notebookUpdatedSubscription = new Subscription();
  });

  isItemInGroup();
  isNotebookItemActive();
});

function isItemInGroup() {
  it('should check if an notebook item is in group when it is not in the group', () => {
    component.item = { groups: ['Group A'] };
    expect(component.isItemInGroup('Group B')).toEqual(false);
  });
  it('should check if an notebook item is in group when it is in the group', () => {
    component.item = { groups: ['Group A'] };
    expect(component.isItemInGroup('Group A')).toEqual(true);
  });
}

function isNotebookItemActive() {
  it('should check if a notebook item is active when it is not active', () => {
    component.item = { serverDeleteTime: 1607704074794 };
    expect(component.isNotebookItemActive()).toEqual(false);
  });
  it('should check if a notebook item is active when it is active', () => {
    component.item = { serverDeleteTime: null };
    expect(component.isNotebookItemActive()).toEqual(true);
  });
}
