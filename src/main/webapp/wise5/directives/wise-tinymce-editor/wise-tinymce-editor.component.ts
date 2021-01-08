import { Component, EventEmitter, Input, Output } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { NotebookService } from '../../services/notebookService';
import 'tinymce';

declare let tinymce: any;

@Component({
  selector: 'wise-tinymce-editor',
  styleUrls: ['wise-tinymce-editor.component.scss'],
  templateUrl: 'wise-tinymce-editor.component.html'
})
export class WiseTinymceEditorComponent {
  public editor: any;
  public config: any;
  private previousContent: string;

  @Input()
  model: any;

  @Input()
  isAddNoteButtonAvailable: boolean;

  @Output()
  modelChange: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  openNotebook: EventEmitter<string> = new EventEmitter<string>();

  private debouncer: Subject<string> = new Subject<string>();
  private debouncerSubscription: Subscription;
  private notebookItemChosenSubscription: Subscription;

  protected aValidAttributes: string =
    'a[href|download|referrerpolicy|rel|target|type|style|' +
    'class|wiselink|node-id|component-id|link-text]';
  protected buttonValidAttributes: string =
    'button[class|disabled|id|name|onblur|onclick|' +
    'ondblclick|onfocus|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|' +
    'onmouseover|onmouseup|style|tabindex|title|type|value|wiselink|node-id|component-id|' +
    'link-text]';
  protected extendedValidElements: string = `${this.aValidAttributes},${this.buttonValidAttributes}`;

  protected plugins: string[] = [
    'advlist',
    'anchor',
    'autolink',
    'charmap',
    'charmap',
    'code',
    'codesample',
    'directionality',
    'emoticons',
    'fullscreen',
    'help',
    'hr',
    'image',
    'imagetools',
    'importcss',
    'insertdatetime',
    'link',
    'lists',
    'media',
    'nonbreaking',
    'noneditable',
    'pagebreak',
    'preview',
    'print',
    'quickbars',
    'save',
    'searchreplace',
    'table',
    'template',
    'textpattern',
    'toc',
    'visualblocks',
    'visualchars',
    'wordcount'
  ];

  protected toolbar: string = `undo redo | bold italic underline | numlist bullist`;
  protected toolbarGroups: any;

  constructor(private NotebookService: NotebookService) {
    this.debouncerSubscription = this.debouncer.pipe(debounceTime(1000)).subscribe((value) => {
      this.modelChange.emit(value);
    });
  }

  ngOnInit(): void {
    if (this.isAddNoteButtonAvailable) {
      this.notebookItemChosenSubscription = this.NotebookService.notebookItemChosen$.subscribe(
        ({ requester, notebookItem }) => {
          if (requester === 'report') {
            this.insertWISENote(notebookItem);
          }
        }
      );
      this.addPluginName('wisenote');
      this.initializeInsertWISENotePlugin();
      this.toolbar += ` | wisenote`;
    }
    this.initializeTinyMCE();
  }

  addPluginName(pluginName: string): void {
    this.plugins.push(pluginName);
  }

  initializeTinyMCE(): void {
    this.config = {
      base_url: '/tinymce',
      suffix: '.min',
      height: '100%',
      menubar: 'file edit insert view format table help',
      relative_urls: false,
      body_class: 'common-styles mat-typography app-styles default-theme',
      content_css: '/siteStyles.css',
      media_live_embeds: true,
      extended_valid_elements: this.extendedValidElements,
      font_formats: `Roboto=Roboto,Helvetica Neue,sans-serif; Arial=arial,helvetica,sans-serif; 
        Arial Black=arial black,avant garde; Comic Sans MS=comic sans ms,sans-serif; 
        Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; 
        Impact=impact,chicago; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; 
        Times New Roman=times new roman,times; Verdana=verdana,geneva`,
      plugins: this.plugins,
      quickbars_insert_toolbar: false,
      default_link_target: '_blank',
      image_advtab: true,
      image_caption: true,
      imagetools_toolbar: 'imageoptions',
      link_context_toolbar: true,
      toolbar: this.toolbar,
      toolbar_groups: this.toolbarGroups,
      audio_template_callback: (data: any) => {
        return this.getAudioHTML(data);
      },
      file_picker_callback: (callback: any, value: any, meta: any) => {
        this.filePicker(callback, value, meta);
      },
      mobile: {
        toolbar_mode: 'floating'
      },
      menu: {
        file: {
          title: $localize`File`,
          items: 'preview wordcount | print'
        }
      }
    };
  }

  initializeInsertWISENotePlugin(): void {
    const thisWiseTinymceEditorComponent = this;
    tinymce.PluginManager.add('wisenote', function (editor: any, url: string) {
      thisWiseTinymceEditorComponent.editor = editor;
      editor.ui.registry.addButton('wisenote', {
        tooltip: $localize`Insert from Notebook`,
        text: $localize`Insert note +`,
        onAction: function () {
          thisWiseTinymceEditorComponent.openNotebook.emit('openNotebook');
        }
      });
    });
  }

  insertWISENote(notebookItem: any): void {
    const attachmentURLs = this.getAttachmentURLs(notebookItem);
    const text = this.getText(notebookItem);
    let noteContent = this.getAttachmentsHTML(attachmentURLs, text);
    if (noteContent) {
      this.editor.insertContent(noteContent);
    }
  }

  getAttachmentsHTML(attachmentURLs: string[], text: string): string {
    let content = '';
    if (attachmentURLs.length === 0) {
      content = this.getTextHTML(text);
    } else {
      content = `<figure class="image align-center">`;
      attachmentURLs.forEach((attachmentURL) => {
        content +=
          '<img style="width: 500px; height: auto; max-width: 100%" ' +
          `src="${attachmentURL}" alt="${$localize`Image from notebook`}" />`;
      });
      content += this.getTextHTML(text, true) + `</figure>`;
    }
    return content;
  }

  getTextHTML(text: string, caption: boolean = false): string {
    if (caption) {
      return `<figcaption contenteditable="true">${text ? text : ' '}</figcaption>`;
    } else if (text) {
      return `<p>${text}</p>`;
    }
  }

  getAttachmentURLs(notebookItem: any): string[] {
    const attachmentURLs = [];
    notebookItem.content.attachments.forEach((attachment: any) => {
      attachmentURLs.push(attachment.iconURL);
    });
    return attachmentURLs;
  }

  getText(notebookItem: any): string {
    return notebookItem.content.text;
  }

  ngOnDestroy(): void {
    this.debouncerSubscription.unsubscribe();
    if (this.notebookItemChosenSubscription != null) {
      this.notebookItemChosenSubscription.unsubscribe();
    }
  }

  onChange(event: any): void {
    const newContent = event.editor.getContent();
    if (this.isContentChanged(this.previousContent, newContent)) {
      this.debouncer.next(newContent);
      this.previousContent = newContent;
    }
  }

  isContentChanged(previousContent: string, newContent: string): boolean {
    return previousContent !== newContent;
  }

  getAudioHTML(data: any): string {
    let content = '';
    content += '<audio controls>';
    content += this.getAudioSourceHTML(data.source, data.sourcemime);
    if (data.altsource != null) {
      content += this.getAudioSourceHTML(data.altsource, data.altsourcemime);
    }
    content += '</audio>';
    return content;
  }

  getAudioSourceHTML(src: string, mime: string): string {
    let content = '';
    content += `<source src="${src}"`;
    if (mime != null) {
      content += ` type="${mime}"`;
    }
    content += '/>';
    return content;
  }

  filePicker(cb: any, value: any, meta: any) {}
}
