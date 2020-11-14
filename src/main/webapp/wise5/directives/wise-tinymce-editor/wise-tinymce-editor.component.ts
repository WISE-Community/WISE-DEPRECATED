import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { debounceTime } from "rxjs/operators";
import { Subject, Subscription } from "rxjs";
import { ConfigService } from "../../services/configService";
import { ProjectAssetService } from "../../../site/src/app/services/projectAssetService";
import { TeacherProjectService } from "../../services/teacherProjectService";
import 'tinymce';

declare let tinymce: any;

@Component({
  selector: 'wise-tinymce-editor',
  templateUrl: 'wise-tinymce-editor.component.html'
})
export class WiseTinymceEditorComponent implements OnInit {
  public editor: any;
  public config: any;

  @Input()
  model: any;

  @Output()
  modelChange: EventEmitter<string> = new EventEmitter<string>();

  debouncer: Subject<string> = new Subject<string>();
  debouncerSubscription: Subscription;

  constructor(
      private ConfigService: ConfigService,
      private ProjectAssetService: ProjectAssetService,
      private ProjectService: TeacherProjectService) {
    this.debouncerSubscription = this.debouncer.pipe(debounceTime(1000)).subscribe((value) => {
      this.modelChange.emit(value);
    });
  }

  ngOnInit(): void {
    this.initializeTinyMCE();
    this.initializeInsertWISEAssetPlugin();
    this.initializeInsertWISELinkPlugin();
  }

  initializeTinyMCE(): void {
    this.config = {
      base_url: '/tinymce',
      suffix: '.min',
      height: 500,
      menubar: true,
      relative_urls: false,
      media_live_embeds: true,
      extended_valid_elements: 'a[href|download|referrerpolicy|rel|target|type|style|class|' +
          'wiselink|node-id|component-id|link-text],button[class|disabled|id|name|onblur|onclick|' +
          'ondblclick|onfocus|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|' +
          'onmouseover|onmouseup|style|tabindex|title|type|value|wiselink|node-id|component-id|' +
          'link-text]',
      plugins: [
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
        'wiseasset',
        'wiselink',
        'wordcount'
      ],
      toolbar: [
        'undo redo | \
        bold italic underline strikethrough | \
        fontselect fontsizeselect formatselect | \
        alignleft aligncenter alignright alignjustify | \
        outdent indent | \
        numlist bullist | \
        forecolor backcolor removeformat | \
        charmap emoticons | \
        fullscreen preview print | \
        image media link anchor codesample | \
        wiselink wiseasset'
      ]
    };
  }

  initializeInsertWISEAssetPlugin(): void {
    const thisWiseTinymceEditorComponent = this;
    const thisProjectAssetService = this.ProjectAssetService;
    const thisConfigService = this.ConfigService;
    tinymce.PluginManager.add('wiseasset', function(editor, url) {
      editor.ui.registry.addButton('wiseasset', {
        tooltip: 'Insert WISE Asset',
        icon: 'gallery',
        onAction: function () {
          const params = { isPopup: true };
          thisProjectAssetService.openAssetChooser(params).then((result) => {
            const fileName = result.assetItem.fileName;
            const fullFilePath = `${thisConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
            let content = '';
            if (thisWiseTinymceEditorComponent.isVideo(fullFilePath)) {
              content = `<video src="${fullFilePath}" width="100%" height="100%" controls/>`;
            } else {
              content = `<img src="${fullFilePath}"/>`;
            }
            editor.insertContent(content);
          });
        }
      });
    });
  }

  initializeInsertWISELinkPlugin(): void {
    const thisProjectService = this.ProjectService;
    tinymce.PluginManager.add('wiselink', function(editor, url) {
      editor.ui.registry.addButton('wiselink', {
        tooltip: 'Insert WISE Link',
        icon: 'link',
        onAction: function () {
          const params = {
            projectId: '',
            nodeId: '',
            componentId: '',
            target: ''
          };
          thisProjectService.openWISELinkChooser(params).then((result) => {
            let content = '';
            if (result.wiseLinkType === 'link') {
              content = `<a href="#" wiselink="true" node-id="${result.wiseLinkNodeId}" ` +
                  `component-id="${result.wiseLinkComponentId}" ` +
                  `link-text="${result.wiseLinkText}">${result.wiseLinkText}</a>`;
            } else if (result.wiseLinkType === 'button') {
              content = `<button wiselink="true" node-id="${result.wiseLinkNodeId}" ` +
                  `component-id="${result.wiseLinkComponentId}" ` +
                  `link-text="${result.wiseLinkText}">${result.wiseLinkText}</button>`;
            }
            editor.insertContent(content);
          });
        }
      });
    });
  }

  isVideo(fullFilePath: string): boolean {
    const videoFileExtensions = ['mp4', 'mov', 'mkv', 'webm', 'wmv', 'avi'];
    const fileExtension = this.getFileExtension(fullFilePath);
    return videoFileExtensions.includes(fileExtension);
  }

  getFileExtension(fullFilePath): string {
    return fullFilePath.split('.').pop();
  }

  ngOnDestroy(): void {
    this.debouncerSubscription.unsubscribe();
  }

  onChange(event: any): void {
    const content = event.editor.getContent();
    this.debouncer.next(content);
  }
}