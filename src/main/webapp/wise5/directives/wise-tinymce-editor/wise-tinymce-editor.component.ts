import { Component, EventEmitter, Input, Output } from "@angular/core";
import { debounceTime } from "rxjs/operators";
import { Subject, Subscription } from "rxjs";
import { NotebookService } from "../../services/notebookService";
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

  protected aValidAttributes: string = 'a[href|download|referrerpolicy|rel|target|type|style|' +
      'class|wiselink|node-id|component-id|link-text]';
  protected buttonValidAttributes: string = 'button[class|disabled|id|name|onblur|onclick|' +
      'ondblclick|onfocus|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|' +
      'onmouseover|onmouseup|style|tabindex|title|type|value|wiselink|node-id|component-id|' +
      'link-text]';
  protected extendedValidElements: string =
      `${this.aValidAttributes},${this.buttonValidAttributes}`;

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

  addPluginName(pluginName: string): void {
    this.plugins.push(pluginName);
  }

  addPluginToToolbar(pluginName: string,
        includeDividerBefore: boolean = false,
        includeDividerAfter: boolean = false): void {
    let newToolbarString: string = this.toolbar[0];
    if (includeDividerBefore) {
      newToolbarString += ' |';
    }
    newToolbarString += ` ${pluginName}`;
    if (includeDividerAfter) {
      newToolbarString += ' |';
    }
    this.toolbar = newToolbarString;
  }

  ngOnInit(): void {
    if (this.isAddNoteButtonAvailable) {
      this.notebookItemChosenSubscription =
          this.NotebookService.notebookItemChosen$.subscribe(({ requester, notebookItem }) => {
        if (requester === 'report') {
          this.insertWISENote(notebookItem);
        }
      });
      this.addPluginName('wisenote');
      this.addPluginToToolbar('wisenote', true, false);
    }
    this.initializeTinyMCE();
    if (this.isAddNoteButtonAvailable) {
      this.initializeInsertWISENotePlugin();
    }
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
      audio_template_callback: data => {
        return this.getAudioTemplate(data);
      },
      file_picker_callback: (cb, value, meta) => {
        this.filePicker(cb, value, meta);
      },
      mobile: {
        menubar: 'file edit insert view format table help',
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
    tinymce.PluginManager.add('wisenote', function(editor, url) {
      thisWiseTinymceEditorComponent.editor = editor;
      editor.ui.registry.addButton('wisenote', {
        tooltip: $localize`Insert from Notebook`,
        text: $localize`Insert note +`,
        onAction: function() {
          thisWiseTinymceEditorComponent.openNotebook.emit('openNotebook');
        }
      })
    });
  }

  insertWISENote(notebookItem: any): void {
    const attachmentURLs = this.getAttachmentURLs(notebookItem);
    const text = this.getText(notebookItem);
    let noteContent = this.insertAttachments(attachmentURLs, text);
    if (noteContent) {
      this.editor.insertContent(noteContent);
    }
  }

  insertAttachments(attachmentURLs: string[], text: string): string {
    let content = '';
    if (attachmentURLs.length === 0) {
      content = this.insertText(text);
    } else {
      content = `<figure class="image align-center">`;
      attachmentURLs.forEach((attachmentURL) => {
        content += `<img style="width: 500px; height: auto; max-width: 100%" src="${attachmentURL}"
          alt="${$localize`Image from notebook`}" />`;
      });
      content += this.insertText(text, true) + `</figure>`;
    }
    return content;
  }

  insertText(text: string, caption: boolean = false): string {
    let content = '';
    if (caption) {
      content = `<figcaption contenteditable="true">${text ? text : ' '}</figcaption>`;
    } else if (text) {
      content = `<p>${text}</p>`;
    }
    return content;
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

  getAudioTemplate(data: any): string {
    return `<audio controls>
      <source src="${data.source}"${data.sourcemime ? ' type="' + data.sourcemime + '"' : ''}/>
      ${(data.altsource ? '<source src="' + data.altsource + '"' + 
      (data.altsourcemime ? ' type="' + data.altsourcemime + '"' : '') + ' />' : '')}
      </audio>`;
  }

  filePicker(cb: any, value: any, meta: any) {}
}
