import { Component } from "@angular/core";
import { ConfigService } from "../../services/configService";
import { ProjectAssetService } from "../../../site/src/app/services/projectAssetService";
import { TeacherProjectService } from "../../services/teacherProjectService";
import { WiseTinymceEditorComponent } from "./wise-tinymce-editor.component";
import { NotebookService } from "../../services/notebookService";
import 'tinymce';

declare let tinymce: any;

@Component({
  selector: 'wise-authoring-tinymce-editor',
  styleUrls: ['wise-authoring-tinymce-editor.component.scss'],
  templateUrl: 'wise-tinymce-editor.component.html'
})
export class WiseAuthoringTinymceEditorComponent extends WiseTinymceEditorComponent {

  protected toolbar: string[] = [
    'undo redo | \
    bold italic underline | \
    fontselect fontsizeselect formatselect | \
    alignleft aligncenter alignright | \
    outdent indent | \
    numlist bullist | \
    forecolor backcolor removeformat | \
    emoticons | \
    fullscreen | \
    image media link'
  ];

  constructor(
      private ConfigService: ConfigService,
      NotebookService: NotebookService,
      private ProjectAssetService: ProjectAssetService,
      private ProjectService: TeacherProjectService) {
    super(NotebookService);
  }

  ngOnInit(): void {
    this.addPluginName('wiselink');
    this.addPluginToToolbar('wiselink', false, false);
    this.initializeTinyMCE();
    this.initializeInsertWISELinkPlugin();
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

  filePicker(cb: any, value: any, meta: any) {
    const params = { isPopup: true };
    this.ProjectAssetService.openAssetChooser(params).then((result) => {
      const fileName = result.assetItem.fileName;
      const fileNameNoExt = fileName.substr(0, fileName.lastIndexOf('.')) || fileName;
      const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
      cb(fullFilePath, { alt: fileNameNoExt, text: fileNameNoExt });
    });
  }
}
