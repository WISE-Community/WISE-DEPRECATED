/**
 * The authorDispatcher catches events specific to the project authoring and
 * layout and delegates them to the appropriate functions for this view.
 * 
 * @author patrick lawler
 */
View.prototype.authorDispatcher = function(type,args,obj){
	if(type=='openProject'){
		obj.openProject();
	} else if(type=='projectSelected'){
		obj.projectOptionSelected();
	} else if(type=='loadingProjectCompleted'){
		obj.onProjectLoaded();
	} else if(type=='hideNodes'){
		obj.utils.hideNodes();
	} else if(type=='unhideNodes'){
		obj.utils.unhideNodes();
	} else if(type=='toggleProjectMode'){
		obj.toggleProjectMode();
	} else if(type=='projectTitleChanged'){
		obj.projectTitleChanged();
	} else if(type=='stepLevelChanged'){
		obj.stepLevelChanged();
	} else if(type=='stepTermChanged'){
		obj.stepTermChanged();
	} else if(type=='stepTermPluralChanged'){
		obj.stepTermChanged(true);
	} else if(type=='autoStepChanged'){
		obj.autoStepChanged();
	} else if(type=='stepNumberChanged'){
		obj.stepNumberChanged();
	} else if(type=='author'){
		obj.author(args[0]);
	} else if(type=='nodeIconUpdated'){
		obj.nodeIconUpdated(args[0]);
	} else if(type=='nodeTitleChanged'){
		obj.nodeTitleChanged(args[0]);
	} else if(type=='launchPrevWork'){
		obj.launchPrevWork(args[0]);
	} else if(type=='moveSelectedLeft'){
		obj.moveSelectedLeft();
	} else if(type=='moveSelectedRight'){
		obj.moveSelectedRight();
	} else if(type=='saveProject'){
		obj.saveProject();
	} else if(type=='createNewProject'){
		obj.createNewProject();
	} else if(type=='copyProject'){
		obj.copyProject();
	} else if(type=='createNewSequence'){
		obj.createNewSequence();
	} else if(type=='createNewNode'){
		obj.createNewNode();
	} else if(type=='nodeTypeSelected'){
		obj.nodeTypeSelected();
	} else if(type=='uploadAsset'){
		obj.uploadAsset();
	} else if(type=='viewAssets'){
		if(args){
			obj.viewAssets(args[0]);
		} else {
			obj.viewAssets();
		}
	} else if(type=='submitUpload'){
		obj.submitUpload();
	} else if(type=='editProjectFile'){
		obj.editProjectFile();
	} else if(type=='exportProject'){
		obj.exportProject();
	} else if(type=='publishProject'){
		obj.publishProject();
	} else if(type=='previewProject'){
		obj.previewProject();
	} else if(type=='startPreview'){
		obj.startPreview(args[0]);
	} else if(type=='portalMode'){
		var portalAuthorUrl = args[0];
		var command = args[1];
		var relativeProjectUrl = args[2];
		var projectId = args[3];
		var projectTitle = args[4];
		var editPremadeComments = args[5];
		obj.startPortalMode(portalAuthorUrl, command, relativeProjectUrl, projectId, projectTitle, editPremadeComments);
	} else if(type=='whoIsEditing'){
		obj.getEditors();
	} else if(type=='editProjectSubmit'){
		obj.editProjectSubmit();
	} else if(type=='editProjectCancel'){
		obj.editProjectCancel();
	} else if(type=='authorWindowScrolled'){
		obj.authorWindowScrolled();
	} else if(type=='previewFrameLoaded'){
		obj.onPreviewFrameLoad();
	} else if(type=='browserResize'){
		obj.utils.resize();
	} else if(type=='reviewUpdateProject') {
		obj.reviewUpdateProject();
	} else if(type=='updateProject') {
		obj.updateProject();
	} else if(type=='openStepTypeDescriptions') {
		obj.openStepTypeDescriptions();
	} else if(type == 'displayTagView') {
		obj.displayTagView();
	} else if(type == 'displayImportView') {
		obj.displayImportView();
	} else if(type == 'displayIconsView') {
		obj.displayIconsView();
	} else if(type == 'populateAddTagSelect') {
		obj.populateAddTagSelect(args[0]);
	} else if(type == 'populateAddTagMapSelect') {
		obj.populateAddTagMapSelect(args[0]);
	} else if(type == 'addTag') {
		obj.addTag(args[0]);
	} else if(type == 'addTagMap') {
		obj.addTagMap(args[0]);
	} else if(type == 'removeTag') {
		obj.removeTag(args[0], args[1]);
	} else if(type == 'tagNameChanged') {
		obj.tagNameChanged(args[0], args[1]);
	} else if(type == 'tagMapChanged') {
		obj.tagMapChanged(args[0], args[1]);
	} else if(type == 'removeTagMap') {
		obj.removeTagMap(args[0], args[1]);
	} else if(type == 'openProjectInImportView') {
		obj.openProjectInImportView(args[0]);
	} else if(type == 'importSelectedItems') {
		obj.importSelectedItems();
	} else if(type == 'deleteProject') {
		obj.deleteProject();
	} else if(type == 'findBrokenLinksInProject') {
		obj.analyzeProject(type);
	} else if(type == 'findUnusedAssetsInProject') {
		obj.analyzeProject(type);
	} else if(type == 'gotoDashboard') {
		obj.gotoDashboard();
	};
};

View.prototype.authoringToolPremadeCommentsDispatcher = function(type, args, obj) {
	if(type=='premadeCommentWindowLoaded') {
		obj.premadeCommentWindowLoaded();
	} else if(type=='premadeCommentLabelClicked') {
		obj.premadeCommentLabelClickedEventListener(args[0]);
	} 
};

/**
 * The selectDispatcher catches events specific to the selection and
 * delegates them to the appropriate functions for this view.
 */
View.prototype.selectDispatcher = function(type,args,obj){
	if(type=='checkAndSelect'){
		obj.checkModeAndSelect(args[0]);
	} else if(type=='checkAndDeselect'){
		obj.checkModeAndDeselect(args[0]);
	} else if(type=='selectClick'){
		obj.selectClick(args[0]);
	} else if(type=='selectBoxClick'){
		obj.selectBoxClick(args[0]);
	} else if(type=='selectAll'){
		obj.selectAll();
	} else if(type=='clearAll'){
		obj.clearAllSelected();
	} else if(type=='moveSelected'){
		obj.moveSelected();
	} else if(type=='deleteSelected'){
		obj.deleteSelected();
	} else if(type=='duplicateSelected'){
		obj.duplicateSelected();
	} else if(type=='useSelected'){
		obj.useSelected();
	} else if(type=='disengageSelectMode'){
		obj.disengageSelectMode(args[0]);
	} else if(type=='processChoice'){
		obj.processChoice(args[0], args[1]);
	};
};

/**
 * Catches events for creating and cancelling review sequences
 */
View.prototype.reviewSequenceDispatcher = function(type,args,obj){
	if(type=='startCreateReviewSequence'){
		obj.startCreateReviewSequence(args[0]);
	} else if(type=='cancelReviewSequence') {
		obj.cancelReviewSequence(args[0]);
	}
};

/**
 * The selectDispatcher catches events specific to metadata and
 * delegates them to the appropriate functions for this view.
 */
View.prototype.metaDispatcher = function(type,args,obj){
	if(type=='editProjectMetadata'){
		obj.editProjectMetadata();
	} else if(type=='maxScoreUpdated'){
		obj.maxScoreUpdated(args[0]);
	} else if(type=='postLevelChanged'){
		obj.postLevelChanged();
	} else if(type=='setLastEdited'){
		obj.setLastEdited();
	}
};

/**
 * The authorStepDispatcher catches events specific to authoring individual
 * steps and delegates them to the appropriate functions for this view.
 */
View.prototype.authorStepDispatcher = function(type,args,obj){
	if(type=='saveStep'){
		obj.saveStep();
	} else if(type=='saveAndCloseStep'){
		obj.saveStep(true);
	} else if(type=='authorStepModeChanged'){
		obj.authorStepModeChanged(args[0]);
	} else if(type=='updateRefreshOption'){
		obj.updateRefreshOption();
	} else if(type=='refreshNow'){
		obj.refreshNow();
	} else if(type=='editHints'){
		obj.editHints(args[0]);
	} else if(type=='addHint'){
		obj.addHint();
	} else if(type=='deleteHint'){
		obj.deleteHint();
	} else if(type=='saveHint'){
		obj.saveHint();
	} else if(type=='saveHints'){
		obj.saveHints();
	} else if(type=='sourceUpdated'){
		obj.sourceUpdated();
	} else if(type=='closeOnStepSaved'){
		obj.closeOnStepSaved(args[0]);
	} else if(type=='closeStep'){
		obj.closeStep();
	};
};

/**
 * The clean dispatcher catches events specific to the cleaning
 * of project files.
 */
View.prototype.cleanDispatcher = function(type,args,obj){
	if(type=='cleanProject'){
		obj.cleaner.initializeCleaning(obj);
	} else if(type=='cleanSavingProjectStart'){
		obj.cleaner.saveProject();
	} else if(type=='cleanSavingProjectComplete'){
		obj.cleaner.onSavingProjectComplete(args[0]);
	} else if(type=='cleanClosingProjectStart'){
		obj.cleaner.closeProject();
	} else if(type=='cleanClosingProjectComplete'){
		obj.cleaner.onClosingProjectComplete();
	} else if(type=='cleanLoadingProjectFileStart'){
		obj.cleaner.loadProjectFile();
	} else if(type=='cleanLoadingProjectFileComplete'){
		obj.cleaner.onLoadingProjectFileComplete(args[0]);
	} else if(type=='cleanAnalyzingProjectStart'){
		obj.cleaner.analyzeProject();
	} else if(type=='cleanAnalyzingProjectComplete'){
		obj.cleaner.displayResults();
	} else if(type=='cleanSavingProjectFileStart'){
		obj.cleaner.saveFixedProject(args[0]);
	} else if(type=='cleanSavingProjectFileComplete'){
		if(obj.cleanMode){
			obj.cleaner.sendCleaningResultsToPortal();
		} else {
			obj.cleaner.reloadProject(args[0]);
		};
	} else if(type=='cleanSave'){
		obj.cleaner.save();
	} else if(type=='cleanCancel'){
		obj.cleaner.cancel();
	} else if(type=='cleanUpdateProjectMetaFile'){
		obj.cleaner.updateProjectMetaFile();
	};
};

/**
 * The version dispatcher catches events specific to the versioning
 * of projects.
 */
View.prototype.versionDispatcher = function(type,args,obj){
	if(type=='toggleVersionOptions'){
		obj.versioning.toggleVersionOptions();
	} else if(type=='versionUnversionedProject'){
		obj.versioning.versionUnversionedProject();
	} else if(type=='versionProject'){
		obj.versioning.versionProject();
	} else if(type=='cancelVersionProject'){
		obj.versioning.cancelVersionProject();
	} else if(type=='versionSetActive'){
		obj.versioning.prepareSetActiveVersionDialog();
	} else if(type=='setActiveVersion'){
		obj.versioning.setActiveVersion();
	} else if(type=='cancelSetActiveVersion'){
		obj.versioning.cleanupSetActiveVersionDialog();
	} else if(type=='versionOpenVersion'){
		obj.versioning.prepareOpenVersion();
	} else if(type=='openVersion'){
		obj.versioning.openVersion();
	} else if(type=='cancelOpenVersion'){
		obj.versioning.cleanupOpenVersion();
	} else if(type=='versionCreateSnapshot'){
		obj.versioning.prepareCreateSnapshot();
	} else if(type=='createSnapshot'){
		obj.versioning.createSnapshot();
	} else if(type=='cancelCreateSnapshot'){
		obj.versioning.cleanupCreateSnapshot();
	} else if(type=='versionRevertProject'){
		obj.versioning.revertProject();
	} else if(type=='versionRevertNode'){
		obj.versioning.revertNode(args[0]);
	} else if(type=='getSnapshotInfo'){
		obj.versioning.openSnapshotInfo();
	} else if(type=='snapshotInfoSelectChanged'){
		obj.versioning.snapshotInfoSelectChanged();
	} else if(type=='snapshotInfoDone'){
		obj.versioning.snapshotInfoDone();
	} else if(type=='setActiveVersionById'){
		obj.versioning.setActiveVersionById(args[0]);
	};
};

View.prototype.constraintDispatcher = function(type,args,obj){
	if(type=='authorConstraints'){
		obj.Constraint.initializeConstraintAuthoring(obj);
	} else if(type=='constraintTitleClicked'){
		obj.Constraint.constraintTitleClicked(args[0]);
	} else if(type=='constraintCreateConstraint'){
		obj.Constraint.createConstraint(args[0]);
	} else if(type=='constraintSelectTypeChanged'){
		obj.Constraint.selectTypeChanged(args[0]);
	} else if(type=='constraintFinishCreateConstraint'){
		obj.Constraint.finishCreateConstraint(args[0]);
	} else if(type=='constraintProjectNodesSelectChanged'){
		obj.Constraint.projectNodesSelectChanged(args[0],args[1]);
	} else if(type=='closingConstraintDialog'){
		obj.Constraint.closingConstraintDialog();
	} else if(type=='constraintEntryClicked'){
		obj.Constraint.constraintEntryClicked(args[0],args[1]);
	} else if(type=='constraintRemoveConstraint'){
		obj.Constraint.removeConstraint(args[0],args[1]);
	} else if(type=='constraintShowAll'){
		obj.Constraint.showAll();
	} else if(type=='constraintHideAll'){
		obj.Constraint.hideAll();
	}
};

View.prototype.projectTagsDispatcher = function(type,args,obj){
	if(type=='editProjectTags'){
		obj.openProjectTags();
	} else if(type=='projectTagCreateTag'){
		obj.createProjectTag();
	} else if(type=='projectTagTagChanged'){
		obj.projectTagChanged(args[0]);
	} else if(type=='projectTagRemoveTag'){
		obj.removeProjectTag(args[0]);
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_dispatchers.js');
};