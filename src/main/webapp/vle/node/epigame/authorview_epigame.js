/**
 * Sets the EpigameNode type as an object of this view
 * @constructor
 */
View.prototype.EpigameNode = {};

/*
 * Add the name of the common component that this step will use. The
 * common components will be handled by the authoring tool. You will
 * need to create div elements with the appropriate id for the
 * authoring tool to insert the component into. Any additional custom
 * authoring components specific to your step type will be written 
 * by you in the generatePage() function. You may leave the array
 * empty if you are not using any common components.
 * 
 * Here are the available common components
 * 'Prompt'
 * 'LinkTo'
 * 'StudentResponseBoxSize'
 * 'RichTextEditorToggle'
 * 'StarterSentenceAuthoring'
 * 
 * If you use a common components, you must create a div with the
 * appropriate id, here are the respective ids
 * 'promptContainer'
 * (LinkTo does not require a div)
 * 'studentResponseBoxSizeContainer'
 * 'richTextEditorToggleContainer'
 * 'starterSentenceAuthoringContainer'
 */
View.prototype.EpigameNode.commonComponents = [];

View.prototype.EpigameNode.modes = ["mission", "tutorial", "adaptiveMission", "adaptiveQuiz", "editor", "map"];

/**
 * Generates the authoring page. This function will create the authoring
 * components such as textareas, radio buttons, check boxes, etc. that
 * authors will use to author the step. For example if the step has a
 * text prompt that the student will read, this function will create
 * a textarea that will allow the author to type the text that the
 * student will see. You will also need to populate the textarea with
 * the pre-existing prompt if the step has been authored before.
 */
View.prototype.EpigameNode.generatePage = function(view){
	this.view = view;
	
	//get the content of the step
	this.content = this.view.activeContent.getContentJSON();
	
	//get the html element that all the authoring components will be located
	var parent = document.getElementById('dynamicParent');
	
	/*
	 * wipe out the div that contains the authoring components because it
	 * may still be populated with the authoring components from a previous
	 * step the author has been authoring since we re-use the div id
	 */
	parent.removeChild(document.getElementById('dynamicPage'));

	//create a new div that will contain the authoring components
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	var authoringSwfDiv = createElement(document, 'div', {id: 'authoringSwfDiv'});
		
	//Custom SWF selection
	var swfUrlDiv = $(createElement(document, 'div', {id:'swfUrlDiv'}));
	var swfUrlLabel = $(document.createElement('span')).text('Custom swf file (Leave blank for default):');
	var swfUrlInput = $(createElement(document, 'input', {id: 'swfUrlInput', type:'text', size:'36', onchange:"eventManager.fire('epigameSwfUrlChanged')"}));
	var swfBrowseButton = $(createElement(document, 'button', {id: 'swfBrowseButton', onclick:'eventManager.fire("epigameBrowseClicked")'})).text('Browse');
	swfUrlDiv.append(swfUrlLabel).append(createBreak()).append(swfUrlInput).append(swfBrowseButton);
	
	//Mode selection
	var modeSelectorDiv = $(createElement(document, 'div', {id:'modeSelectorDiv'}));
	var modeSelectorLabel = $(document.createElement('span')).text('Step type:');
	
	var modeLabels = ["Standard Mission", "Tutorial Mission", "Adaptive Mission", "Adaptive Quiz", "Mission Editor", "Star Map"];
	var modeSelector = $(createElement(document, 'select', {id:'modeSelector', onchange:"eventManager.fire('epigameChangeMode')"}));
	for (var i = 0; i < this.modes.length; ++i) {
		modeSelector.append($(createElement(document, 'option', {value: this.modes[i]})).html(modeLabels[i]));
	}
	modeSelectorDiv.append(modeSelectorLabel).append(createBreak()).append(modeSelector);
	
	//create here text to use for the question time limit
	var questionDiv = $(createElement(document, 'fieldset', {id:'questionDiv'}));	
	var questionLegend = $(document.createElement('legend')).text('Time Limit');
	var questionSpan = $(document.createElement('span')).text('Quiz Time Limit');
	
	var noTimeToggle = createElement(document, "input", {id:'noTimeToggle', type:"radio", name: "timeLimit", onclick:"eventManager.fire('epigameChangeSettings')"});
	var noTimeLabel = $(createElement(document, 'label', {id:'noTimeLabel', "for":"noTimeToggle"})).text('No Time Limit');	
	var testTimeToggle = createElement(document, "input", {id:'testTimeToggle', type:"radio", name: "timeLimit", onclick:"eventManager.fire('epigameChangeSettings')"});
	var testTimeLabel = $(createElement(document, 'label', {id:'testTimeLabel', "for":"testTimeToggle"})).text('Time Limit for the Entire Test');	
	var testTimeBox = createElement(document, "input", {id:'testTimeText', type:"text", onchange:"eventManager.fire('epigameChangeSettings')",size:"5"});
	
	var questionTimeToggle = createElement(document, "input", {id:'questionTimeToggle', type:"radio", name: "timeLimit", onclick:"eventManager.fire('epigameChangeSettings')"});
	var questionTimeLabel = $(createElement(document, 'label', {id:'questionTimeLabel', "for":"questionTimeToggle"})).text('Time Limit per Question');	
	var questionTimeBox = createElement(document, "input", {id:'questionTimeText', type:"text", onchange:"eventManager.fire('epigameChangeSettings')",size:"5"});
		
	//Mission data input
	var levelStringDiv = $(createElement(document, 'div', {id:'levelStringDiv'}));
	var levelStringLabel = $(createElement(document, 'span', {id:'levelStringLabel'})).text('Mission String:');
	var levelStringTextArea = createElement(document, 'input', {id: 'levelStringTextArea', type: 'text', size: '45', onchange:"eventManager.fire('epigameUpdateLevelString')"});
	levelStringDiv.append(levelStringLabel).append(createBreak()).append(levelStringTextArea);
	
	//Quiz data input
	var quizStringDiv = $(createElement(document, 'div', {id:'quizStringDiv'}));
	var quizStringLabel = $(createElement(document, 'span', {id:'quizStringLabel'})).text('Quiz Selector:');
	var preQuizToggle = createElement(document, "input", {id:'preQuizToggle', type:"radio", name: "timeLimit", onclick:"eventManager.fire('epigameChangeSettings')"});
	var preQuizLabel = $(createElement(document, 'label', {id:'preQuizLabel', "for":"noTimeToggle"})).text('No Time Limit');	
	var postQuizToggle = createElement(document, "input", {id:'postQuizToggle', type:"radio", name: "timeLimit", onclick:"eventManager.fire('epigameChangeSettings')"});
	var postQuizLabel = $(createElement(document, 'label', {id:'postQuizLabel', "for":"testTimeToggle"})).text('Time Limit for the Entire Test');	
	
//	var warpSettingDiv = $(createElement(document, 'div', {id:'warpSettingDiv'}));
//	var warpSettingLabel = $(createElement(document, 'span', {id:'quizStringLabel'})).text('Quiz Selector:'); 
	
	quizStringDiv.append(quizStringLabel).append(createBreak()).append(preQuizToggle).append(preQuizLabel);	
	
	//Project settings input
	var settingsToggle = createElement(document, "input", {id:'settingsToggle', type:"checkbox", checked:"checked", onclick:"eventManager.fire('epigameToggleSettings')"});
	var settingsLabel = $(createElement(document, 'label', {id:'settingsLabel', "for":"settingsToggle"})).text('Use this step to define project settings');
	var settingsDiv = $(createElement(document, 'fieldset', {id:'settingsDiv'}));
	var settingsLegend = $(document.createElement("legend")).text("Project Settings");
	var settingsExplScoreToggle = createElement(document, "input", {id:'explScoreToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});
	var settingsExplScoreLabel = $(createElement(document, 'label', {id:'explScoreLabel', "for":'explScoreToggle'})).text('Show Explanation Score (question-based) instead of Performance Score (completion-based)');
	var settingsWarpScoreToggle = createElement(document, "input", {id:'warpScoreToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});
	var settingsWarpScoreLabel = $(createElement(document, 'label', {id:'warpScoreLabel', "for":"warpScoreToggle"})).text('Show Warp Scores (used for missions with Warp Questions)');
	var settingsScoreReqsToggle = createElement(document, "input", {id:'scoreReqsToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});
	var settingsScoreReqsLabel = $(createElement(document, 'label', {id:'scoreReqsLabel', "for":"scoreReqsToggle"})).text('Ignore Tag Map "Score to Unlock" for hidden scores above');
	var settingsQuestionsToggle = createElement(document, "input", {id:'questionsToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});
	var settingsQuestionsLabel = $(createElement(document, 'label', {id:'questionsLabel', "for":"questionsToggle"})).text('Show Questions instead of Tips (recommended if using Explanation Score; does not affect Warp Questions)');
	
	var settingsNoQuestionToggle = createElement(document, "input", {id:'noQuestionsToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});
	var settingsNoQuestionLabel = $(createElement(document, 'label', {id:'noQuestionsLabel', "for":"questionNoToggle"})).text('Disable Tips and Questions');
	
	var settingsSpatialToggle = createElement(document, "input", {id: 'spatialToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});
	var settingsSpatialLabel = $(createElement(document, 'label', {id:'spatialLabel', "for":"spatialToggle"})).text('Use Spatial Interface');

	var settingsHideScoreScreenToggle = createElement(document, "input", {id: 'hideScoreScreenToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});
	var settingsHideScoreScreenLabel = $(createElement(document, 'label', {id:'hideScoreScreenLabel', "for":"hideScoreScreenToggle"})).text('Hide Score Screen');
	
	var rank1Name = $(createElement(document, 'label', {id:'rank1Name', "for":"rank1Name"})).text('Fluffy');
	var rank2Name = $(createElement(document, 'label', {id:'rank2Name', "for":"rank2Name"})).text('Planet Hopper');
	var rank3Name = $(createElement(document, 'label', {id:'rank3Name', "for":"rank3Name"})).text('Stratosplorer');
	var rank4Name = $(createElement(document, 'label', {id:'rank4Name', "for":"rank4Name"})).text('Solar Rocketeer');
	var rank5Name = $(createElement(document, 'label', {id:'rank5Name', "for":"rank5Name"})).text('Space Commando');	
	
	var rank1Text = createElement(document, "input", {id:'rank1Text', type:"text", onchange:"eventManager.fire('epigameChangeSettings')",size:"5"});
	var rank2Text = createElement(document, "input", {id:'rank2Text', type:"text", onchange:"eventManager.fire('epigameChangeSettings')",size:"5"});
	var rank3Text = createElement(document, "input", {id:'rank3Text', type:"text", onchange:"eventManager.fire('epigameChangeSettings')",size:"5"});
	var rank4Text = createElement(document, "input", {id:'rank4Text', type:"text", onchange:"eventManager.fire('epigameChangeSettings')",size:"5"});
	var rank5Text = createElement(document, "input", {id:'rank5Text', type:"text", onchange:"eventManager.fire('epigameChangeSettings')",size:"5"});

	var rankValue = $(createElement(document, 'label', {id:'rankText', "for":"rankText"})).text('Rank Values');

	var forceRestrictionToggle = createElement(document, "input", {id:'forceRestrictionToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});	
	var forceRestrictionLabel = $(createElement(document, 'label', {id:'forceRestriction', "for":"forceRestriction"})).text('Disable Force Restrictions');

	var hideQuizScoreToggle = createElement(document, "input", {id:'hideQuizScoreToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});	
	var hideQuizScoreLabel = $(createElement(document, 'label', {id:'hideQuizScore', "for":"hideQuizScore"})).text('Hide Quiz Score');

	var disableEncyclopediaToggle = createElement(document, "input", {id:'disableEncyclopediaToggle', type:"checkbox", onclick:"eventManager.fire('epigameChangeSettings')"});	
	var disableEncyclopediaLabel = $(createElement(document, 'label', {id:'disableEncyclopediaScore', "for":"hideQuizScore"})).text('Disable Encyclopedia');
	
	//get document mode
	var levelString = "";
	var customUri = "";
	var mode = "mission";
	
	if (this.content != null) {
		//get the existing level string
		levelString = this.content.levelString;
		
		if (this.content.customUri){
			customUri = this.content.customUri;
		}
		
		if (this.content.mode) {
			mode = this.content.mode;
		}
	}	
	
	settingsDiv.append(settingsLegend)
	.append(settingsExplScoreToggle).append(settingsExplScoreLabel).append(createBreak()).append(createBreak())
	.append(settingsWarpScoreToggle).append(settingsWarpScoreLabel).append(createBreak()).append(createBreak())
	.append(settingsScoreReqsToggle).append(settingsScoreReqsLabel).append(createBreak()).append(createBreak())
	.append(settingsQuestionsToggle).append(settingsQuestionsLabel).append(createBreak()).append(createBreak())
	.append(settingsNoQuestionToggle).append(settingsNoQuestionLabel).append(createBreak()).append(createBreak())
	.append(settingsSpatialToggle).append(settingsSpatialLabel).append(createBreak())
	.append(settingsHideScoreScreenToggle).append(settingsHideScoreScreenLabel)
	
	settingsDiv.append(createBreak()).append(createBreak()).append(questionSpan).append(createBreak()).append(noTimeToggle).append(noTimeLabel).append(createBreak());
	settingsDiv.append(testTimeToggle).append(testTimeLabel).append(testTimeBox).append(createBreak());
	settingsDiv.append(questionTimeToggle).append(questionTimeLabel).append(questionTimeBox).append(createBreak());

	settingsDiv.append(createBreak()).append(rankValue).append(createBreak());
	settingsDiv.append(rank1Text).append(rank1Name).append(createBreak()).append(rank2Text).append(rank2Name).append(createBreak()).append(rank3Text).append(rank3Name).append(createBreak()).append(rank4Text).append(rank4Name).append(createBreak()).append(rank5Text).append(rank5Name).append(createBreak());

	settingsDiv.append(createBreak()).append(forceRestrictionToggle).append(forceRestrictionLabel).append(createBreak());
	settingsDiv.append(createBreak()).append(hideQuizScoreToggle).append(hideQuizScoreLabel).append(createBreak());
	settingsDiv.append(createBreak()).append(disableEncyclopediaToggle).append(disableEncyclopediaLabel).append(createBreak());
	
	//add the authoring components to the page
	$(pageDiv)
	.append(swfUrlDiv)
	.append(createBreak())
	.append(createBreak())
	.append(modeSelectorDiv)
	.append(createBreak());
	
	$(pageDiv)
	.append(levelStringDiv)
	.append(quizStringDiv)
	.append(createBreak())
	.append(createBreak())
	.append(settingsToggle)
	.append(settingsLabel)
	.append(settingsDiv);
	
	//add the page to the parent
	parent.appendChild(pageDiv);
			
	//populate the fields
	$('#swfUrlInput').val(customUri);
	$('#levelStringTextArea').val(levelString);
	$('#modeSelector').val(mode);
	
	this.updateSettingsDisplay();
	this.updateModeSelection();
};

/**
 * Imports content.levelString into the leveleditor. Will be called by an event later
 * @param levelString
 * @return
 */
View.prototype.EpigameNode.importLevelStringToEditor = function() {
	var levelString = this.content.levelString;
};

/**
 * Callback (swf->js) for when the leveleditor has been loaded.
 * @return
 */
function editorLoaded() {
	eventManager.fire('epigameImportLevelStringToEditor');
};

function receiveLevelData(value) {
	eventManager.fire("epigameUpdateLevelString", value);
};

// Call as3 function in identified Flash applet
function sendDataToGame(value) {
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.EpigameNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.EpigameNode.updateContent = function(){
	// update content object
	this.view.activeContent.setContent(this.content);
};

/**
 * Updates the content's level string to match that of what the user input
 */
View.prototype.EpigameNode.updateLevelString = function(levelStringIn){
	/* update content */
	if (levelStringIn != null) {
		$('#levelStringTextArea').val(levelStringIn);
	}
	
	// get the level content from the editor
	this.content.levelString = $('#levelStringTextArea').val();
	
	// fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the content's customUri to the user input
 */
View.prototype.EpigameNode.updateSwfUrl = function() {
	// update content
	this.content.customUri = $('#swfUrlInput').val();
	
	// fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates the source mode based on user input
 */
View.prototype.EpigameNode.updateSwfSource = function(){
	
	// fire source updated event, this will update the preview
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.EpigameNode.updateModeSelection = function() {
	var selectedMode = $('#modeSelector').val();
	var index = this.modes.indexOf(selectedMode);
	
	if (index == -1) {
		//Invalid, use default and overwrite the current field value
		index = 0;
		selectedMode = this.modes[index];
		$('#modeSelector').val(selectedMode);
	}
	
	var dataDiv = $('#levelStringDiv');
	var dataLabel = $('#levelStringLabel');
	var dataField = $('#levelStringTextArea');

	var	quizDiv = $('#quizStringDiv');
	var	quizLabel = $('#quizStringLabel');			
	
	switch (index) {
		//Use data value as mission string
		case 0://Mission
		case 4://Editor
			dataLabel.text("Mission Data String:");
			dataDiv.show();
			
			quizLabel.text("");
			quizDiv.hide();					
			break;
		//Use data value as adaptive index/identifier
		case 2://Adaptive Mission
			dataLabel.text("Warp Mission Number:");
			dataDiv.show();
			
			quizLabel.text("");
			quizDiv.hide();							
			break;
		case 3://Adaptive Quiz
			dataLabel.text("");
			dataDiv.hide();		
		
			quizLabel.text("Quiz Selector:");
			quizDiv.show();
			break;
		
		//Ignore data value
		default:
			dataLabel.text("");
			dataDiv.hide();
			
			quizLabel.text("");
			quizDiv.hide();								
			break;
	}
	
	this.content.mode = selectedMode;
	
	//Update the preview
	this.view.eventManager.fire('sourceUpdated');
};

View.prototype.EpigameNode.updateSettings = function() {
	if ($("#settingsToggle").prop("checked")) {
		this.content.settings = {
			showPerfScore: !Boolean($("#explScoreToggle").prop("checked")),
			showExplScore: Boolean($("#explScoreToggle").prop("checked")),
			showWarpScore: Boolean($("#warpScoreToggle").prop("checked")),
			showQuestions: Boolean($("#questionsToggle").prop("checked")),
			showNoQuestions: Boolean($("#noQuestionsToggle").prop("checked")),
			spatialInterface: Boolean($("#spatialToggle").prop("checked")),
			hideScoreScreen: Boolean($("#hideScoreScreenToggle").prop("checked")),
			globalizeReqs: Boolean($("#scoreReqsToggle").prop("checked")),
			noTime: Boolean($("#noTimeToggle").prop("checked")),
			testTime: Boolean($("#testTimeToggle").prop("checked")),
			questionTime: Boolean($("#questionTimeToggle").prop("checked")),
			testTimeVal: $("#testTimeText").val(),
			questionTimeVal: $("#questionTimeText").val(),
			rank1Val: $("#rank1Text").val(),
			rank2Val: $("#rank2Text").val(),
			rank3Val: $("#rank3Text").val(),
			rank4Val: $("#rank4Text").val(),
			rank5Val: $("#rank5Text").val(),
			forceRestriction: Boolean($("#forceRestrictionToggle").prop("checked")),
			hideQuizScore: Boolean($("#hideQuizScoreToggle").prop("checked")),
			disableEncyclopedia: Boolean($("#disableEncyclopediaToggle").prop("checked"))			
		};
	} else {
		delete this.content.settings;
	}
};

View.prototype.EpigameNode.updateSettingsDisplay = function() {
	if (this.content.settings) {
	
		//set default values if there are none
		if(!this.content.settings.rank1Val)
			this.content.settings.rank1Val = 0;			
		if(!this.content.settings.rank2Val)
			this.content.settings.rank2Val = 1200;
		if(!this.content.settings.rank3Val)
			this.content.settings.rank3Val = 3600;
		if(!this.content.settings.rank4Val)
			this.content.settings.rank4Val = 7200;
		if(!this.content.settings.rank5Val)
			this.content.settings.rank5Val = 11000;
			
	
		//Boolean cast ensures that false is passed if the result is undefined due to JSON tampering
		$("#explScoreToggle").prop("checked", Boolean(this.content.settings.showExplScore));
		$("#warpScoreToggle").prop("checked", Boolean(this.content.settings.showWarpScore));
		$("#scoreReqsToggle").prop("checked", Boolean(this.content.settings.globalizeReqs));
		$("#questionsToggle").prop("checked", Boolean(this.content.settings.showQuestions));
		$("#noQuestionsToggle").prop("checked", Boolean(this.content.settings.showNoQuestions));
		$("#spatialToggle").prop("checked", Boolean(this.content.settings.spatialInterface));
		$("#hideScoreScreenToggle").prop("checked", Boolean(this.content.settings.hideScoreScreen));		
		$("#noTimeToggle").prop("checked", Boolean(this.content.settings.noTime));
		$("#testTimeToggle").prop("checked", Boolean(this.content.settings.testTime));
		$("#questionTimeToggle").prop("checked", Boolean(this.content.settings.questionTime));
		$("#testTimeText").val(this.content.settings.testTimeVal);
		$("#questionTimeText").val(this.content.settings.questionTimeVal);
		$("#rank1Text").val(this.content.settings.rank1Val);
		$("#rank2Text").val(this.content.settings.rank2Val);
		$("#rank3Text").val(this.content.settings.rank3Val);
		$("#rank4Text").val(this.content.settings.rank4Val);
		$("#rank5Text").val(this.content.settings.rank5Val);
		$("#forceRestrictionToggle").prop("checked", Boolean(this.content.settings.forceRestriction));	
		$("#hideQuizScoreToggle").prop("checked", Boolean(this.content.settings.hideQuizScore));
		$("#disableEncyclopediaToggle").prop("checked", Boolean(this.content.settings.disableEncyclopedia));

		//Settings enabled, so check the checkbox and show UI
		$("#settingsToggle").prop("checked", true);
		$("#settingsDiv").show();
	} else { 
		//Settings disabled, so uncheck the checkbox and hide UI
		$("#settingsToggle").prop("checked", false);
		$("#settingsDiv").hide();
	}
};

View.prototype.EpigameNode.toggleSettings = function() {

	console.log("looking to apply default");

	if ($("#settingsToggle").prop("checked")) {
		//Create default settings
		this.content.settings = {
			showPerfScore: true,
			showExplScore: false,
			showWarpScore: false,
			showQuestions: false,
			showNoQuestions: false,
			spatialInterface: false,
			hideScoreScreen: false,
			globalizeReqs: false,
			noTime: true,
			testTime: false,
			questionTime: false,
			testTimeVal: 30,
			questionTimeVal: 30,
			rank1Val: 0,
			rank2Val: 1200,
			rank3Val: 3600,
			rank4Val: 7200,
			rank5Val: 11000,
			forceRestriction: false,
			hideQuizScore: false,
			disableEncyclopedia: false
		};
		
		console.log("applying ui settings");
		
		//Apply defaults to UI
		$("#explScoreToggle").prop("checked", this.content.settings.showExplScore);
		$("#warpScoreToggle").prop("checked", this.content.settings.showWarpScore);
		$("#scoreReqsToggle").prop("checked", this.content.settings.globalizeReqs);
		$("#questionsToggle").prop("checked", this.content.settings.showQuestions);
		$("#noQuestionsToggle").prop("checked", this.content.settings.showNoQuestions);
		$("#spatialToggle").prop("checked", this.content.settings.spatialToggle);		
		$("#hideScoreScreenToggle").prop("checked", this.content.settings.spatialToggle);				
		$("#noTimeToggle").prop("checked", this.content.settings.noTime);
		$("#testTimeToggle").prop("checked", this.content.settings.testTime);
		$("#questionTimeToggle").prop("checked", this.content.settings.questionTime);
		$("#testTimeText").val(this.content.settings.testTimeVal);
		$("#questionTimeText").val(this.content.settings.questionTimeVal);
		$("#rank1Text").val(this.content.settings.rank1Val);
		$("#rank2Text").val(this.content.settings.rank2Val);
		$("#rank3Text").val(this.content.settings.rank3Val);
		$("#rank4Text").val(this.content.settings.rank4Val);
		$("#rank5Text").val(this.content.settings.rank5Val);
		$("#forceRestrictionToggle").val(this.content.settings.forceRestrictionToggle);
		$("#hideQuizScoreToggle").val(this.content.settings.hideQuizScoreToggle);
		$("#disableEncyclopediaToggle").val(this.content.settings.disableEncyclopediaToggle);
		
		//Show UI
		$("#settingsDiv").show();
	} else {
		//Hide UI
		$("#settingsDiv").hide();
		
		//Destroy settings so other steps don't try to use them
		delete this.content.settings;
	}
};

/**
 * Open asset editor dialog and allows user to choose the swf to use for this step
 */
View.prototype.EpigameNode.browseFlashAssets = function() {
	var callback = function(field_name, url, type, win){
		url = 'assets/' + url;
		document.getElementById(field_name).value = url;
		
		//fire swfUrlChanged event
		this.eventManager.fire('epigameSwfUrlChanged');
	};
	var params = {};
	params.field_name = 'swfUrlInput';
	params.type = 'flash';
	params.buttonText = 'Please select a file from the list.';
	params.extensions = ['swf', 'flv'];
	params.win = null;
	params.callback = callback;
	eventManager.fire('viewAssets',params);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/epigame/authorview_epigame.js');
};