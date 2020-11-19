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

  protected toolbar: string[] = [
    'undo redo | \
    bold italic underline | \
    numlist bullist'
  ];

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
    this.toolbar = [newToolbarString];
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
      menubar: true,
      relative_urls: false,
      media_live_embeds: true,
      extended_valid_elements: this.extendedValidElements,
      plugins: this.plugins,
      toolbar: this.toolbar,
      menu: {
        file: {
          title: 'File',
          items: 'preview | print'
        }
      }
    };
  }

  initializeInsertWISENotePlugin(): void {
    const thisWiseTinymceEditorComponent = this;
    tinymce.PluginManager.add('wisenote', function(editor, url) {
      thisWiseTinymceEditorComponent.editor = editor;
      editor.ui.registry.addButton('wisenote', {
        tooltip: 'Insert from Notebook',
        text: 'Insert note +',
        onAction: function() {
          thisWiseTinymceEditorComponent.openNotebook.emit('openNotebook');
        }
      })
    });
  }

  insertWISENote(notebookItem: any): void {
    this.insertLineBreak();
    const attachmentURLs = this.getAttachmentURLs(notebookItem);
    const text = this.getText(notebookItem);
    this.insertAttachments(attachmentURLs);
    if (attachmentURLs.length === 0) {
      this.insertText(text);
    } else {
      this.insertText(text, true, true);
    }
    this.insertLineBreak();
  }

  insertLineBreak(): void {
    this.editor.insertContent('<br/><p></p>');
  }

  insertAttachments(attachmentURLs: string[]): void {
    const style = 'style="width: 75%; max-width: 100%; height: auto; border: 1px solid #aaaaaa; ' +
        'padding: 8px; margin-bottom: 4px; text-align: center; display: block; ' +
        'margin-left: auto; margin-right: auto;"';
    attachmentURLs.forEach((attachmentURL) => {
      this.editor.insertContent(
        `<br/><img src="${attachmentURL}" alt="notebook image" ${style} />`
      );
    });
  }

  insertText(text: string, isCenter: boolean = false, isBold: boolean = false): void {
    if (text != '') {
      let style = '';
      if (isCenter) {
        style = "style='text-align: center'";
      }
      let pContent = text;
      if (isBold) {
        pContent = `<b>${text}</b>`;
      }
      this.editor.insertContent(`<p ${style}>${pContent}</p>`);
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
}
