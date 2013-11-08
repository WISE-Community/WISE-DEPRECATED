/**
 * The componentloader object manages the loading of the components.
 * This includes loading variables, scripts, events, styling and 
 * methods into the view as well as initializing necessary variables.
 * 
 * @author patrick lawler
 */
var componentloader = function(em, sl){
	var eventManager = em;
	var scriptloader = sl;
	var componentQueue = [];
	
	//place components in the order you want them to load
	var views = {
		student: ['topMenu','setup', 'core', 'keystroke', 'config', 'studentXMPP', 'user', 'session','studentwork','student','hint','navigation','annotations','uicontrol', 'wise', 'maxscores', 'peerreviewhelper', 'ideabasket', 'studentasset', 'studentWebSocket'],
		grading: ['setup', 'core', 'config', 'teacherXMPP', 'studentwork', 'user', 'session', 'grading', 'annotations', 'maxscores', 'ideabasket'],
		grading_min: ['setup', 'core_min', 'config', 'teacherXMPP_min', 'studentwork_min', 'user', 'session', 'grading_min', 'annotations_min', 'maxscores_min', 'ideabasket'],
		authoring: ['ddMenu', 'setup', 'core','keystroke','customcontextmenu', 'config', 'session','messagemanager','author','authoringcomponents', 'maxscores'],
		summary: ['core'],
		classroomMonitor: ['setup', 'core', 'config', 'studentwork', 'user', 'session', 'maxscores', 'teacherWebSocket']
	};
	
	//components are comprised of variables, events, methods, and initialization.
	//Use an empty object {} if none of a particular kind are needed.
	var components = {
		core: {
			variables: {
				project:undefined, 
				projectMetadata:undefined, 
				HTML_CONTENT_TEMPLATES:{}, 
				isLoadedProjectMinified:false, 
				minifierUrl:'../util/minifier.html',
				//iconUrl:'images/stepIcons/UCCP/',
				nodeClasses:{},
				nodeIconPaths:{},
				activeThemes: [],
				themeNavModes: {}
			},
			events: {
				'loadingProjectStarted': [null, null], 
				'loadingProjectCompleted':[null, null],
				'pageRenderCompleted':[null,null],
				'contentRenderCompleted':[null,null], 
				'contentTimedOut':[null,null], 
				'fatalError':[null,null],
				'retrieveProjectMetaDataCompleted':[null,null], 
				'retrieveRunExtrasCompleted':[null,null], 
				'nullEvent':[null,null],
				'retrieveAnnotationsCompleted':[null,null]
			},
			methods: {
				getProject:function(view){return function(){return view.getProject();};},
				loadProject:function(view){return function(url, contentBase, lazyLoading){view.loadProject(url,contentBase,lazyLoading);};}
			},
			initialize:{
				notificationManager:function(){return window.notificationManager;},
				connectionManager:function(){return new ConnectionManager(eventManager);},
				init:function(view){
					view.eventManager.subscribe('contentTimedOut', function(type,args,obj){obj.notificationManager.notify('Retrieval of content from url ' + args[0] + ' is taking a long time! The server may be slow or is not responding. If content does not load shortly, check with an administrator.', 3);}, view);
					
					/* set up the notePanel dialog in the view */
					document.body.appendChild(createElement(document, 'div', {id:'notePanel'}));
					document.body.appendChild(createElement(document, 'div', {id:'feedbackDialog'}));
					
					//define the width of the note dialog
					var noteWidth = 650;
					
					var maxHeight = $(window).height() - 100;
					
					$('#notePanel').dialog({
						autoOpen:false,
						width:noteWidth,
						title:'Reflection Note',
						resizable:true,
						show:{effect:"fade",duration:200},
						hide:{effect:"fade",duration:200},
						position: ['center','middle'],
						closeOnEscape: false,
						zIndex: '99999',
						open: function(){
							$(this).css({'max-height':maxHeight, 'overflow-y':'auto'});
							
							// add transparent overlay to step content to disable editing of previous step when note is opened
							var contentOverlay = $(document.createElement('div')).attr('id','contentOverlay').css({'position':'fixed', 'left':0, 'width':'100%', 'top':0, 'height':'100%', 'z-index':99999 });
							$('body',$('#ifrm')[0].contentWindow.document).append(contentOverlay);

							// bind click event to X link in dialog that saves and closes note
							$(this).parent().children().children("a.ui-dialog-titlebar-close").click(function(){
								//save the note
								if(view.activeNote){
									view.activeNote.save();
								}
								
								//close the note dialog
								view.utils.closeDialog('notePanel');
							});
						}
					});
					
					$('#feedbackDialog').dialog({autoOpen:false, dialogClass: 'dialogFeed', zIndex: '100009', buttons: [{text: "OK", click: function() {$(this).dialog('close');}}]});
				}
			}
		},
		setup: {
			variables: {},
			events: {},
			methods: {},
			initialize: {}
		},
		studentXMPP: {
			variables: {},
			events: {},
			methods: {},
			initialize: {}
		},
		teacherXMPP: {
			variables: {},
			events: {},
			methods: {},
			initialize: {}
		},
		config: {
			variables: {config:undefined},
			events: {				
				'loadConfigCompleted':[null,null]
			},
			methods: {},
			initialize: {}
		},
		user: {
			variables: {userAndClassInfo:undefined},
			events: {'getUserAndClassInfoStarted':[null,null],
					 'getUserAndClassInfoCompleted': [null, null],
					 'processUserAndClassInfoCompleted':[null,null]},
			methods: {},
			initialize: {}
		},
		session: {
			variables: {},
			events: {				
			},
			methods: {},
			initialize: {
				init:function(view){
					view.eventManager.subscribe('loadConfigCompleted', view.utilDispatcher, view);
				}
			}
		},
		grading: {
			variables: {gradingConfigUrl:undefined,
						teacherId:undefined,
						studentWorkgroupIds:undefined,
						vleStates:undefined,
						annotations:undefined,
						flags:undefined,
						stepNumber:undefined,
						getContentUrl:undefined,
						getUserInfoUrl:undefined,
						getDataUrl:undefined,
						getAnnotationsUrl:undefined,
						postAnnotationsUrl:undefined,
						getContentBaseUrl:undefined,
						getFlagsUrl:undefined,
						postFlagsUrl:undefined,
						
						runId:undefined
						},
			events: {'gradingConfigUrlReceived': [null, null],
					 'getGradingConfigCompleted': [null, null],
					 'retrieveStudentWorkCompleted':[null, null],
					 'getFlagsCompleted':[null, null],
					 'customActivityCheckBoxClicked':[null, null],
					 'customSelectAllStepsCheckBoxClicked':[null, null],
					 'scoreUpdated':[null, null],
					 'commentUpdated':[null, null],
					 'flagCheckboxClicked':[null, null],
					 'inappropriateFlagCheckboxClicked':[null, null],
					 'specialExportButtonClicked':[null, null],
					 'exportExplanationButtonClicked':[null, null],
					 'maxScoreChanged':[null, null],
					 'gradeByStepViewSelected':[null, null],
					 'gradeByTeamViewSelected':[null, null],
					 'displayStudentUploadedFilesSelected':[null, null],
					 'checkForNewWorkButtonClicked':[null, null],
					 'initiateGradingDisplayStarted':[null, null],					 
					 'projectDataReceived':[null,null],
					 'initiateClassroomMonitorDisplayStarted':[null,null],					 
					 'classroomMonitorDisplayCompleted':[null,null],
					 'chatRoomTextEntrySubmitted':[null,null],
					 'realTimeMonitorSelectWorkgroupIdDropDownClicked':[null,null],
					 'realTimeMonitorSelectStepDropDownClicked':[null,null],
					 'realTimeMonitorShareWithClassClicked':[null,null],
					 'hidePersonalInfoOptionClicked':[null, null],
					 'filterStudentRowsRequested':[null, null],
					 'enlargeStudentWorkTextOptionClicked':[null, null],
					 'premadeCommentWindowLoaded':[null, null],
					 'premadeCommentLabelClicked':[null, null],
					 'retrieveIdeaBasketsCompleted':[null, null],
					 'groupClicked':[null, null],
					 'exportButtonClicked':[null, null]},
   		    methods:{
			  onWindowUnload:function(view){return function(){view.onWindowUnload();};}
		    },					 
			initialize: {
				initializeEvents:function(view) {
					eventManager.subscribe("gradingConfigUrlReceived", view.gradingDispatcher, view);
					eventManager.subscribe("getGradingConfigCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("loadingProjectCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("getUserAndClassInfoCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("processUserAndClassInfoCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("customActivityCheckBoxClicked", view.gradingDispatcher, view);
					eventManager.subscribe("customSelectAllStepsCheckBoxClicked", view.gradingDispatcher, view);
					eventManager.subscribe("scoreUpdated", view.gradingDispatcher, view);
					eventManager.subscribe("commentUpdated", view.gradingDispatcher, view);
					eventManager.subscribe("flagCheckboxClicked", view.gradingDispatcher, view);
					eventManager.subscribe("inappropriateFlagCheckboxClicked", view.gradingDispatcher, view);
					eventManager.subscribe("specialExportButtonClicked", view.gradingDispatcher, view);
					eventManager.subscribe("exportExplanationButtonClicked", view.gradingDispatcher, view);
					eventManager.subscribe("retrieveProjectMetaDataCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("retrieveRunExtrasCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("maxScoreChanged", view.gradingDispatcher, view);
					eventManager.subscribe("gradeByStepViewSelected", view.gradingDispatcher, view);
					eventManager.subscribe("gradeByTeamViewSelected", view.gradingDispatcher, view);
					eventManager.subscribe("displayStudentUploadedFilesSelected", view.gradingDispatcher, view);
					eventManager.subscribe("checkForNewWorkButtonClicked", view.gradingDispatcher, view);
					eventManager.subscribe("retrieveAnnotationsCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("initiateGradingDisplayStarted", view.gradingDispatcher, view);
					eventManager.subscribe("projectDataReceived", view.gradingDispatcher, view);
					eventManager.subscribe("retrieveStudentWorkCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("hidePersonalInfoOptionClicked", view.gradingDispatcher, view);
					eventManager.subscribe("filterStudentRowsRequested", view.gradingDispatcher, view);
					eventManager.subscribe("enlargeStudentWorkTextOptionClicked", view.gradingDispatcher, view);
					eventManager.subscribe("premadeCommentWindowLoaded", view.gradingDispatcher, view);
					eventManager.subscribe("premadeCommentLabelClicked", view.gradingDispatcher, view);
					eventManager.subscribe("retrieveIdeaBasketsCompleted", view.gradingDispatcher, view);
					eventManager.subscribe("groupClicked", view.gradingDispatcher, view);
					eventManager.subscribe("chatRoomTextEntrySubmitted", view.gradingDispatcher, view);
					eventManager.subscribe("realTimeMonitorSelectWorkgroupIdDropDownClicked", view.gradingDispatcher, view);
					eventManager.subscribe("realTimeMonitorSelectStepDropDownClicked", view.gradingDispatcher, view);
					eventManager.subscribe("realTimeMonitorShareWithClassClicked", view.gradingDispatcher, view);
					eventManager.subscribe("exportButtonClicked", view.gradingDispatcher, view);
					eventManager.initializeLoading([['gradingConfigUrlReceived','projectDataReceived','Project Data'], 
					                                ['initiateGradingDisplayStarted','retrieveStudentWorkCompleted','Student Data'],
					                                ['initiateClassroomMonitorDisplayStarted','classroomMonitorDisplayCompleted','Classroom Monitor']], false);
				}
			}
		},
		author: {
			variables: {
				selectCallback:undefined, 
				selectArgs:undefined, 
				selectModeEngaged:undefined, 
				hasTODO:false,
				disambiguateMode:false, 
				selectOrigSeqs:undefined, 
				selectOrigNodes:undefined, 
				simpleProject:true,
				projectStructureViolation:false, 
				pathSeparator:undefined, 
				selectedType:undefined,
				projectPaths:'', 
				primaryPath:'', 
				portalUrl:undefined, 
				portalProjectPaths:[], 
				portalProjectIds:[], 
				portalProjectTitles:[],
				portalProjectId:undefined, 
				portalCurriculumBaseDir:undefined, 
				excludedPrevWorkNodes:['HtmlNode', 'OutsideUrlNode', 'MySystemNode', 'SVGDrawNode', 'MWNode', 'DrawNode','DuplicateNode'], 
				allowedAssetExtensions:['txt', 'jpg', 'jpeg', 'gif', 'png', 'swf', 'flv', 'bmp', 'tif', 'pdf', 'nlogo', 'nls', 'jar', 'cml', 'mml', 'otml', 'mov', 'mp4', 'mp3', 'wav', 'aac', 'avi', 'wmv', 'mpg', 'mpeg', 'ogg', 'css'],
				MAX_ASSET_SIZE:10485760, 
				currentStepNum:undefined, 
				activeNode:undefined, 
				tab:'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
				defaultSelectModeMessage:'Select a new location for selected item(s).',
				defaultNodeSelectMessage:'Select a new location for the selected step(s). ' +
					'If you select an activity, the selected step(s) will be placed at the beginning of the activity.',
				defaultSequenceSelectMessage:'Select a new location for the selected activity(s).',
				hasProjectMeta:false, 
				projectMeta:{title:'', subject:'', summary:'', author:'', gradeRange:'', totalTime:'', compTime:'', contact:'', techReqs:'', tools:'', lessonPlan:'', standards:'', keywords:''},
				timeoutVars:{}, 
				placeNode:false, 
				placeNodeId:undefined, 
				updateAudioInVLE:false,
				authoringBaseUrl:'filemanager.html?command=retrieveFile&fileName=',
				easyMode:true, 
				updateNow:true, 
				stepSaved:true, 
				activeContent:undefined, 
				preservedContent:undefined, 
				createMode:false,
				cleanMode:false, 
				versionMasterUrl:undefined, 
				portalUsername:undefined,
				EDITING_POLL_TIME:30000, 
				editingPollInterval:undefined, 
				currentEditors:undefined, 
				requestUrl:'filemanager.html', 
				assetRequestUrl:'assetmanager.html',
				tagNameMap:{},
				tagIdForRequest:undefined,
				nodeTemplateParams:{}
			},
			events: {
				'openProject':[null,null], 
				'projectSelected':[null,null],
				'checkAndSelect':[null, null], 
				'checkAndDeselect':[null,null], 
				'selectClick':[null,null],
				'selectBoxClick':[null,null],
				'selectAll':[null,null], 
				'clearAll':[null,null], 
				'hideNodes':[null,null], 
				'unhideNodes':[null,null], 
				'toggleProjectMode':[null,null], 
				'projectTitleChanged':[null,null],
				'stepLevelChanged':[null,null], 
				'autoStepChanged':[null,null], 
				'stepNumberChanged':[null,null],
				'stepTermChanged':[null,null],
				'stepTermPluralChanged':[null,null],
				'author':[null,null],
				'nodeIconUpdated':[null,null], 
				'nodeTitleChanged':[null,null], 
				'launchPrevWork':[null,null], 
				'moveSelectedLeft':[null,null],
				'moveSelectedRight':[null,null], 
				'saveProject':[null,null],
				'createNewProject':[null,null], 
				'copyProject':[null,null], 
				'createNewSequence':[null,null], 
				'createNewNode':[null,null],
				'nodeTypeSelected':[null,null], 
				'uploadAsset':[null,null], 
				'viewAssets':[null,null], 
				'submitUpload':[null,null],
				'exportProject':[null,null],
				'moveSelected':[null,null],
				'deleteSelected':[null,null], 
				'duplicateSelected':[null,null], 
				'useSelected':[null,null], 
				'disengageSelectMode':[null,null],
				'processChoice':[null,null], 
				'editProjectFile':[null,null], 
				'editProjectMetadata':[null,null], 
				'saveStep':[null,null], 
				'saveAndCloseStep':[null,null], 
				'authorStepModeChanged':[null,null], 
				'updateRefreshOption':[null,null], 
				'refreshNow':[null,null],
				'editHints':[null,null],
				'addHint':[null,null],
				'deleteHint':[null,null],
				'saveHint':[null,null],
				'saveHints':[null,null],
				'sourceUpdated':[null,null], 
				'closeOnStepSaved':[null,null], 
				'closeStep':[null,null], 
				'previewProject':[null,null], 
				'startPreview':[null,null], 
				'portalMode':[null,null], 
				'maxScoreUpdated':[null,null],
				'postLevelChanged':[null,null], 
				'setLastEdited':[null,null], 
				'whoIsEditing':[null,null],
				'startCreateReviewSequence':[null,null], 
				'cancelReviewSequence':[null,null], 
				'authorWindowScrolled':[null,null],
				'previewFrameLoaded':[null,null],
				'cleanProject':[null,null],
				'deleteProject':[null,null],
				'findBrokenLinksInProject':[null,null],
				'findUnusedAssetsInProject':[null,null],
				'cleanClosingProjectStart':[null,null],
				'cleanClosingProjectComplete':[null,null], 
				'cleanLoadingProjectFileStart':[null,null], 
				'cleanLoadingProjectFileComplete':[null,null],
				'cleanAnalyzingProjectStart':[null,null], 
				'cleanAnalyzingProjectComplete':[null,null], 
				'cleanSavingProjectFileStart':[null,null],
				'cleanSavingProjectFileComplete':[null,null], 
				'cleanSavingProjectStart':[null,null], 
				'cleanSavingProjectComplete':[null,null],
				'cleanSave':[null,null], 
				'cleanCancel':[null,null], 
				'cleanDisplayingResultsStart':[null,null], 
				'cleanDisplayingResultsComplete':[null,null],
				'cleanUpdateProjectMetaFile':[null,null], 
				'notifyCleaningComplete':[null,null],
				'authorConstraints':[null,null],
				'constraintTitleClicked':[null,null],
				'constraintCreateConstraint':[null,null],
				'constraintSelectTypeChanged':[null,null],
				'constraintFinishCreateConstraint':[null,null],
				'constraintProjectNodesSelectChanged':[null,null],
				'closingConstraintDialog':[null,null],
				'constraintEntryClicked':[null,null],
				'constraintRemoveConstraint':[null,null],
				'constraintShowAll':[null,null],
				'constraintHideAll':[null,null],
				'editProjectTags':[null,null],
				'projectTagTagChanged':[null,null],
				'projectTagRemoveTag':[null,null],
				'projectTagCreateTag':[null,null],
				'browserResize':[null,null],
				'reviewUpdateProject':[null,null],
				'updateProject':[null,null],
				'openStepTypeDescriptions':[null,null],
				'displayTagView':[null,null],
				'displayImportView':[null,null],
				'displayIconsView':[null,null],
				'populateAddTagSelect':[null,null],
				'populateAddTagMapSelect':[null,null],
				'addTag':[null,null],
				'addTagMap':[null,null],
				'removeTag':[null,null],
				'tagNameChanged':[null,null],
				'tagMapChanged':[null,null],
				'removeTagMap':[null,null],
				'openProjectInImportView':[null,null],
				'importSelectedItems':[null,null],
				'premadeCommentWindowLoaded':[null, null],
				'premadeCommentLabelClicked':[null, null],
				'gotoDashboard':[null, null]
			},
			methods: {
				onWindowUnload:function(view){return function(){view.onWindowUnload();};}
			},
			initialize:{
				keystrokeManager:function(){
					var keystrokes = [['openProject', 79, ['shift','alt']],['previewProject', 80, ['shift','alt']],['saveProject',83,['shift','alt']]];
					return createKeystrokeManager(eventManager,keystrokes);
				},
				//customContextMenu:function(){return createCustomContextMenu(eventManager);}, //disabling TODO menu for now
				init:function(view){
					view.eventManager.subscribe('openProject', view.authorDispatcher, view);
					view.eventManager.subscribe('projectSelected', view.authorDispatcher, view);
					view.eventManager.subscribe('loadingProjectCompleted', view.authorDispatcher, view);
					view.eventManager.subscribe('hideNodes', view.authorDispatcher, view);
					view.eventManager.subscribe('unhideNodes', view.authorDispatcher, view);
					view.eventManager.subscribe('toggleProjectMode', view.authorDispatcher, view);
					view.eventManager.subscribe('projectTitleChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('stepLevelChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('autoStepChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('stepTermChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('stepTermPluralChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('stepNumberChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('author', view.authorDispatcher, view);
					view.eventManager.subscribe('nodeIconUpdated', view.authorDispatcher, view);
					view.eventManager.subscribe('nodeTitleChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('launchPrevWork', view.authorDispatcher, view);
					view.eventManager.subscribe('moveSelectedLeft', view.authorDispatcher, view);
					view.eventManager.subscribe('moveSelectedRight', view.authorDispatcher, view);
					view.eventManager.subscribe('saveProject', view.authorDispatcher, view);
					view.eventManager.subscribe('createNewProject', view.authorDispatcher, view);
					view.eventManager.subscribe('copyProject', view.authorDispatcher, view);
					view.eventManager.subscribe('createNewSequence', view.authorDispatcher, view);
					view.eventManager.subscribe('createNewNode', view.authorDispatcher, view);
					view.eventManager.subscribe('nodeTypeSelected', view.authorDispatcher, view);
					view.eventManager.subscribe('uploadAsset', view.authorDispatcher, view);
					view.eventManager.subscribe('viewAssets', view.authorDispatcher, view);
					view.eventManager.subscribe('submitUpload', view.authorDispatcher, view);
					view.eventManager.subscribe('exportProject', view.authorDispatcher, view);
					view.eventManager.subscribe('editProjectFile', view.authorDispatcher, view);
					view.eventManager.subscribe('previewProject', view.authorDispatcher, view);
					view.eventManager.subscribe('startPreview', view.authorDispatcher, view);
					view.eventManager.subscribe('portalMode', view.authorDispatcher, view);
					view.eventManager.subscribe('whoIsEditing', view.authorDispatcher, view);
					view.eventManager.subscribe('authorWindowScrolled', view.authorDispatcher, view);
					view.eventManager.subscribe('previewFrameLoaded', view.authorDispatcher, view);
					view.eventManager.subscribe('reviewUpdateProject', view.authorDispatcher, view);
					view.eventManager.subscribe('updateProject', view.authorDispatcher, view);
					view.eventManager.subscribe('openStepTypeDescriptions', view.authorDispatcher, view);
					view.eventManager.subscribe('checkAndSelect', view.selectDispatcher, view);
					view.eventManager.subscribe('checkAndDeselect', view.selectDispatcher, view);
					view.eventManager.subscribe('selectClick', view.selectDispatcher, view);
					view.eventManager.subscribe('selectBoxClick', view.selectDispatcher, view);
					view.eventManager.subscribe('clearAll', view.selectDispatcher, view);
					view.eventManager.subscribe('selectAll', view.selectDispatcher, view);
					view.eventManager.subscribe('moveSelected', view.selectDispatcher, view);
					view.eventManager.subscribe('startCreateReviewSequence', view.reviewSequenceDispatcher, view);
					view.eventManager.subscribe('cancelReviewSequence', view.reviewSequenceDispatcher, view);
					view.eventManager.subscribe('deleteSelected', view.selectDispatcher, view);
					view.eventManager.subscribe('duplicateSelected', view.selectDispatcher, view);
					view.eventManager.subscribe('useSelected', view.selectDispatcher, view);
					view.eventManager.subscribe('disengageSelectMode', view.selectDispatcher, view);
					view.eventManager.subscribe('processChoice', view.selectDispatcher, view);
					view.eventManager.subscribe('editProjectMetadata', view.metaDispatcher, view);
					view.eventManager.subscribe('maxScoreUpdated', view.metaDispatcher, view);
					view.eventManager.subscribe('postLevelChanged', view.metaDispatcher, view);
					view.eventManager.subscribe('setLastEdited', view.metaDispatcher, view);
					view.eventManager.subscribe('saveStep', view.authorStepDispatcher, view);
					view.eventManager.subscribe('saveAndCloseStep', view.authorStepDispatcher, view);
					view.eventManager.subscribe('authorStepModeChanged', view.authorStepDispatcher, view);
					view.eventManager.subscribe('updateRefreshOption', view.authorStepDispatcher, view);
					view.eventManager.subscribe('refreshNow', view.authorStepDispatcher, view);
					view.eventManager.subscribe('editHints', view.authorStepDispatcher, view);
					view.eventManager.subscribe('addHint', view.authorStepDispatcher, view);
					view.eventManager.subscribe('deleteHint', view.authorStepDispatcher, view);
					view.eventManager.subscribe('saveHint', view.authorStepDispatcher, view);
					view.eventManager.subscribe('saveHints', view.authorStepDispatcher, view);
					view.eventManager.subscribe('sourceUpdated', view.authorStepDispatcher, view);
					view.eventManager.subscribe('closeOnStepSaved', view.authorStepDispatcher, view);
					view.eventManager.subscribe('closeStep', view.authorStepDispatcher, view);
					view.eventManager.subscribe('cleanProject', view.cleanDispatcher, view);
					view.eventManager.subscribe('deleteProject', view.authorDispatcher, view);
					view.eventManager.subscribe('findBrokenLinksInProject', view.authorDispatcher, view);
					view.eventManager.subscribe('findUnusedAssetsInProject', view.authorDispatcher, view);
					view.eventManager.subscribe('cleanSavingProjectStart', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanSavingProjectComplete', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanClosingProjectStart', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanClosingProjectComplete', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanLoadingProjectFileStart', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanLoadingProjectFileComplete', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanAnalyzingProjectStart', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanAnalyzingProjectComplete', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanDisplayingResultsStart', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanDisplayingResultsComplete', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanSavingProjectFileStart', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanSavingProjectFileComplete', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanSave', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanCancel', view.cleanDispatcher, view);
					view.eventManager.subscribe('cleanUpdateProjectMetaFile', view.cleanDispatcher, view);
					view.eventManager.subscribe('toggleVersionOptions', view.versionDispatcher, view);
					view.eventManager.subscribe('versionUnversionedProject', view.versionDispatcher, view);
					view.eventManager.subscribe('versionProject', view.versionDispatcher, view);
					view.eventManager.subscribe('cancelVersionProject', view.versionDispatcher, view);
					view.eventManager.subscribe('versionSetActive', view.versionDispatcher, view);
					view.eventManager.subscribe('setActiveVersion', view.versionDispatcher, view);
					view.eventManager.subscribe('cancelSetActiveVersion', view.versionDispatcher, view);
					view.eventManager.subscribe('versionOpenVersion', view.versionDispatcher, view);
					view.eventManager.subscribe('openVersion', view.versionDispatcher, view);
					view.eventManager.subscribe('cancelOpenVersion', view.versionDispatcher, view);
					view.eventManager.subscribe('versionCreateSnapshot', view.versionDispatcher, view);
					view.eventManager.subscribe('createSnapshot', view.versionDispatcher, view);
					view.eventManager.subscribe('cancelCreateSnapshot', view.versionDispatcher, view);
					view.eventManager.subscribe('versionRevertProject', view.versionDispatcher, view);
					view.eventManager.subscribe('versionRevertNode', view.versionDispatcher, view);
					view.eventManager.subscribe('getSnapshotInfo', view.versionDispatcher, view);
					view.eventManager.subscribe('snapshotInfoSelectChanged', view.versionDispatcher, view);
					view.eventManager.subscribe('snapshotInfoDone', view.versionDispatcher, view);
					view.eventManager.subscribe('setActiveVersionById', view.versionDispatcher, view);
					view.eventManager.subscribe('authorConstraints', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintTitleClicked', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintCreateConstraint', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintSelectTypeChanged', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintFinishCreateConstraint', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintProjectNodesSelectChanged', view.constraintDispatcher, view);
					view.eventManager.subscribe('closingConstraintDialog', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintEntryClicked', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintRemoveConstraint', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintShowAll', view.constraintDispatcher, view);
					view.eventManager.subscribe('constraintHideAll', view.constraintDispatcher, view);
					view.eventManager.subscribe('editProjectTags', view.projectTagsDispatcher, view);
					view.eventManager.subscribe('projectTagCreateTag', view.projectTagsDispatcher, view);
					view.eventManager.subscribe('projectTagTagChanged', view.projectTagsDispatcher, view);
					view.eventManager.subscribe('projectTagRemoveTag', view.projectTagsDispatcher, view);
					view.eventManager.subscribe('browserResize', view.authorDispatcher, view);
					view.eventManager.subscribe('displayTagView', view.authorDispatcher, view);
					view.eventManager.subscribe('displayImportView', view.authorDispatcher, view);
					view.eventManager.subscribe('displayIconsView', view.authorDispatcher, view);
					view.eventManager.subscribe('populateAddTagSelect', view.authorDispatcher, view);
					view.eventManager.subscribe('populateAddTagMapSelect', view.authorDispatcher, view);
					view.eventManager.subscribe('addTag', view.authorDispatcher, view);
					view.eventManager.subscribe('addTagMap', view.authorDispatcher, view);
					view.eventManager.subscribe('removeTag', view.authorDispatcher, view);
					view.eventManager.subscribe('tagNameChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('tagMapChanged', view.authorDispatcher, view);
					view.eventManager.subscribe('removeTagMap', view.authorDispatcher, view);
					view.eventManager.subscribe('openProjectInImportView', view.authorDispatcher, view);
					view.eventManager.subscribe('importSelectedItems', view.authorDispatcher, view);
					view.eventManager.subscribe("premadeCommentWindowLoaded", view.authoringToolPremadeCommentsDispatcher, view);
					view.eventManager.subscribe("premadeCommentLabelClicked", view.authoringToolPremadeCommentsDispatcher, view);
					view.eventManager.subscribe("gotoDashboard", view.authorDispatcher, view);
					
					if (window.parent && window.parent.portalAuthorUrl) {
						window.parent.loaded();
					} else {
						view.getProjectPaths();
					};
					
					view.initializeOpenProjectDialog();
					view.initializeCreateProjectDialog();
					view.initializeCreateSequenceDialog();
					view.initializeCreateNodeDialog();
					view.initializeEditProjectFileDialog();
					//view.initializeAssetUploaderDialog();
					view.initializeAssetEditorDialog();
					view.initializeCopyProjectDialog();
					view.initializeEditProjectMetadataDialog();
					view.initializePreviousWorkDialog();
					view.initializeNodeSelectorDialog();
					view.initializeCleanProjectDialog();
					view.initializeVersionProjectDialog();
					view.initializeSetActiveVersionDialog();
					view.initializeOpenVersionDialog();
					view.initializeCreateSnapshotDialog();
					view.initializeSnapshotInformationDialog();
					view.initializeConstraintAuthoringDialog();
					view.initializeEditProjectTagsDialog();
					view.initializeReviewUpdateProjectDialog();
					view.initializeStepTypeDescriptionsDialog();
					view.initializeTagViewDialog();
					view.initializeImportViewDialog();
					view.initializeIconsViewDialog();
					view.initializeAnalyzeProjectDialog();
										
					window.onunload = env.onWindowUnload;
				}
			}
		},
		student:{
			variables:{
				model:null,
				allowedStudentAssetExtensions:['jpg', 'jpeg', 'gif', 'png', 'bmp', 'pdf', 'txt', 'doc'],
				userAndClassInfoLoaded:false,
				viewStateLoaded:false,
				currentPosition:undefined, 
				state:undefined, 
				activeNote:undefined,
				MAX_ASSET_SIZE:2097152				
			},
			events:{
				'retrieveLocalesCompleted':[null,null],
				'retrieveThemeLocalesCompleted':[null,null],
				'renderNodeCompleted':[null,null],
				'startVLECompleted':[null,null],
				'ifrmLoaded':[null,null],
				'processLoadViewStateResponseCompleted':[null,null],
				'noteEditorKeyPressed':[null,null],
				'loadingThemeCompleted':[null,null],
				'assetUploaded':[null,null],
				'chatRoomTextEntrySubmitted':[null, null],
				'studentWorkUpdated':[null,null],
				'currentNodePositionUpdated':[null,null],
				'constraintStatusUpdated':[null,null],
				'nodeLinkClicked':[null,null],
				'nodeStatusUpdated':[null,null],
				'cRaterResponseReceived':[null,null],
				'renderNodeBlocked':[null,null]
			},
			methods:{},
			initialize:{
				init:function(view){
						view.eventManager.subscribe('retrieveLocalesCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('retrieveThemeLocalesCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('loadingProjectStarted', view.vleDispatcher, view);
						view.eventManager.subscribe('loadingProjectCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('getUserAndClassInfoStarted', view.vleDispatcher, view);
						view.eventManager.subscribe('getUserAndClassInfoCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('processLoadViewStateResponseCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('renderNodeCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('retrieveAnnotationsCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('retrieveProjectMetaDataCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('retrieveRunExtrasCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('ifrmLoaded', view.vleDispatcher, view);
						view.eventManager.subscribe('noteEditorKeyPressed', view.vleDispatcher, view);
						view.eventManager.subscribe('contentRenderCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('startVLECompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('loadingThemeCompleted', view.vleDispatcher, view);
						view.eventManager.subscribe('scriptsLoaded', view.vleDispatcher, view);
						view.eventManager.subscribe('assetUploaded', view.vleDispatcher, view);
						view.eventManager.subscribe('chatRoomTextEntrySubmitted', view.vleDispatcher, view);
						view.eventManager.subscribe('studentWorkUpdated', view.vleDispatcher, view);
						view.eventManager.subscribe('currentNodePositionUpdated', view.vleDispatcher, view);
						view.eventManager.subscribe('constraintStatusUpdated', view.vleDispatcher, view);
						view.eventManager.subscribe('nodeLinkClicked', view.vleDispatcher, view);
						view.eventManager.subscribe('renderNodeBlocked', view.vleDispatcher, view);
						view.eventManager.initializeLoading([['loadingProjectStarted','loadingProjectCompleted','Project'],
						                                     ['getUserAndClassInfoStarted','getUserAndClassInfoCompleted', 'Learner Data'], 
						                                     ['getUserAndClassInfoStarted', 'renderNodeCompleted', 'Learning Environment']]);
						
						/* set up saving dialog for when user exits */
						$('body').append('<div id="onUnloadSaveDiv">Saving data...</div>');
						$('#onUnloadSaveDiv').dialog({autoOpen:false,width:300,height:100,modal:true,draggable:false,resizable:false,closeText:'',dialogClass:'no-title'});
					},
				keystrokeManager:function(){
						var keystrokes = [];
						return createKeystrokeManager(eventManager,keystrokes);
					}
			}
		},
		studentwork:{
			variables:{},
			events:{},
			methods:{
				onWindowUnload:function(view){return function(logout){view.onWindowUnload(logout);};}
			},
			initialize:{}
		},
		audio:{
			variables:{audioManager:undefined,updateAudioOnRender:false,audioReady:[],audioLocation:"audio",nodeAudioMap:{}},
			events:{
			},
			methods:{},
			initialize:{
				init:function(view){
					view.eventManager.subscribe('loadingProjectCompleted', view.audioDispatcher, view);
					view.eventManager.subscribe('renderNodeCompleted', view.audioDispatcher,view);
					view.eventManager.subscribe('contentRenderCompleted', view.audioDispatcher, view);
					view.eventManager.subscribe('pageRenderCompleted', view.audioDispatcher, view);
				}
			}
		},
		keystroke:{
			variables:{keystrokeManager:undefined}
		},
		hint:{},
		navigation:{
			variables:{
				navigationLogic:undefined,
				isNavigationComponentPresent:true,
				isNavigationComponentLoaded:false,
				isProjectConstraintProcessingComplete:false,
				myMenu:undefined,
				navigationPanel:undefined
			},
			events:{
				'navigationLoadingCompleted':[null,null]
			},
			initialize:{
				init:function(view){
					view.eventManager.subscribe('loadingProjectCompleted', view.navigationDispatcher, view);
					view.eventManager.subscribe('renderNodeCompleted', view.navigationDispatcher, view);
					view.eventManager.subscribe('navigationLoadingCompleted', view.vleDispatcher, view);
					view.eventManager.subscribe('processLoadViewStateResponseCompleted', view.navigationDispatcher, view);
				}
			}
		},
		uicontrol:{
			variables:{},
			events:{
				'unlockScreenEvent':[null,null],
				'lockScreenAndShareWithClass':[null,null]
			},
			initialize:{
				init:function(view){
					view.eventManager.subscribe('lockScreenAndShareWithClass', view.uicontrolDispatcher, view);
					view.eventManager.subscribe('unlockScreenEvent', view.uicontrolDispatcher, view);
				}
			}
		},
		ddMenu:{
		},
		topMenu:{
			variables:{studentProgressArray:new Array("onlyLatestAsCSV")},
			events:{'showAllWork':[null,null],
					'displayProgress':[null,null],
					'showFlaggedWork':[null,null],
					'showStepHints':[null,null],
					'showNodeAnnotations':[null,null],
					'adjustHintSize':[null,null],
					'showNavigationTree':[null,null],
					'getIdeaBasket':[null,null],
					'getPublicIdeaBasket':[null,null],
					'ideaBasketChanged':[null,null],
					'displayAddAnIdeaDialog':[null,null],
					'displayIdeaBasket':[null,null],
					'viewStudentAssets':[null,null],
					'studentAssetSubmitUpload':[null,null],
					'addIdeaToBasket':[null,null],
					'moveIdeaToTrash':[null,null],
					'moveIdeaOutOfTrash':[null,null],
					'ideaBasketDocumentLoaded':[null,null],
					'displayFlaggedWorkForNodeId':[null,null]
			},
			methods:{},
			initialize:{
				init:function(view){
					view.eventManager.subscribe('showAllWork', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('displayProgress', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('showFlaggedWork', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('showStepHints', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('showNodeAnnotations', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('adjustHintSize', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('showNavigationTree', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('getIdeaBasket', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('getPublicIdeaBasket', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('ideaBasketChanged', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('displayAddAnIdeaDialog', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('displayIdeaBasket', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('addIdeaToBasket', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('viewStudentAssets', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('studentAssetSubmitUpload', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('moveIdeaToTrash', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('moveIdeaOutOfTrash', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('ideaBasketDocumentLoaded', view.dropDownMenuDispatcher, view);
					view.eventManager.subscribe('displayFlaggedWorkForNodeId', view.dropDownMenuDispatcher, view);
				}
			}
		},
		annotations:{},
		maxscores:{},
		customcontextmenu:{},
		messagemanager:{},
		wise:{},
		peerreviewhelper:{},
		ideabasket:{},
		studentasset:{},
		authoringcomponents:{
			variables:{
				updatePromptAfterPreview:false
			},
			events:{
				'nodeSelectorSelected':[null,null],
				'nodeSelectorCanceled':[null,null],
				'createLink':[null,null],
				'linkToNodeChanged':[null,null],
				'removeLinkTo':[null,null],
				'stepPromptChanged':[null, null],
				'stepStudentResponseBoxSizeChanged':[null, null],
				'stepRichTextEditorToggleChanged':[null, null],
				'stepStarterSentenceAuthoringOptionChanged':[null, null],
				'stepStarterSentenceAuthoringSentenceChanged':[null, null],
				'cRaterVerify':[null, null],
				'cRaterItemTypeChanged':[null,null],
				'cRaterItemIdChanged':[null, null],
				'cRaterFeedbackChanged':[null, null],
				'cRaterDisplayScoreToStudentChanged':[null, null],
				'cRaterDisplayFeedbackToStudentChanged':[null, null],
				'cRaterMustSubmitAndReviseBeforeExitChanged':[null, null],
				'cRaterAddFeedback':[null, null],
				'cRaterRemoveFeedback':[null, null],
				'cRaterMaxCheckAnswersChanged':[null, null],
				'enableCRater':[null, null],
				'stepIconUpdated':[null, null],
				'cRaterStudentActionUpdated':[null, null]
			},
			methods:{},
			initialize:{
				init:function(view){
					view.eventManager.subscribe('nodeSelectorSelected', view.linkManager.dispatcher, view);
					view.eventManager.subscribe('nodeSelectorCanceled', view.linkManager.dispatcher, view);
					view.eventManager.subscribe('createLink', view.linkManager.dispatcher, view);
					view.eventManager.subscribe('linkToNodeChanged', view.linkManager.dispatcher, view);
					view.eventManager.subscribe('removeLinkTo', view.linkManager.dispatcher, view);
					view.eventManager.subscribe('contentRenderCompleted', view.linkManager.dispatcher, view);
					view.eventManager.subscribe('stepPromptChanged', view.promptManager.dispatcher, view);
					view.eventManager.subscribe('stepStudentResponseBoxSizeChanged', view.studentResponseBoxSizeManager.dispatcher, view);
					view.eventManager.subscribe('stepRichTextEditorToggleChanged', view.richTextEditorToggleManager.dispatcher, view);
					view.eventManager.subscribe('stepStarterSentenceAuthoringOptionChanged', view.starterSentenceAuthoringManager.dispatcher, view);
					view.eventManager.subscribe('stepStarterSentenceAuthoringSentenceChanged', view.starterSentenceAuthoringManager.dispatcher, view);
					view.eventManager.subscribe('cRaterVerify', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterItemIdChanged', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterItemTypeChanged', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterFeedbackChanged', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterDisplayScoreToStudentChanged', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterDisplayFeedbackToStudentChanged', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterMustSubmitAndReviseBeforeExitChanged', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterAddFeedback', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterRemoveFeedback', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('cRaterMaxCheckAnswersChanged', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('enableCRater', view.cRaterManager.dispatcher, view);
					view.eventManager.subscribe('stepIconUpdated', view.stepIconsManager.dispatcher, view);
					view.eventManager.subscribe('cRaterStudentActionUpdated', view.cRaterManager.dispatcher, view);
				}
			}
		},
		studentWebSocket:{},
		teacherWebSocket:{
			variables:{},
			events:{
				'classroomMonitorConfigUrlReceived': [null, null],
				'loadingProjectComplete': [null, null]
			},
			methods:{},
			initialize:{
				init:function(view){
					eventManager.subscribe("classroomMonitorConfigUrlReceived", view.classroomMonitorDispatcher, view);
					eventManager.subscribe("loadingProjectCompleted", view.classroomMonitorDispatcher, view);
				}
			}
		}
	};
	
	components.grading_min = components.grading;
	components.core_min = components.core;
	components.studentwork_min = components.studentwork;
	components.annotations_min = components.annotations;
	components.teacherXMPP_min = components.teacherXMPP;
	components.maxscores_min = components.maxscores;
	
	/**
	 * Component loader listener listens for events pertaining to the loading
	 * of components.
	 */
	var listener = function(type, args, obj){
		if(type=='loadingComponentComplete'){
			initializeComponent(args[0]);
		} else if(type=='componentInitializationComplete'){
			if(componentQueue.length>0){
				var comp = componentQueue.shift();
				loadComponent(comp[0], comp[1], comp[2], comp[3], comp[4]);
			} else {
				eventManager.fire('loadingViewComplete', [args[0]]);
			};
		} else if(type=='loadingViewComplete'){
			//do something here if needed
		} else if(type=='scriptsLoaded' && args[0]=='componentloader'){
			/* if using compressed scripts, fire initialization complete to bypass initialization */
			if(args[1].indexOf('_all')!=-1){
				eventManager.fire('componentInitializationComplete');
			} else {
				eventManager.fire('loadingComponentComplete', [args[1]]);
			}
		};
	};
	
	eventManager.addEvent('loadingComponentStart');
	eventManager.addEvent('loadingComponentComplete');
	eventManager.addEvent('loadingViewStart');
	eventManager.addEvent('loadingViewComplete');
	eventManager.addEvent('componentInitializationStart');
	eventManager.addEvent('componentInitializationComplete');
	eventManager.subscribe('loadingComponentComplete', listener);
	eventManager.subscribe('loadingViewComplete', listener);
	eventManager.subscribe('scriptsLoaded', listener);
	eventManager.subscribe('componentInitializationComplete',listener);
	
	/**
	 * Loads the events, variables, methods and styling that comprise the
	 * component of the given name into the given view.
	 */
	var loadComponent = function(name, env, view, doc, compress){
		/* signal start of component load */
		eventManager.fire('loadingComponentStart');
		
		/* retrieve component of name */
		var comp = components[name];
		if(!comp){//return if it does not exist
			alert('Could not find component with name ' + name + ', unable to load component.');
			return;
		};
		
		/* insert view, doc and environment into component for reference */
		comp.view = view;
		comp.env = env;
		comp.doc = doc;
		
		/* insert variables into view */
		for(var a in comp.variables){
			view[a] = comp.variables[a];
		};
		
		/* add events for this view */
		for(var b in comp.events){
			eventManager.addEvent(b, comp.events[b][0], comp.events[b][1]);
		};
		
		/* load methods for this view */
		for(var c in comp.methods){
			env.generateMethod(c, comp.methods[c]);
		};
		
		/* load scripts and css for this view and component if not using compressed scripts */
		if(!compress){
			scriptloader.loadScripts(name, doc, 'componentloader', eventManager);
		} else {
			/* just load css and fire scripts loaded event to continue processing */
			scriptloader.loadCssOnly(name, doc);
			eventManager.fire('scriptsLoaded', ['componentloader', name]);
		};
	};
	
	/**
	 * Initializes any variables for the component by running pre-defined
	 * functions which set variable values and create new objects.
	 */
	var initializeComponent = function(name){
		var ins = components[name].initialize;
		if(ins){
			for(var d in ins){
				components[name].view[d] = ins[d](components[name].view);
			};
		};
		eventManager.fire('componentInitializationComplete', [name]);
	};
	
	/**
	 * Public members visible to all.
	 */
	return {
		/**
		 * Loads all of the components needed for the view of the given name
		 * into the given view.
		 */
		loadView: function(env, view, doc, compress){
			eventManager.fire('loadingViewStart');
			var comps = views[view.name];
			for(var a=0;a<comps.length;a++){
				componentQueue.push([comps[a], env, view, doc, compress]);
			};
			
			if(compress){
				scriptloader.loadScripts(view.name + '_all', doc, 'componentloader', eventManager);
			} else if(componentQueue.length>0){
				var comp = componentQueue.shift();
				loadComponent(comp[0], comp[1], comp[2], comp[3], comp[4]);
			} else {
				eventManager.fire('loadingViewComplete', [view.name]);
			};
		},
		getScriptsForView: function(view){
			var allScripts = [];
			var comps = views[view];
			if(comps){
				for(var a=0;a<comps.length;a++){
					allScripts = allScripts.concat(scriptloader.getScriptsArray(comps[a]));
				};
			} else {
				return [];
			};
			
			return allScripts;
		},
		/*
		 * Add an event to the vle so that it will listen for the event and 
		 * know what to do when the event is fired
		 * @param eventName the event name as a string
		 * @param dispatcherName a string containing the name of the function
		 * that will handle the processing when the event is fired
		 */
		addEvent: function(eventName, dispatcherName) {
			//get the vle
			var view = components.core.view;
			
			//add the event to the vle
			eventManager.addEvent(eventName);
			
			//tell the vle to call this dispatcher function when this event is fired
			eventManager.subscribe(eventName, view[dispatcherName], view);
		},
		/*
		 * Add an entry to the nodeClasses
		 * @param nodeType the name of the node type
		 * @param nodeClassesArray an array containing objects, each object contains
		 * two fields, nodeClass and nodeClassText
		 */
		addNodeClasses:function(nodeType, nodeClassesArray) {
			components.core.variables.nodeClasses[nodeType] = nodeClassesArray;
		},
		/*
		 * Add an entry to the nodeIconPaths
		 * @param nodeType the name of the node type
		 * @param nodeIconPath a string containing the path to the node type's icon directory
		 */
		addNodeIconPath:function(nodeType, nodeIconPath) {
			components.core.variables.nodeIconPaths[nodeType] = nodeIconPath;
		},
		/*
		 * Add an entry to the nodeTemplateParams object. The template file params
		 * will be used to load the template files. The template files
		 * will be loaded and the content will be retrieved from them and used
		 * as the template for the node type when an author adds a new step
		 * to their project.
		 * @param nodeType the type of the node
		 * @param nodeTemplateParams an object containing the fields nodeTemplateFilePath
		 * and nodeExtension
		 */
		addNodeTemplateParams:function(nodeType, nodeTemplateParams) {
			components.author.variables.nodeTemplateParams[nodeType] = nodeTemplateParams;
		},
		/*
		 * Add an entry to the VLE's activeThemes
		 * @param themeName the name of the theme
		 * @param themeNavModes an array containing the names of the theme's navigation modes
		 */
		addTheme:function(themeName, themeNavModes) {
			components.core.variables.activeThemes.push(themeName);
			components.core.variables.themeNavModes[themeName] = themeNavModes;
		},
	};
}(eventManager, scriptloader);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/util/componentloader.js');
};