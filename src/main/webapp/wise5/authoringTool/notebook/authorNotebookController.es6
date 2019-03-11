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
    this.reportIdToAuthoringNote = {};

    if (this.project.notebook == null) {
      const projectTemplate = this.ProjectService.getNewProjectTemplate();
      this.project.notebook = projectTemplate.notebook;
    }

    if (this.project.teacherNotebook == null) {
      const projectTemplate = this.ProjectService.getNewProjectTemplate();
      projectTemplate.teacherNotebook.enabled = false;
      this.project.teacherNotebook = projectTemplate.teacherNotebook;
    }

    this.initializeStudentNotesAuthoring();
    this.initializeTeacherNotesAuthoring();

    this.$scope.$on('assetSelected', (event, args) => {
      if (args.projectId == this.projectId && args.assetItem != null &&
          args.assetItem.fileName != null && args.target != null) {
        const assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
        const fileName = args.assetItem.fileName;
        const fullAssetPath = assetsDirectoryPath + '/' + fileName;
        const reportId = args.target;
        const summernoteId = 'summernoteNotebook_' + reportId;
        if (this.UtilService.isImage(fileName)) {
          this.UtilService.restoreSummernoteCursorPosition(summernoteId);
          this.UtilService.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
        } else if (this.UtilService.isVideo(fileName)) {
          this.UtilService.restoreSummernoteCursorPosition(summernoteId);
          this.UtilService.insertVideoIntoSummernote(summernoteId, fullAssetPath);
        }
      }
      this.$mdDialog.hide();
    });

    this.isPublicNotebookEnabled = this.ProjectService.isSpaceExists('public');
  }

  initializeStudentNotesAuthoring() {
    this.initializeNotesAuthoring(this.project.notebook.itemTypes.report.notes);
  }

  initializeTeacherNotesAuthoring() {
    this.initializeNotesAuthoring(this.project.teacherNotebook.itemTypes.report.notes);
  }

  initializeNotesAuthoring(notes) {
    for (const note of notes) {
      this.initializeNoteAuthoring(note);
    }
  }

  initializeNoteAuthoring(note) {
    const authoringReportNote = {};
    const reportId = note.reportId;
    authoringReportNote.summernoteId = 'summernoteNotebook_' + reportId;
    let noteContent = this.ProjectService.replaceAssetPaths(note.content);
    noteContent = this.UtilService.replaceWISELinks(noteContent);
    authoringReportNote.summernoteHTML = noteContent;

    //create the custom button for inserting WISE assets into summernote
    const insertAssetButton = this.UtilService.createInsertAssetButton(
        this, this.projectId, null, null, reportId,
        this.$translate('INSERT_ASSET'));

    //the options that specifies the tools to display in the summernote prompt
    authoringReportNote.summernoteOptions = {
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

    this.setReportIdToAuthoringNote(reportId, authoringReportNote);
  }

  setReportIdToAuthoringNote(reportId, authoringReportNote) {
    this.reportIdToAuthoringNote[reportId] = authoringReportNote;
  }

  getAuthoringReportNote(id) {
    return this.reportIdToAuthoringNote[id];
  }

  getReportNote(id) {
    const studentNotes = this.project.notebook.itemTypes.report.notes;
    for (const note of studentNotes) {
      if (note.reportId === id) {
        return note;
      }
    }
    const teacherNotes = this.project.teacherNotebook.itemTypes.report.notes;
    for (const note of teacherNotes) {
      if (note.reportId === id) {
        return note;
      }
    }
    return null;
  }

  /**
   * Adds a new report note item to this project's notebook.
   * Currently we limit 1 report note per project.
   */
  addReportNote() {
    const projectTemplate = this.ProjectService.getNewProjectTemplate();
    if (this.project.notebook.itemTypes.report.notes == null) {
      this.project.notebook.itemTypes.report.notes = [];
    }
    if (this.project.notebook.itemTypes.report.notes < 1) {
      this.project.notebook.itemTypes.report.notes
          .push(projectTemplate.notebook.itemTypes.report.notes[0]);
    }
  }

  reportStarterTextChanged(reportId) {
    const note = this.getReportNote(reportId);
    const authoringNote = this.getAuthoringReportNote(reportId);
    let summernoteHTML = authoringNote.summernoteHTML;

    /*
     * remove the absolute asset paths
     * e.g.
     * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
     * will be changed to
     * <img src='sun.png'/>
     */
    summernoteHTML = this.ConfigService.removeAbsoluteAssetPaths(summernoteHTML);

    /*
     * replace <a> and <button> elements with <wiselink> elements when
     * applicable
     */
    summernoteHTML = this.UtilService.insertWISELinks(summernoteHTML);
    note.content = summernoteHTML;
    this.save();
  }

  togglePublicNotebook() {
    if (this.isPublicNotebookEnabled) {
      this.SpaceService.addSpace('public', 'Public');
    } else {
      this.SpaceService.removeSpace('public');
    }
  }

  disablePublicSpace() {
    this.SpaceService.removeSpace('public');
  }

  authoringViewComponentChanged() {
    this.save();
  }

  save() {
    this.ProjectService.saveProject();
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
