'use strict';

class AuthorNotebookController {

  constructor(
      $filter,
      $mdDialog,
      $state,
      $stateParams,
      $scope,
      ConfigService,
      ProjectService,
      SpaceService,
      UtilService) {
    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.SpaceService = SpaceService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');
    this.projectId = this.$stateParams.projectId;
    this.project = this.ProjectService.project;

    if (this.project.notebook == null) {
      // some old projects may not have the notebook settings,
      // so copy default settings from template project.
      let projectTemplate = this.ProjectService.getNewProjectTemplate();
      this.project.notebook = projectTemplate.notebook;
    }
    let notes = this.project.notebook.itemTypes.report.notes;
    if (notes != null) {
      for (const note of notes) {
        if (note != null) {
          const reportId = note.reportId;
          note.summernoteId = 'summernoteNotebook_' + reportId;
          let noteContent = this.ProjectService.replaceAssetPaths(note.content);
          noteContent = this.UtilService.replaceWISELinks(noteContent);
          note.summernoteHTML = noteContent;

          // the tooltip text for the insert WISE asset button
          const insertAssetString = this.$translate('INSERT_ASSET');

          /*
           * create the custom button for inserting WISE assets into
           * summernote
           */
          const insertAssetButton =
              this.UtilService.createInsertAssetButton(
                  this, this.projectId, null, null, reportId, insertAssetString);

          /*
           * the options that specifies the tools to display in the
           * summernote prompt
           */
          note.summernoteOptions = {
            toolbar: [
              ['style', ['style']],
              ['font', ['bold', 'underline', 'clear']],
              ['fontname', ['fontname']],
              ['fontsize', ['fontsize']],
              ['color', ['color']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['table', ['table']],
              ['insert', ['link', 'video']],
              ['view', ['fullscreen', 'codeview', 'help']],
              ['customButton', ['insertAssetButton']]
            ],
            height: 300,
            disableDragAndDrop: true,
            buttons: {
              insertAssetButton: insertAssetButton
            }
          };
        }
      }
    }

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {
      // make sure the event was fired for this component
      if (args != null && args.projectId == this.projectId &&
          args.assetItem != null && args.assetItem.fileName != null &&
          args.target != null) {
        /*
         * get the assets directory path
         * e.g.
         * /wise/curriculum/3/
         */
        let assetsDirectoryPath =
            this.ConfigService.getProjectAssetsDirectoryPath();
        let fileName = args.assetItem.fileName;
        let fullAssetPath = assetsDirectoryPath + '/' + fileName;

        // the target is the summernote prompt element
        let reportId = args.target;
        let summernoteId = 'summernoteNotebook_' + reportId;
        if (this.UtilService.isImage(fileName)) {
          /*
           * move the cursor back to its position when the asset chooser
           * popup was clicked
           */
          $('#' + summernoteId).summernote('editor.restoreRange');
          $('#' + summernoteId).summernote('editor.focus');

          // add the image html
          $('#' + summernoteId)
              .summernote('insertImage', fullAssetPath, fileName);
        } else if (this.UtilService.isVideo(fileName)) {
          /*
           * move the cursor back to its position when the asset chooser
           * popup was clicked
           */
          $('#' + summernoteId).summernote('editor.restoreRange');
          $('#' + summernoteId).summernote('editor.focus');

          // insert the video element
          let videoElement = document.createElement('video');
          videoElement.controls = 'true';
          videoElement.innerHTML =
              '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
          $('#' + summernoteId).summernote('insertNode', videoElement);
        }
      }
      this.$mdDialog.hide();
    });

    this.isPublicNotebookEnabled = this.SpaceService.isSpaceExists("public");
  }

  /**
   * Adds a new report note item to this project's notebook.
   * Currently we limit 1 report note per project.
   */
  addReportNote() {
    // some old projects may not have the notebook settings,
    // so copy default settings from template project.
    let projectTemplate = this.ProjectService.getNewProjectTemplate();
    if (this.project.notebook.itemTypes.report.notes == null) {
      this.project.notebook.itemTypes.report.notes = [];
    }
    if (this.project.notebook.itemTypes.report.notes < 1) {
      this.project.notebook.itemTypes.report.notes
          .push(projectTemplate.notebook.itemTypes.report.notes[0]);
    }
  }

  exit() {
    let notes = this.project.notebook.itemTypes.report.notes;
    if (notes != null) {
      for (let note of notes) {
        if (note != null) {
          // remove the temporary fields that were used for bookkeeping
          delete note['summernoteId'];
          delete note['summernoteHTML'];
          delete note['summernoteOptions'];
        }
      }
    }
    let commitMessage = this.$translate('madeChangesToNotebook');
    this.ProjectService.saveProject(commitMessage);
    this.$state.go('root.project', {projectId: this.projectId});
  }

  /**
   * A note was changed
   * @param note the note that was changed
   */
  summernoteHTMLChanged(note) {
    if (note != null) {
      let summernoteHTML = note.summernoteHTML;
      /*
       * remove the absolute asset paths
       * e.g.
       * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
       * will be changed to
       * <img src='sun.png'/>
       */
      summernoteHTML =
          this.ConfigService.removeAbsoluteAssetPaths(summernoteHTML);

      /*
       * replace <a> and <button> elements with <wiselink> elements when
       * applicable
       */
      summernoteHTML = this.UtilService.insertWISELinks(summernoteHTML);
      note.content = summernoteHTML;
    }
  }

  togglePublicNotebook() {
    if (this.isPublicNotebookEnabled) {
      this.SpaceService.addSpace("public", "Public");
    } else {
      this.SpaceService.removeSpace("public");
    }
  }

  disablePublicSpace() {
    this.SpaceService.removeSpace("public");
  }
}

AuthorNotebookController.$inject = [
    '$filter',
    '$mdDialog',
    '$state',
    '$stateParams',
    '$scope',
    'ConfigService',
    'ProjectService',
    'SpaceService',
    'UtilService'
];

export default AuthorNotebookController;
