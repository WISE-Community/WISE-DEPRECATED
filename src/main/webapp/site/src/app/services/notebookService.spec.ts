import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { NotebookService } from '../../../../wise5/services/notebookService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UtilService } from '../../../../wise5/services/utilService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { TagService } from '../../../../wise5/services/tagService';
import demoNotebookItems_import from './sampleData/sample_notebookItems.json';
import demoNotebooksByWorkgroupId_import from './sampleData/sample_notebooksByWorkgroup.json';
import demoPublicNotebookItems_import from './sampleData/sample_publicNotebookItems.json';
import demoProject_import from './sampleData/curriculum/Demo.project.json';
import { SessionService } from '../../../../wise5/services/sessionService';

let http: HttpTestingController;
let configService: ConfigService;
let projectService: ProjectService;
let studentDataService: StudentDataService;
let utilService: UtilService;
let service: NotebookService;
let demoNotebookItems: any;
let demoNotebooksByWorkgroupId: any;
let demoPublicNotebookItems: any;
let demoProject: any;
let editNoteData: any;
let localNotebookItemId: string;
const studentNotebookURL = 'http://localhost:8080/student/notebook/run/1';
const teacherNotebookURL = 'http://localhost:8080/teacher/notebook/run/1';

describe('NotebookService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        NotebookService,
        AnnotationService,
        ConfigService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TagService,
        UtilService
      ]
    });
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
    projectService = TestBed.get(ProjectService);
    studentDataService = TestBed.get(StudentDataService);
    utilService = TestBed.get(UtilService);
    spyOn(utilService, 'broadcastEventInRootScope').and.callFake(() => {});
    service = TestBed.get(NotebookService);
    demoNotebookItems = JSON.parse(JSON.stringify(demoNotebookItems_import));
    demoNotebooksByWorkgroupId = JSON.parse(JSON.stringify(demoNotebooksByWorkgroupId_import));
    demoPublicNotebookItems = JSON.parse(JSON.stringify(demoPublicNotebookItems_import));
    demoProject = JSON.parse(JSON.stringify(demoProject_import));
    service.notebooksByWorkgroup = demoNotebooksByWorkgroupId;
    localNotebookItemId = 'dlh2mz38vb';
    editNoteData = {
      runId: 1,
      workgroupId: 2,
      type: 'note',
      localNotebookItemId: localNotebookItemId,
      content: { text: 'some new text', attachments: [], clientSaveTime: 1500000100000 },
      clientSaveTime: 1500000100000,
      periodId: 1,
      nodeId: 'node1',
      title: 'Note from Step #1'
    };
  });

  shouldUpdateNote();
  shouldDeleteNote();
  shouldReviveNote();
  shouldGetLatestNotebookReportItemByReportId();
  shouldGetTemplateReportItemByReportId();
  shouldGetMaxScoreByReportId();
  shouldRetrieveNotebookItems();
  shouldHandleRetrieveNotebookItems();
  shouldAddToNotebooksByWorgkroup();
  shouldGroupNotebookItems();
  shouldGetPrivateNotebookItems();
  shouldGetNotebookByWorkgroup();
  shouldRetrievePublicNotebookItems();
  shouldHandleRetrievePublicNotebookItems();
  shouldSaveNotebookItem();
  shouldHandleSaveNotebookItem();
  shouldCopyNotebookItem();
  shouldHandleNewNotebookItem();
});

function shouldUpdateNote() {
  it('should update a note', () => {
    spyOn(configService, 'isPreview').and.returnValue(false);
    spyOn(configService, 'getWorkgroupId').and.returnValue(2);
    spyOn(configService, 'getNotebookURL').and.returnValue(studentNotebookURL);
    spyOn(studentDataService, 'updateNodeStatuses');
    const note = service.getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, 2);
    service.updateNote(note).then(() => {
      http.expectOne(studentNotebookURL).flush({});
      expect(service.handleNewNotebookItem).toHaveBeenCalled();
      expect(studentDataService.updateNodeStatuses).toHaveBeenCalled();
    });
  });
}

function shouldDeleteNote() {
  it('should delete a note in preview mode', (done) => {
    spyOn(configService, 'isPreview').and.returnValue(true);
    spyOn(configService, 'getWorkgroupId').and.returnValue(2);
    spyOn(studentDataService, 'updateNodeStatuses');
    let note = service.getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, 2);
    expect(note.serverDeleteTime).toBeNull();
    service.deleteNote(note).then(() => {
      note = service.getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, 2);
      expect(note.serverDeleteTime).not.toBeNull();
      expect(studentDataService.updateNodeStatuses).toHaveBeenCalled();
      done();
    });
  });
}

function shouldReviveNote() {
  it('should revive a note in preview mode', (done) => {
    spyOn(configService, 'isPreview').and.returnValue(true);
    spyOn(configService, 'getWorkgroupId').and.returnValue(2);
    spyOn(studentDataService, 'updateNodeStatuses');
    let note = service.getLatestNotebookItemByLocalNotebookItemId('stb6er46ad', 2);
    service.reviveNote(note).then(() => {
      note = service.getLatestNotebookItemByLocalNotebookItemId('stb6er46ad', 2);
      expect(note.serverDeleteTime).toBeNull();
      expect(studentDataService.updateNodeStatuses).toHaveBeenCalled();
      done();
    });
  });
}

function shouldGetLatestNotebookReportItemByReportId() {
  it('should get the latest notebook report item by report id', () => {
    spyOn(configService, 'getWorkgroupId').and.returnValue(2);
    let report = service.getLatestNotebookReportItemByReportId('finalReport');
    expect(report.content.title).toBe('Final Report');
    report = service.getLatestNotebookReportItemByReportId('report');
    expect(report).toBeNull();
    report = service.getLatestNotebookReportItemByReportId('finalReport', 1);
    expect(report).toBeNull();
  });
}

function shouldGetTemplateReportItemByReportId() {
  it('should get the notebook report item template', () => {
    let reportTemplate = service.getTemplateReportItemByReportId('finalReport');
    expect(reportTemplate).toBeNull();
    service.config = demoProject.notebook;
    reportTemplate = service.getTemplateReportItemByReportId('finalReport');
    expect(reportTemplate.content.title).toBe('Final Report');
  });
}

function shouldGetMaxScoreByReportId() {
  it('should get the notebook report max score', () => {
    service.config = demoProject.notebook;
    expect(service.getMaxScoreByReportId('finalReport')).toBe(0);
    service.config.itemTypes.report.notes[0].maxScore = 10;
    expect(service.getMaxScoreByReportId('finalReport')).toBe(10);
  });
}

function shouldRetrieveNotebookItems() {
  it('should retrieve all notebook items for a run', () => {
    spyOn(configService, 'isPreview').and.returnValue(false);
    spyOn(configService, 'getNotebookURL').and.returnValue(teacherNotebookURL);
    service.retrieveNotebookItems().then(() => {
      expect(service.handleRetrieveNotebookItems).toHaveBeenCalled();
      http.expectOne(teacherNotebookURL).flush([]);
    });
  });

  it('should retrieve notebook items for a workgroup in a run', () => {
    spyOn(configService, 'isPreview').and.returnValue(false);
    spyOn(configService, 'getWorkgroupId').and.returnValue(2);
    spyOn(configService, 'getNotebookURL').and.returnValue(studentNotebookURL);
    service.retrieveNotebookItems().then(() => {
      expect(service.handleRetrieveNotebookItems).toHaveBeenCalled();
      http.expectOne(`${studentNotebookURL}/workgroup/2`).flush([]);
    });
  });

  it('should retrieve notebook items for a workgroup in preview mode', () => {
    spyOn(configService, 'isPreview').and.returnValue(true);
    spyOn(configService, 'getWorkgroupId').and.returnValue(1);
    service.retrieveNotebookItems();
    const notebook = service.getNotebookByWorkgroup(1);
    expect(notebook.allItems).toEqual([]);
    expect(notebook.items).toEqual({});
    expect(notebook.deletedItems).toEqual({});
  });
}

function shouldHandleRetrieveNotebookItems() {
  it('should group retrieved notebook items by workgroup id', () => {
    service.handleRetrieveNotebookItems(demoNotebookItems);
    expect(service.notebooksByWorkgroup['2'].deletedItems['stb6er46ad'].length).toBe(1);
    expect(service.notebooksByWorkgroup['3'].items['finalReport'][0].content.content).toContain(
      'This is a paragraph with some new text.'
    );
  });
}

function shouldAddToNotebooksByWorgkroup() {
  it('should update a private notebook item', () => {
    let note = service.getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, 2);
    expect(note.content.text).toBe('test');
    expect(note.clientSaveTime).toBe(1500000000000);
    service.addToNotebooksByWorgkroup(editNoteData, editNoteData.workgroupId);
    note = service.getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, 2);
    expect(note.content.text).toBe('some new text');
    expect(note.clientSaveTime).toBe(1500000100000);
  });

  it('should add a new private notebook item', () => {
    const newLocalNotebookItemId = 'hb45ros80n';
    const newNoteData = { ...editNoteData };
    newNoteData.localNotebookItemId = newLocalNotebookItemId;
    newNoteData.workgroupId = 4;
    let note = service.getLatestNotebookItemByLocalNotebookItemId(newLocalNotebookItemId, 4);
    expect(note).toBeNull();
    service.addToNotebooksByWorgkroup(newNoteData, newNoteData.workgroupId);
    note = service.getLatestNotebookItemByLocalNotebookItemId(newLocalNotebookItemId, 4);
    expect(note.content.text).toBe('some new text');
    expect(note.workgroupId).toBe(4);
  });
}

function shouldGroupNotebookItems() {
  it('should group notebook items by workgroup id', () => {
    service.handleRetrieveNotebookItems(demoNotebookItems);
    for (const workgroupId in service.notebooksByWorkgroup) {
      const notebook = service.notebooksByWorkgroup[workgroupId];
      delete notebook['items'];
      delete notebook['deletedItems'];
    }
    service.groupNotebookItems();
    expect(service.notebooksByWorkgroup['2'].deletedItems['stb6er46ad'].length).toBe(1);
    expect(service.notebooksByWorkgroup['3'].items['finalReport'][0].content.content).toContain(
      'This is a paragraph with some new text.'
    );
  });
}

function shouldGetPrivateNotebookItems() {
  it('should get private notebook items for a workgroup', () => {
    spyOn(configService, 'getWorkgroupId').and.returnValue(2);
    let privateNotebookItems = service.getPrivateNotebookItems();
    expect(privateNotebookItems.length).toBe(3);
    expect(service.getLatestNotebookReportItemByReportId('finalReport').content.content).toContain(
      'This is a paragraph.'
    );
    privateNotebookItems = service.getPrivateNotebookItems(4);
    expect(privateNotebookItems.length).toBe(0);
  });
}

function shouldGetNotebookByWorkgroup() {
  it('should get notebook for a workgroup', () => {
    spyOn(configService, 'getWorkgroupId').and.returnValue(3);
    let notebook = service.getNotebookByWorkgroup();
    expect(notebook.allItems.length).toBe(2);
    expect(notebook.deletedItems).toEqual({});
    notebook = service.getNotebookByWorkgroup(4);
    expect(notebook.allItems.length).toBe(0);
  });
}

function shouldRetrievePublicNotebookItems() {
  it('should retrieve all public notebook items for a run', () => {
    spyOn(configService, 'isPreview').and.returnValue(false);
    spyOn(configService, 'getNotebookURL').and.returnValue(studentNotebookURL);
    service.retrievePublicNotebookItems('public').then(() => {
      http.expectOne(`${studentNotebookURL}/group/public`).flush({});
      expect(service.handleRetrievePublicNotebookItems).toHaveBeenCalled();
    });
  });

  it('should retrieve all public notebook items in preview mode', () => {
    spyOn(configService, 'isPreview').and.returnValue(true);
    service.retrievePublicNotebookItems('public').then((result) => {
      expect(result).toEqual({});
    });
  });
}

function shouldHandleRetrievePublicNotebookItems() {
  it('should add retrieved public notebook items for group to service', () => {
    service.handleRetrievePublicNotebookItems(demoPublicNotebookItems, 'public');
    expect(service.publicNotebookItems['public'].length).toBe(2);
    expect(service.publicNotebookItems['public'][0].localNotebookItemId).toBe('dlh2mz38vb');
  });
}

function saveNotebookItem(noteData) {
  return service.saveNotebookItem(
    null,
    noteData.nodeId,
    noteData.localNotebookItemId,
    noteData.type,
    noteData.title,
    noteData.content,
    [],
    noteData.clientSaveTime,
    null
  );
}

function shouldSaveNotebookItem() {
  describe('shouldSaveNotebookItem()', () => {
    beforeEach(() => {
      spyOn(configService, 'getWorkgroupId').and.returnValue(2);
    });

    it('should save a notebook item', () => {
      spyOn(configService, 'isPreview').and.returnValue(false);
      spyOn(configService, 'getNotebookURL').and.returnValue(studentNotebookURL);
      saveNotebookItem(editNoteData).then(() => {
        http.expectOne(studentNotebookURL).flush({});
        expect(service.handleSaveNotebookItem).toHaveBeenCalled();
      });
    });

    it('should save a notebook item in preview mode', (done) => {
      spyOn(configService, 'isPreview').and.returnValue(true);
      spyOn(studentDataService, 'updateNodeStatuses');
      let note = service.getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, 2);
      expect(note.content.text).toBe('test');
      expect(note.clientSaveTime).toBe(1500000000000);
      saveNotebookItem(editNoteData).then(() => {
        note = service.getLatestNotebookItemByLocalNotebookItemId(localNotebookItemId, 2);
        expect(note.content.text).toBe('some new text');
        expect(note.clientSaveTime).toBe(1500000100000);
        expect(studentDataService.updateNodeStatuses).toHaveBeenCalled();
        done();
      });
    });
  });
}

function shouldHandleSaveNotebookItem() {
  it('should handle saving a private notebook item', () => {
    spyOn(studentDataService, 'updateNodeStatuses');
    spyOn(service, 'updatePrivateNotebookItem');
    const savedNotebookItem = { ...editNoteData };
    savedNotebookItem.content = JSON.stringify(savedNotebookItem.content);
    service.handleSaveNotebookItem(savedNotebookItem);
    expect(studentDataService.updateNodeStatuses).toHaveBeenCalled();
    expect(service.updatePrivateNotebookItem).toHaveBeenCalled();
  });

  it('should handle saving a public notebook item', () => {
    spyOn(studentDataService, 'updateNodeStatuses');
    spyOn(service, 'updatePrivateNotebookItem');
    const savedNotebookItem = { ...editNoteData };
    savedNotebookItem.content = JSON.stringify(savedNotebookItem.content);
    savedNotebookItem.groups = ['public'];
    service.handleSaveNotebookItem(savedNotebookItem);
    expect(studentDataService.updateNodeStatuses).toHaveBeenCalled();
    expect(service.updatePrivateNotebookItem).not.toHaveBeenCalled();
  });
}

function shouldCopyNotebookItem() {
  it('should copy a notebook item', () => {
    spyOn(configService, 'isPreview').and.returnValue(false);
    spyOn(service, 'handleNewNotebookItem');
    service.copyNotebookItem(1).then(() => {
      http.expectOne(`${studentNotebookURL}/parent/1`).flush({});
      expect(service.handleNewNotebookItem).toHaveBeenCalled();
    });
  });
}

function shouldHandleNewNotebookItem() {
  it('should add new notebook item after successful copy', () => {
    spyOn(studentDataService, 'updateNodeStatuses');
    service.handleRetrievePublicNotebookItems(demoPublicNotebookItems, 'public');
    const newLocalNotebookItemId = 'tr46ba89tq';
    const copiedNote = { ...service.publicNotebookItems['public'][0] };
    copiedNote.id = 8;
    copiedNote.localNotebookItemId = newLocalNotebookItemId;
    copiedNote.workgroupId = 3;
    copiedNote.groups = [];
    copiedNote.content = JSON.stringify(copiedNote.content);
    let newNote = service.getLatestNotebookItemByLocalNotebookItemId(newLocalNotebookItemId, 3);
    expect(newNote).toBeNull();
    service.handleNewNotebookItem(copiedNote);
    newNote = service.getLatestNotebookItemByLocalNotebookItemId(newLocalNotebookItemId, 3);
    expect(newNote.localNotebookItemId).toBe(newLocalNotebookItemId);
    expect(studentDataService.updateNodeStatuses).toHaveBeenCalled();
  });
}
