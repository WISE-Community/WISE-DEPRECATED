'use strict';

import ConfigService from '../../services/configService';
import AuthoringToolProjectService from '../authoringToolProjectService';
import SpaceService from '../../services/spaceService';
import UtilService from '../../services/utilService';

class AuthorNotebookController {
  $translate: any;
  isPublicNotebookEnabled: boolean;
  projectId: number;
  project: any;
  reportIdToAuthoringNote: any;

  static $inject = [
    '$filter',
    '$mdDialog',
    '$stateParams',
    '$scope',
    'ConfigService',
    'ProjectService',
    'SpaceService',
    'UtilService'
  ];

  constructor(
    $filter,
    private $mdDialog,
    $stateParams,
    private $scope,
    private ConfigService: ConfigService,
    private ProjectService: AuthoringToolProjectService,
    private SpaceService: SpaceService,
    private UtilService: UtilService
  ) {
    this.$translate = $filter('translate');
    this.projectId = $stateParams.projectId;
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
      if (
        args.projectId == this.projectId &&
        args.assetItem != null &&
        args.assetItem.fileName != null &&
        args.target != null
      ) {
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
    const authoringReportNote = {
      summernoteId: `summernoteNotebook_${note.reportId}`,
      summernoteHTML: this.UtilService.replaceWISELinks(
        this.ProjectService.replaceAssetPaths(note.content)
      ),
      summernoteOptions: {
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
          insertAssetButton: this.UtilService.createInsertAssetButton(
            this,
            this.projectId,
            null,
            null,
            note.reportId,
            this.$translate('INSERT_ASSET')
          )
        },
        dialogsInBody: true
      }
    };
    this.setReportIdToAuthoringNote(note.reportId, authoringReportNote);
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

  addReportNote() {
    const projectTemplate = this.ProjectService.getNewProjectTemplate();
    if (this.project.notebook.itemTypes.report.notes == null) {
      this.project.notebook.itemTypes.report.notes = [];
    }
    if (this.project.notebook.itemTypes.report.notes < 1) {
      this.project.notebook.itemTypes.report.notes.push(
        projectTemplate.notebook.itemTypes.report.notes[0]
      );
    }
  }

  reportStarterTextChanged(reportId) {
    const note = this.getReportNote(reportId);
    const authoringNote = this.getAuthoringReportNote(reportId);
    let summernoteHTML = authoringNote.summernoteHTML;
    summernoteHTML = this.ConfigService.removeAbsoluteAssetPaths(summernoteHTML);
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

export default AuthorNotebookController;
