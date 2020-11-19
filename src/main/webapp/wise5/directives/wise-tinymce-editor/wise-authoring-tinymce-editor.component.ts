import { Component, OnInit } from "@angular/core";
import { ConfigService } from "../../services/configService";
import { ProjectAssetService } from "../../../site/src/app/services/projectAssetService";
import { TeacherProjectService } from "../../services/teacherProjectService";
import { WiseTinymceEditorComponent } from "./wise-tinymce-editor.component";
import { NotebookService } from "../../services/notebookService";
import 'tinymce';

declare let tinymce: any;

@Component({
  selector: 'wise-authoring-tinymce-editor',
  templateUrl: 'wise-tinymce-editor.component.html'
})
export class WiseAuthoringTinymceEditorComponent extends WiseTinymceEditorComponent
    implements OnInit {

  protected toolbar: string[] = [
    'undo redo | \
    bold italic underline strikethrough | \
    fontselect fontsizeselect formatselect | \
    alignleft aligncenter alignright alignjustify | \
    outdent indent | \
    numlist bullist | \
    forecolor backcolor removeformat | \
    charmap emoticons | \
    fullscreen preview print | \
    image media link anchor codesample'
  ];
  
  constructor(
      private ConfigService: ConfigService,
      NotebookService: NotebookService,
      private ProjectAssetService: ProjectAssetService,
      private ProjectService: TeacherProjectService) {
    super(NotebookService);
  }

  ngOnInit(): void {
    this.addPluginName('wiseasset');
    this.addPluginToToolbar('wiseasset', true, false);
    this.addPluginName('wiselink');
    this.addPluginToToolbar('wiselink', false, false);
    this.initializeTinyMCE();
    this.initializeInsertWISEAssetPlugin();
    this.initializeInsertWISELinkPlugin();
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
              content = `<video src="${fullFilePath}" width="100%" height="100%" controls />`;
            } else {
              content = `<img src="${fullFilePath}" />`;
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

  getFileExtension(fullFilePath: string): string {
    return fullFilePath.split('.').pop();
  }

}