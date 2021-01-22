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
import { UtilService } from '../../services/utilService';
import { WiseTinymceEditorComponent } from './wise-tinymce-editor.component';

let component: WiseTinymceEditorComponent;
let fixture: ComponentFixture<WiseTinymceEditorComponent>;

describe('WiseTinymceEditorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WiseTinymceEditorComponent],
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
        UtilService
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WiseTinymceEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  addPluginName();
  getAttachmentsHTML();
  getTextHTML();
  getAudioHTML();
  getAttachmentURLs();
});

function addPluginName() {
  it('should add plugin name', () => {
    component.addPluginName('wisenote');
    const plugins = component.config.plugins;
    expect(plugins[plugins.length - 1]).toEqual('wisenote');
  });
}

function getAttachmentsHTML() {
  it('should get the attachments html when there is one attachment', () => {
    const attachmentURLs: string[] = ['spongebob.png'];
    const text = '';
    expect(component.getAttachmentsHTML(attachmentURLs, text)).toEqual(
      '<figure class="image align-center">' +
        `<img style="width: 500px; height: auto; max-width: 100%" src="${attachmentURLs[0]}" ` +
        'alt="Image from notebook" />' +
        '<figcaption contenteditable="true"> </figcaption>' +
        '</figure>'
    );
  });
  it('should get the attachments html when there are multiple attachments', () => {
    const attachmentURLs: string[] = ['spongebob.png', 'patrick.png'];
    const text = '';
    expect(component.getAttachmentsHTML(attachmentURLs, text)).toEqual(
      '<figure class="image align-center">' +
        `<img style="width: 500px; height: auto; max-width: 100%" src="${attachmentURLs[0]}" ` +
        'alt="Image from notebook" />' +
        `<img style="width: 500px; height: auto; max-width: 100%" src="${attachmentURLs[1]}" ` +
        'alt="Image from notebook" />' +
        '<figcaption contenteditable="true"> </figcaption>' +
        '</figure>'
    );
  });
}

function getTextHTML() {
  it('should get the text html', () => {
    const text = 'Hello World';
    expect(component.getTextHTML(text)).toEqual(`<p>${text}</p>`);
  });
}

function getAudioHTML() {
  const source: string = 'spongebob.mp3';
  const sourcemime: string = 'audio/mpeg';
  let data: any = {};
  beforeEach(() => {
    data = {
      source: source,
      sourcemime: sourcemime
    };
  });
  it('should get the audio template', () => {
    expect(component.getAudioHTML(data)).toEqual(
      `<audio controls><source src="${source}" type="${sourcemime}"/></audio>`
    );
  });
  it('should get the audio template with an alt source', () => {
    const altsource = 'spongebob-alternate.mp3';
    const altsourcemime = 'audio/mpeg';
    data.altsource = altsource;
    data.altsourcemime = altsourcemime;
    expect(component.getAudioHTML(data)).toEqual(
      '<audio controls>' +
        `<source src="${source}" type="${sourcemime}"/>` +
        `<source src="${altsource}" type="${altsourcemime}"/>` +
        '</audio>'
    );
  });
}

function getAttachmentURLs() {
  it('should get the attachment urls', () => {
    const iconURL1 = 'spongebob.png';
    const iconURL2 = 'patrick.png';
    const notebookItem: any = {
      content: {
        attachments: [{ iconURL: iconURL1 }, { iconURL: iconURL2 }]
      }
    };
    const attachmentURLs = component.getAttachmentURLs(notebookItem);
    expect(attachmentURLs.length).toEqual(2);
    expect(attachmentURLs[0]).toEqual(iconURL1);
    expect(attachmentURLs[1]).toEqual(iconURL2);
  });
}
