import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import { AnnotationService } from '../../services/annotationService';
import { ConfigService } from '../../services/configService';
import { NotebookService } from '../../services/notebookService';
import { ProjectService } from '../../services/projectService';
import { SessionService } from '../../services/sessionService';
import { StudentAssetService } from '../../services/studentAssetService';
import { StudentDataService } from '../../services/studentDataService';
import { TagService } from '../../services/tagService';
import { TeacherProjectService } from '../../services/teacherProjectService';
import { UtilService } from '../../services/utilService';
import { WiseAuthoringTinymceEditorComponent } from './wise-authoring-tinymce-editor.component';

let component: WiseAuthoringTinymceEditorComponent;
let fixture: ComponentFixture<WiseAuthoringTinymceEditorComponent>;

describe('WiseAuthoringTinymceEditorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WiseAuthoringTinymceEditorComponent],
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        NotebookService,
        ProjectAssetService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TagService,
        TeacherProjectService,
        UtilService
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WiseAuthoringTinymceEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  getAllowedFileTypeFromMeta();
});

function getAllowedFileTypeFromMeta() {
  it('should get allowed file types from meta when the filetype is image', () => {
    expectAllowedFileTypeToEqual('image', ['image']);
  });
  it('should get allowed file types from meta when the filetype is media', () => {
    expectAllowedFileTypeToEqual('media', ['audio', 'video']);
  });
  it('should get allowed file types from meta when filetype is not specified', () => {
    expectAllowedFileTypeToEqual(null, ['any']);
  });
}

function expectAllowedFileTypeToEqual(metaFileType: string, allowedFileTypes: string[]) {
  const meta = { filetype: metaFileType };
  expect(component.getAllowedFileTypesFromMeta(meta)).toEqual(allowedFileTypes);
}
