// TODO: add option to make starting labels editable or not

/**
 * @constructor
 * @param node
 * @returns
 */
function ANNOTATOR(node) {
	this.node = node;
	this.view = node.view;
	
	// insert loading i18n text
	$('#overlay_content > div').html(this.view.getI18NString('annotator_loading','SVGDrawNode'));
	
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
	
	this.initTries = 0;
	this.svgCanvas = null;
	this.height = 600,
	this.width = 450,
	//this.teacherAnnotation = "";
	this.backgroundDefault = ""; // svg string to hold background svg image
	this.instructions = ""; // string to hold prompt/instructions text
	this.instructionsModal;
	this.labelTotal = 0; // var to hold total number of snapshots created
	//this.lz77 = new LZ77(); // lz77 compression object
	// json object to hold updated student data for the node
	this.studentData = {
		"svgString": "",
		"explanation": "",
		"labels": [],
		"total": 0
	};
	
	svgEditor.changed = false, // boolean to specify whether student data has changed and should be saved on exit
	svgEditor.loadedWISE = false; // boolean to specify whether WISE components have finished loading
	
	this.init(node.getContent().getContentUrl());
	
	if(this.content.autoScoring != null) {
		if(this.content.autoScoring.autoScoringCriteria == null || this.content.autoScoring.autoScoringCriteria == '') {
			//auto scoring criteria is null or empty string so we will hide the div that contains the 'Check Work' button
			$('#autoGradeWorkButtonDiv').hide();
		} else {
			//show the hide work button
			$('#autoGradeWorkButtonDiv').show();
		}		
	}
};

ANNOTATOR.prototype.init = function(jsonURL) {
	var enableStep = true;
	var message = '';
	var workToImport = [];
	
	//process the tag maps if we are not in authoring mode
	if(this.view.authoringMode == null || !this.view.authoringMode) {
		//get the tag map results
		var tagMapResults = this.processTagMaps();
		
		//get the result values
		enableStep = tagMapResults.enableStep;
		message = tagMapResults.message;
		workToImport = tagMapResults.workToImport;
	}
	
	if(workToImport != null) {
		this.workToImport = workToImport;		
	}
	
	this.loadModules(jsonURL, this);  // process backgrounds, stamps, snapshots, descriptions, hidden tool options
};


ANNOTATOR.prototype.loadModules = function(jsonfilename, context) {
	var view = this.node.view;
	
	var myDataService = new VleDS(view);
 	// or var myDataService = new DSSService(read,write);
	context.setDataService(myDataService);
	
	var data = context.content;
	
	if(data.labels_default && data.labels_default.length > 0){
		context.labelsDefault = data.labels_default;
	}
	if(data.labels_max){
		var max = parseInt(data.labels_max,10);
		context.labelsMax = (max !== 'NaN') ? max : 0;
	}
	if(data.labels_min){
		var min = parseInt(data.labels_min,10);
		context.labelsMin = (min !== 'NaN') ? min : 0;
	}
	if(data.prompt){
		context.instructions = data.prompt;
	}
	if(data.colorDefault){
		context.colorDefault = data.colorDefault;
	}
	if(data.enableStudentTextArea){
		context.enableStudentTextArea = data.enableStudentTextArea;
	}
	if(data.textAreaInstructions){
		context.textAreaInstructions = data.textAreaInstructions;
	}
	if(data.textAreaButtonText){
		context.textAreaButtonText = data.textAreaButtonText;
	}
	if(data.enableAutoScoring){
		context.enableAutoScoring = data.enableAutoScoring;
	}
	
	if(data.backgroundImg && view.utils.isNonWSString(data.backgroundImg)){
		var bgUrl = data.backgroundImg;
		var xPos = 1, yPos = 1;
		view.utils.getImageDimensions(data.backgroundImg, function(dimensions){
			var height = dimensions.height,
				width = dimensions.width,
				ratio = height/width,
				maxH = 600,
				maxW = 600;
			
			if(height > width || height === width){
				if(height > maxH){
					height = maxH;
					width = height/ratio;
				}
			} else {
				if(width > maxW){
					width = maxW;
					height = width*ratio;
				}
			}
			
			var h = context.height = height + 50,
				w = context.width = width + 50,
				rightX = w-width-1,
				centerX = (rightX+1)/2,
				bottomY = h-height-1,
				middleY = (bottomY+1)/2;
			xPos = centerX, yPos = middleY;
			context.backgroundDefault = '<svg width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" ' +
				'xmlns:xlink="http://www.w3.org/1999/xlink"><g><title>teacher</title>' +
				'<image x="' + xPos + '" y="' + yPos + '" width="' + width + '" height="' + height + '" xlink:href="' + bgUrl + '" /></g></svg>';
			context.load();   // load preview data, if any, or load default background
		});
	} else {
		context.load();   // load preview data, if any, or load default background
	}
};


ANNOTATOR.prototype.setDataService = function(dataService) {
	// register VLE Data Service to the annotator object so that
	// it can save back to vle's persistence mechanism.
	// add a function to annotator that will save the data to vle
	this.dataService=dataService;
};


ANNOTATOR.prototype.loadCallback = function(studentWorkJSON, context, noInit) {
		var annotationValue;
		// set default blank canvas
		var defaultSvgString = '<svg width="' + context.width + '" height="' + context.height + '" xmlns="http://www.w3.org/2000/svg">' +
			'<!-- Created with SVG-edit - http://svg-edit.googlecode.com/ --><g><title>student</title></g></svg>';
		
		// check for previous work and load it
		var svgString;
		if (context.backgroundDefault){ // if no previous work and no default labels, load default background drawing
			svgString = context.backgroundDefault.replace("</svg>", "<g><title>student</title></g></svg>"); // add blank student layer
			svgEditor.loadFromString(svgString);
		} else { // create blank student layer
			svgEditor.loadFromString(defaultSvgString);
		}
		
		if(noInit) {
			var content = {
				"labels": studentWorkJSON.labels,
				"total": studentWorkJSON.labelTotal
			};
			svgEditor.ext_labels.content(content);
			svgEditor.resizeCanvas();
			$('#workarea').css('opacity', '1');
			return;
		}
		
		context.initDisplay(studentWorkJSON,context); // initiate labels and description
};

/**
 * Save the student work
 * @param isExit
 * @param forceSave save even if the student has not changed their work. this is
 * used when the student click 'Check Score'
 */
ANNOTATOR.prototype.saveToVLE = function(isExit, forceSave) {
	if(svgEditor.changed || forceSave){
		svgEditor.canvas.leaveContext();
		svgEditor.canvas.clearSelection();
		$('#workarea').css('opacity', 0);
		svgCanvas.setResolution('fit','fit'); // set canvas dimensions to fit all label content
		this.studentData.svgString = svgCanvas.getSvgString();
		this.studentData.explanation = $('#explanationInput').val();
		this.studentData.labels = svgEditor.ext_labels.content().labels;
		this.studentData.total = svgEditor.ext_labels.total();
		if(isExit){
			svgEditor.loadedWISE = false;
		} else {
			$('#save').prop('disabled', true);
			this.loadCallback(this.studentData, this, true);
		}
		this.save();
	}
};

/**
 * Save the student work
 */
ANNOTATOR.prototype.save = function() {
	//make a copy of the student data object
	var studentDataString = JSON.stringify(this.studentData);
	var studentData = JSON.parse(studentDataString);
	
	var data = studentData;
	
	/* compress nodeState data */
	//var compressedData = "--lz77--" + this.lz77.compress(JSON.stringify(data));
	var autoScore = this.autoScore;
	var maxAutoScore = this.maxAutoScore;
	var autoFeedback = this.autoFeedback;
	var autoFeedbackKey = this.autoFeedbackKey;
	var checkWork = this.checkWork;
	var scoringCriteriaResults = this.scoringCriteriaResults;

	//create a new annotatorstate
	//var annotatorState = new ANNOTATORSTATE(compressedData, null, autoScore, autoFeedback, autoFeedbackKey, checkWork, maxAutoScore);
	var annotatorState = new ANNOTATORSTATE(data, null, autoScore, autoFeedback, autoFeedbackKey, checkWork, maxAutoScore, scoringCriteriaResults);
	
	//fire the event to push this state to the global view.states object
	this.view.pushStudentWork(this.node.id, annotatorState);
	
	//push the state object into this object's own copy of states
	this.states.push(annotatorState);	
	
    this.data = data;
    
    //clear out the auto score and auto feedback
    this.autoScore = null;
    this.maxAutoScore = null;
	this.autoFeedback = null;
	this.autoFeedbackKey = null;
	this.checkWork = null;
	this.scoringCriteriaResults = null;
	
	svgEditor.changed = false;
};

ANNOTATOR.prototype.load = function() {
	this.dataService.load(this, this.loadCallback);	
};

// populate instructions, description/annotation text, and labels
ANNOTATOR.prototype.initDisplay = function(data,context) {
	var ready = true,
		node = this.node,
		view = this.view,
		wiseExtensions = ['ext-wise.js', 'ext-prompt.js', 'ext-labels.js', 'ext-description.js', 'ext-importstudentasset.js', 'ext-clearlayer.js'];
	var e = node.extensions.length-1;
	for(; e>-1; --e){
		var ext = node.extensions[e];
		if($.inArray(ext, wiseExtensions) > -1) {
			var prop = ext.replace(/\.js$/,'').replace(/^ext-/,'ext_');
			if(svgEditor.hasOwnProperty(prop)){
				if(!svgEditor[prop].isLoaded()){
					ready = false;
					break;
				}
			} else {
				ready = false;
				break;
			}
		}
	}
	
	if(ready){
		var labelsExt = svgEditor.ext_labels,
			importExt = svgEditor.ext_importstudentasset;
		
		bootbox.hideAll(); // hide all dialogs
		
		function showPrompt(){
			context.instructionsModal = bootbox.alert({
				message: context.instructions,
				title: view.getI18NString('prompt_link','SVGDrawNode')
			});
		}
		
		function checkMinLabels(){
			if(labelsExt.content().labels.length >= labelsExt.min()){
				/*
				 * the user has the required minimum number of labels so we will
				 * allow them to open the explanation textarea
				 */
				
				//enable the 'Ready to Explain' button
				$('#explain').prop('disabled', false);
			} else {
				/*
				 * the user does not have the required minimum number of labels 
				 * so we will not show the explanation text area
				 */
				
				//disable the 'Ready to Explain' button
				$('#explain').prop('disabled', true);
				
				//hide the explanation area
				$('#explanation').slideUp('fast');
				
				//make the explanation textarea lose focus
				$('#explanationInput').blur();
			}
			
			if(context.enableAutoScoring) {
				//auto scoring is enabled
				
				if(labelsExt.content().labels.length > 0) {
					//the student has at least one label so we will enable the check score button
					$('#check_score').prop('disabled', false);
				} else {
					//the student does not have any labels so we will disable the check score button
					$('#check_score').prop('disabled', true);
				}				
			}
		}
		
		// insert i18n text elements
		if(importExt){
			$('#tool_import_student_asset').attr('title', view.getI18NString('importStudentAsset_button','SVGDrawNode'));
			// TODO: customize import student asset tool for annotator
		}
		/*if(clearExt){
			$('#tool_erase').attr('title', view.getI18NString('eraseDrawing_button','SVGDrawNode'));
			$('#revert_confirm > .ui-button-text').html(view.getI18NString('OK','SVGDrawNode'));
			$('#revert_cancel > .ui-button-text').html(view.getI18NString('Cancel','SVGDrawNode'));
			$('#revert_dialog').attr('title', view.getI18NString('eraseDrawing_dialog_title','SVGDrawNode'));
			$('#revert_warning').html(view.getI18NStringWithParams('eraseDrawing_dialog_warning','SVGDrawNode'));
			$('#revert_instructions').html(view.getI18NString('eraseDrawing_dialog_instructions','SVGDrawNode'));
		}*/
		if(labelsExt){
			$('#newLabel > .button-text').text(view.getI18NString('annotator_newLabel','SVGDrawNode'));
			$('#deleteLabel > .button-text').text(view.getI18NString('annotator_deleteLabel','SVGDrawNode'));
			$('#save > .button-text').text(view.getI18NString('annotator_save','SVGDrawNode'));
			$('#cancelNew').text(view.getI18NString('Cancel','SVGDrawNode'));
			$('#newLabelInstructions > span').text(view.getI18NString('annotator_newLabel_instructions','SVGDrawNode'));
			if(Modernizr.touch){
				$('#editLabelInstructions').text(view.getI18NString('annotator_editLabel_instructions_touch','SVGDrawNode'));
			} else {
				$('#editLabelInstructions').text(view.getI18NString('annotator_editLabel_instructions','SVGDrawNode'));
			}
		
			var max = context.labelsMax ? context.labelsMax : 10,
				min = context.labelsMin ? context.labelsMin : 0,
				color = context.colorDefault ? context.colorDefault : 'FF0000';
			labelsExt.max(max);
			labelsExt.min(min);
			labelsExt.color(color);
			// TODO: set text color automatically or allow authors to specify
			if(color === 'FFFF00'){
				labelsExt.textColor('000000');
			} else {
				labelsExt.textColor('FFFFFF')
			}
			if(data && data.labels && data.labels.length){
				// load existing snapshots
				labelsExt.content(data);
			} else if(context.labelsDefault && context.labelsDefault.length){
				var content = {
					"labels": context.labelsDefault,
					"total": context.labelsDefault.length
				};
				// load default labels
				labelsExt.content(content);
			}
			context.toggleInstructions();
			
			// bind new label and cancel buttons click events
			$('#newLabel').off('click').on('click', function(){
				if(!labelsExt.maxReached(true)){
					context.setLabelMode(true);
				}
			});
			
			$('#cancelNew').off('click').on('click', function(){
				context.setLabelMode(false);
			});
			
			// setup content changed listener functions
			labelsExt.changed = function(){
				context.setLabelMode(false);
				svgEditor.changed = true;
				$('#save').prop('disabled', false);
				if(labelsExt.maxReached()){
					$('#newLabel').addClass('disabled').css('pointer-events', 'auto');
				} else {
					$('#newLabel').removeClass('disabled');
				}
				context.toggleInstructions();
				checkMinLabels();
			}
		}
		
		// initiate student text area
		if(context.enableStudentTextArea) {
			var btnText = context.textAreaButtonText ? context.textAreaButtonText : view.getI18NString('annotator_explain','SVGDrawNode'),
				instructionsText = context.textAreaInstructions ? context.textAreaInstructions : view.getI18NString('annotator_explain_instructions','SVGDrawNode'),
				explanation = data.explanation,
				hasExp = view.utils.isNonWSString(explanation),
				placeholder = view.getI18NString('annotator_explain_placeholder','SVGDrawNode');
			$('#explain .button-text').text(btnText);
			$('#explain').show();
			$('#explanation_instructions').text(instructionsText);
			if(hasExp) { $('#explanationInput').val(explanation); }
			$('#explanationInput').attr('placeholder', placeholder);
			
			// bind explain click action
			$('#explain').off('click').on('click', function(e){
				$('#explanation').slideToggle('fast', function(){
					$('#explanationInput').focus();
				});
			});
			
			$('#explanationInput').off('focus').on('focus', function(e){
				$(this).data('changed', svgEditor.changed);
			});
			
			$('#explanationInput').off('keyup').on('keyup', function(e){
				var isNewExp = ($(this).val() !== context.studentData.explanation);
				if(isNewExp){
					svgEditor.changed = true;
					$('#save').prop('disabled', false);
				} else {
					if(!$(this).data('changed')) {
						svgEditor.changed = false;
						$('#save').prop('disabled', true);
					}
				}
			});
			
			$('#closeExp').off('click').on('click', function(){
				$('#explain').prop('disabled', false);
				$('#explanation').slideUp('fast');
			});
			
			checkMinLabels();
		} else {
			$('#explain').hide();
		}
		
		if(context.enableAutoScoring) {
			//auto scoring is enabled so we will enable the 'Check Score' button
			$('#check_score .button-text').text('Check Score');
			$('#check_score').off('click').on('click', {thisAnnotator:this}, function(e) {
				var thisAnnotator = e.data.thisAnnotator;
				thisAnnotator.checkScore();
			});
		} else {
			//auto scoring is not enabled so we will not show the 'Check Score' button
			$('#check_score').hide();
		}
		
		// bind save click action
		$('#save').off('click').on('click', function(e){
			if(context.enableStudentTextArea) {
				$('#explanation').slideUp('fast');
				$('#explanationInput').blur();
				$('#explain').prop('disabled', false);
			}
			// save to VLE
			context.saveToVLE();
		});
		
		// initiate prompt/instructions
		if(view.utils.isNonWSString(context.instructions)){
			$('#prompt > .button-text').text(view.getI18NString('prompt_link','SVGDrawNode')).show();
			$('#prompt').off('click').on('click', function(e){
				showPrompt();
			});
			
			if(!data){
				// if student hasn't saved any work, show prompt
				showPrompt();
			}
		} else {
			$('#prompt').hide();
		}
		
		setTimeout(function(){
			//svgCanvas.undoMgr.resetUndoStack(); // reset undo stack to prevent users from deleting stored starting image
			//$("#tool_undo").addClass("tool_button_disabled").addClass("disabled");
			this.node.view.eventManager.fire('contentRenderCompleted', this.node.id, this.node);
			svgEditor.resizeCanvas();
			$('#loading_overlay').fadeOut();
			svgEditor.loadedWISE = true;
		},500);
	}
	else {
		setTimeout(function(){
			++context.initTries;
			if(context.initTries<300){
				context.initDisplay(data,context);
			} else {
				//var failed = [];
				context.view.notificationManager.notify("Error: Unable to start annotator because svg-edit extensions failed to load.",1);
			}
		},100);
	}
};

ANNOTATOR.prototype.toggleInstructions = function(){
	if(svgEditor.ext_labels.content().labels.length){
		$('#editLabelInstructions').css('display','inline-block');
	} else {
		$('#editLabelInstructions').hide();
	}
};


ANNOTATOR.prototype.setLabelMode = function(enable){
	if(enable){
		svgEditor.ext_labels.setLabelMode();
		$('#newLabel').hide();
		$('#newLabelInstructions').show();
		$('#editLabelInstructions').hide();
	} else {
		//svgCanvas.setMode('ext-panning');
		svgCanvas.setMode('select');
		$('#newLabelInstructions').hide();
		$('#newLabel').show();
		$('#workarea').css('cursor','normal');
		this.toggleInstructions();
	}
};


/**
 * Auto grade the drawing
 * TODO: update for annotator!
 */
ANNOTATOR.prototype.autoGradeWork = function() {
	// check to see if workgroup has made any changes
	if(!svgEditor.changed && !this.node.studentWork.length){
		// no work has been done, alert user
		alert(this.view.getI18NString('autoGrade_noWork', 'AnnotatorNode'));
		return;
	}
	
	//create the object that will auto grade the drawing
	var scorer = new DrawScorer();
	
	if(this.content.autoScoring != null) {
		
		//get the max number of times the student can check work
		var maxCheckWorkChances = this.getMaxCheckWorkChances();
		
		//get the number of check work chances the student has used
		var checkWorkChancesUsed = this.getCheckWorkChancesUsed();
		
		if(maxCheckWorkChances == null || maxCheckWorkChances == "" || checkWorkChancesUsed < maxCheckWorkChances) {
			/*
			 * there is no max check work chances or the student still has 
			 * check work chances left so we will score the work
			 */
			
			var checkWork = false;
			var chancesLeft = null;
			
			if(maxCheckWorkChances == null || maxCheckWorkChances == "") {
				//max check work chances has not been set so we will check the work
				checkWork = true;
			} else {
				//we will notify the student of how many check work chances they have left
				
				//get the number of check work chances left
				chancesLeft = maxCheckWorkChances - checkWorkChancesUsed;
				
				//get the submit confirmation message if any
				var submitConfirmationMessage = this.content.autoScoring.submitConfirmationMessage;
				
				if(submitConfirmationMessage != null && submitConfirmationMessage != '') {
					//the submit confirmation message was provided so we will use it
					
					//replace # with the actual number of submit chances left
					submitConfirmationMessage = submitConfirmationMessage.replace(/#/g, chancesLeft);
					
					//ask the student if they are sure they want to submit their work now
					checkWork = confirm(submitConfirmationMessage);
				} else {
					var message = this.view.getI18NStringWithParams('autoGrade_confirm',[chancesLeft],'AnnotatorNode');
					
					//ask the student if they are sure they want to check the work now
					checkWork = confirm(message);
				}
			}
			
			if(checkWork) {
				//we will score the work
				
				//set the grading specification depending on the criteria
				if(this.content.autoScoring.autoScoringCriteria == 'methane') {
					scorer.parseXMLSpec("autograde/MethaneSpec.xml");
				} else if(this.content.autoScoring.autoScoringCriteria == 'ethane') {
					scorer.parseXMLSpec("autograde/EthaneSpec.xml");
				} else {
					//error
					return;
				}
				
				if (this.teacherAnnotation != "") {
					svgStringToSave = svgStringToSave.replace(this.teacherAnnotation, "");
				}
				this.studentData.svgString = svgCanvas.getSvgString();
				this.studentData.description = svgEditor.ext_description.content();
				var snaps = svgEditor.ext_snapshots.content(),
					snapDescriptions = this.snapDescriptions;
				// add descriptions to each snapshot
				for(var i=0; i<snaps.length; i++){
					var description = '',
						id = snaps[i].id;
					if(snapDescriptions.hasOwnProperty(id)){
						description = snapDescriptions[id];
					}
					snaps[i].description = description;
				}
				this.studentData.snapshots = snaps;
				this.studentData.snapTotal = svgEditor.ext_snapshots.total();
				this.studentData.selected = svgEditor.ext_snapshots.open();
				
				//score the drawing
				scorer.scoreDrawing(this.studentData);
				
				//get the score
				var scoreObject = this.studentData.rubricScore,
					score = null,
					key = null,
					max = 5; // TODO: get the max score from auto scoring config in the future
				
				if(scoreObject != null) {
					score = scoreObject.score;
					key = scoreObject.key;
				}
				
				//get the feedback
				var feedback = this.getFeedbackByKey(key);
				
				var message = '';
				
				//display the score if we need to
				if(this.content.autoScoring.autoScoringDisplayScoreToStudent) {
					message += this.view.getI18NStringWithParams('autoGrade_result',[score, max],'AnnotatorNode');
				}
				
				//display the feedback if we need to
				if(this.content.autoScoring.autoScoringDisplayFeedbackToStudent) {
					if(message != '') {
						//add line breaks if we are displaying the score
						message += '\n\n';
					}
					
					message += feedback;
				}
				
				//set the score and feedback so we can access them later when we save the annotatorstate
				this.autoScore = score;
				this.maxAutoScore = max;
				this.autoFeedback = message;
				this.autoFeedbackKey = key;
				this.checkWork = true;
				
				//save the student work with the score and feedback
				this.saveToVLE();
				
				if(this.content.autoScoring.autoScoringDoNotDisplayFeedbackToStudentOnLastChance && chancesLeft == 1) {
					alert(this.view.getI18NString('autoGrade_complete','SVGDrawNode'));
				} else {
					if(this.content.autoScoring.autoScoringDisplayScoreToStudent || this.content.autoScoring.autoScoringDisplayFeedbackToStudent) {
						//we need to show the score of text feedback to the student
						
						//show the Feedback button at the top right of the vle next to the previous and next arrows
						this.view.displayNodeAnnotation(this.node.id);
						
						//display the feedback in a popup dialog
						eventManager.fire("showNodeAnnotations",[this.node.id]);
					} else {
						//we are not going to show the score or the text feedback to the student
						alert(this.view.getI18NString('autoGrade_submissionComplete', 'SVGDrawNode'));
					}
				}
			}
		} else {
			//the student does not have anymore check work chances
			alert(this.view.getI18NString('autoGrade_complete','SVGDrawNode'));
		}
	}
};

/**
 * Get the feedback for the given score
 * @param score the score we want feedback for
 */
ANNOTATOR.prototype.getFeedbackByScore = function(score) {
	var feedback = '';
	
	if(this.content.autoScoring != null) {
		if(this.content.autoScoring.autoScoringFeedback != null) {
			
			//loop through all the feedback objects
			for(var x=0; x<this.content.autoScoring.autoScoringFeedback.length; x++) {
				//get a feedback object
				var autoScoringFeedbackObject = this.content.autoScoring.autoScoringFeedback[x];
				
				if(autoScoringFeedbackObject != null) {
					//compare the score
					if(score == autoScoringFeedbackObject.score) {
						//we found the score we want so we will get the feedback 
						feedback = autoScoringFeedbackObject.feedback;
						
						//break out of the for loop
						break;
					}
				}
			}
		}		
	}
	
	return feedback;
};

/**
 * Get the feedback for the given key
 * @param key the key we want feedback for
 */
ANNOTATOR.prototype.getFeedbackByKey = function(key) {
	var feedback = '';
	
	if(this.content.autoScoring != null) {
		if(this.content.autoScoring.autoScoringFeedback != null) {
			
			//loop through all the feedback objects
			for(var x=0; x<this.content.autoScoring.autoScoringFeedback.length; x++) {
				//get a feedback object
				var autoScoringFeedbackObject = this.content.autoScoring.autoScoringFeedback[x];
				
				if(autoScoringFeedbackObject != null) {
					//compare the key
					if(key == autoScoringFeedbackObject.key) {
						//we found the key we want so we will get the feedback 
						feedback = autoScoringFeedbackObject.feedback;
						
						//break out of the for loop
						break;
					}
				}
			}
		}		
	}
	
	return feedback;
};

/**
 * Get the max number of check work chances
 */
ANNOTATOR.prototype.getMaxCheckWorkChances = function() {
	var checkWorkChances = null;
	
	if(this.content.autoScoring != null) {
		if(this.content.autoScoring.autoScoringCheckWorkChances != null) {
			checkWorkChances = this.content.autoScoring.autoScoringCheckWorkChances;
		}
	}
	
	return checkWorkChances;
};

/**
 * Get the number of times the student has checked their work for this step
 */
ANNOTATOR.prototype.getCheckWorkChancesUsed = function() {
	var checkWorkChancesUsed = 0;
	
	if(this.states != null) {
		//loop through all the node states for this step
		for(var x=0; x<this.states.length; x++) {
			//get a node state
			var state = this.states[x];
			
			if(state.checkWork) {
				/*
				 * the checkWork value is set to true so this is work that 
				 * the student had auto graded and received feedback on
				 */
				checkWorkChancesUsed++;
			}
		}
	}
	
	return checkWorkChancesUsed;
};

// VLE data service setup
// This happens when the page is loaded
(function() {
	  VleDS = function(_vle){
	    this.data = "";
	    this.annotations = "";
	    this.vle = _vle;
	    this.vleNode=_vle.getCurrentNode();
	    //this.lz77 = new LZ77();
	  };

	  VleDS.prototype = {
	    save: function(_data) {
    		var data = _data;
    		/* compress nodeState data */
			//data = "--lz77--" + this.lz77.compress($.stringify(_data));
			this.vle.saveState(data,this.vleNode);
	        this.data = data;
	    },

	    load: function(context,callback) {
	    	//this.data = this.vle.getLatestStateForCurrentNode();
			var data = this.vle.getLatestStateForCurrentNode();
			
			if((data == null || data == '') && context.workToImport != null && context.workToImport.length > 0) {
				/*
				 * the student has not done any work for this step yet and
				 * there is work to import so we will use the work to import
				 */
				var nodeState = context.workToImport[context.workToImport.length - 1];
				
				if(nodeState != null) {
					data = nodeState.data;
				}
			}
			
			/* decompress nodeState data */
			/*if(typeof data == "string"){ // check whether data has been previously compressed (for backwards compatibilty)
				if (data.match(/^--lz77--/)) {
					//alert('match');
					data = data.replace(/^--lz77--/,"");
					data = $.parseJSON(this.lz77.decompress(data));
				}
			}*/
			
			this.data = data;
			callback(this.data,context);
	    },
	    
	    //loadAnnotations: function(context,callback) {
	    	//this.annotations = this.vle.get
	    //},
	    toString: function() {
	      return "VLE Data Service (" + this.vle + ")";
	    }
	  };

})();

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains three fields
 * enableStep
 * message
 * workToImport
 */
ANNOTATOR.prototype.processTagMaps = function() {
	var enableStep = true;
	var message = '';
	var workToImport = [];
	
	//the tag maps
	var tagMaps = this.node.tagMaps;
	
	//check if there are any tag maps
	if(tagMaps != null) {
		
		//loop through all the tag maps
		for(var x=0; x<tagMaps.length; x++) {
			
			//get a tag map
			var tagMapObject = tagMaps[x];
			
			if(tagMapObject != null) {
				//get the variables for the tag map
				var tagName = tagMapObject.tagName;
				var functionName = tagMapObject.functionName;
				var functionArgs = tagMapObject.functionArgs;
				
				if(functionName == "importWork") {
					//get the work to import
					workToImport = this.node.getWorkToImport(tagName, functionArgs);
				} else if(functionName == "showPreviousWork") {
					//show the previous work in the previousWorkDiv
					this.node.showPreviousWork($('#previousWorkDiv'), tagName, functionArgs);
				} else if(functionName == "checkCompleted") {
					//we will check that all the steps that are tagged have been completed
					
					//get the result of the check
					var result = this.node.checkCompleted(tagName, functionArgs);
					enableStep = enableStep && result.pass;
					
					if(message == '') {
						message += result.message;
					} else {
						//message is not an empty string so we will add a new line for formatting
						message += '<br>' + result.message;
					}
				}
			}
		}
	}
	
	if(message != '') {
		//message is not an empty string so we will add a new line for formatting
		message += '<br>';
	}
	
	//put the variables in an object so we can return multiple variables
	var returnObject = {
		enableStep:enableStep,
		message:message,
		workToImport:workToImport
	};
	
	return returnObject;
};

/**
 * Get the authored regions from the step content
 * @return an array of regions or null if it does not exist
 * in the content
 */
ANNOTATOR.prototype.getRegions = function() {
	var regions = this.getAutoScoringField('regions');
	return regions;
};

/**
 * Get the authored labels from the step content
 * @return an array of labels or null if it does not exist
 * in the content
 */
ANNOTATOR.prototype.getLabels = function() {
	var labels = this.getAutoScoringField('labels');
	return labels;
};

/**
 * Get the authored mappings from the step content
 * @return an array of mappings or null if it does not exist
 * in the content
 */
ANNOTATOR.prototype.getMappings = function() {
	var mappings = this.getAutoScoringField('mappings');
	return mappings;
};

/**
 * Get the authored scoring criteria from the step content
 * @return an array of scoring criteria or null if it does not exist
 * in the content
 */
ANNOTATOR.prototype.getScoringCriteria = function() {
	var scoringCriteria = this.getAutoScoringField('scoringCriteria');
	return scoringCriteria;
};

/**
 * Get the authored auto scoring field value
 * @param fieldName the field name inside the autoScoring object in the content
 * @return the field value
 */
ANNOTATOR.prototype.getAutoScoringField = function(fieldName) {
	var fieldValue = null;
	
	if(fieldName != null && fieldName != '') {
		//get the step content
		var content = this.content;
		
		if(content != null) {
			//get the auto scoring object
			var autoScoring = content.autoScoring;
			
			if(autoScoring != null) {
				//get the auto scoring field
				fieldValue = autoScoring[fieldName];
			}
		}
	}
	
	return fieldValue;
};


/**
 * Check the student work and give them a score and feedback
 */
ANNOTATOR.prototype.checkScore = function() {
	//get the number of check work chances the student has already used
	var checkWorkChancesUsed = this.getCheckWorkChancesUsed();
	
	//get the max number of check work chances the student is allowed to use
	var maxCheckWorkChances = this.getMaxCheckWorkChances();
	
	var confirmMessage = '';
	var numCheckWorkChancesLeft = null;
	
	if(maxCheckWorkChances == null || maxCheckWorkChances == '') {
		//the student has unlimited check work chances
		confirmMessage = 'Are you sure you want to check your work?';
	} else {
		//the student has a limited number of check work chances
		numCheckWorkChancesLeft = maxCheckWorkChances - checkWorkChancesUsed;
		
		if(numCheckWorkChancesLeft == 1) {
			//the student has one check work chance left
			confirmMessage = 'You have ' + numCheckWorkChancesLeft + ' more chance to check your work. Are you sure you want to check your work?';
		} else if(numCheckWorkChancesLeft > 1) {
			//the student has multiple check work chances left
			confirmMessage = 'You have ' + numCheckWorkChancesLeft + ' more chances to check your work. Are you sure you want to check your work?';
		} else {
			//the student does not have any more check work chances
			alert(this.view.getI18NString('autoGrade_complete','SVGDrawNode'));
			return;
		}
	}
	
	//ask the student if they are sure they want to check their work
	var confirmResult = confirm(confirmMessage);
	
	if(confirmResult) {
		//the student is sure they want to check their work
		
		//get the labels the student created
		var studentLabels = svgEditor.ext_labels.content().labels;
		
		//get the authored values from the step content
		var regions = this.getRegions();
		var labels = this.getLabels();
		var mappings = this.getMappings();
		var scoringCriteria = this.getScoringCriteria();
		
		/*
		 * determine which authored labels the student labels match.
		 * the label ids will be injected into the student labels.
		 */
		this.matchStudentLabelsToAuthoredLabels(studentLabels, labels);
		
		/*
		 * determine which regions the student labels are in.
		 * the region ids will be injected into the student labels.
		 */
		this.matchStudentLabelsToRegions(studentLabels, regions);
		
		//generate the label to region mappings from the student work
		var studentMappings = this.generateLabelToRegionMappings(studentLabels);
		
		//calculate which mappings were satisfied
		var mappingResults = this.calculateSatisfiedMappings(mappings, studentMappings);
		
		//calculate the score and feedback from the mapping results
		var results = this.calculateScore(scoringCriteria, mappingResults);
		
		//get the score the student achieved
		var score = results.score;
		
		//get the text feedback to show the student
		var feedback = results.feedback;
		
		//get the array of scoring criteria results
		var scoringCriteriaResults = results.scoringCriteriaResults;
		
		//get the max score
		var maxScore = this.getMaxScore(scoringCriteria);
		
		//save the results into global variables which are read when the student work is saved
		this.autoScore = score;
		this.maxAutoScore = maxScore;
		this.autoFeedback = feedback;
		this.autoFeedbackKey = null;
		this.checkWork = true;
		this.scoringCriteriaResults = scoringCriteriaResults;
		
		var isExit = false;
		var forceSave = true;
		
		//save the student work with the score and feedback
		this.saveToVLE(isExit, forceSave);
		
		//get the auto scoring parameters
		var autoScoringDoNotDisplayFeedbackToStudentOnLastChance = this.getAutoScoringField('autoScoringDoNotDisplayFeedbackToStudentOnLastChance');
		var autoScoringDisplayScoreToStudent = this.getAutoScoringField('autoScoringDisplayScoreToStudent');
		var autoScoringDisplayFeedbackToStudent = this.getAutoScoringField('autoScoringDisplayFeedbackToStudent');
		
		if(autoScoringDoNotDisplayFeedbackToStudentOnLastChance && numCheckWorkChancesLeft == 1) {
			/*
			 * the student has used their last check work chance and the step
			 * has been authored to not show the feedback on the last attempt
			 * so we will just display a generic message
			 */
			alert(this.view.getI18NString('autoGrade_complete','SVGDrawNode'));
		} else {
			if(autoScoringDisplayScoreToStudent || autoScoringDisplayFeedbackToStudent) {
				//we need to show the score or text feedback to the student
				
				//show the Feedback button at the top right of the vle next to the previous and next arrows
				this.view.displayNodeAnnotation(this.node.id);
				
				//display the feedback in a popup dialog
				eventManager.fire("showNodeAnnotations",[this.node.id]);
			} else {
				//we are not going to show the score or the text feedback to the student
				alert(this.view.getI18NString('autoGrade_submissionComplete', 'SVGDrawNode'));
			}
		}
	}
};

/**
 * Compares the student labels with the authored labels and determines
 * which student labels match the authored labels. For each student label,
 * an array will be created in that student label object that will contain
 * the authored label ids that match that student label.
 * @param studentLabels the array of student label objects
 * @param authoredLabels the array of authored label objects
 */
ANNOTATOR.prototype.matchStudentLabelsToAuthoredLabels = function(studentLabels, authoredLabels) {
	if(studentLabels != null && authoredLabels != null) {
		//loop through all the student labels
		for(var x=0; x<studentLabels.length; x++) {
			//get a student label
			var studentLabel = studentLabels[x];
			
			/*
			 * create an array to hold all the authored label ids that this
			 * student label matches
			 */
			studentLabel.matchingLabels = [];
			
			//loop through all the authored labels
			for(var y=0; y<authoredLabels.length; y++) {
				//get an authored label
				var authoredLabel = authoredLabels[y];
				
				//check if the student label matches the authored label
				if(this.doesStudentLabelMatchAuthoredLabel(studentLabel, authoredLabel)) {
					/*
					 * the student label matches the authored label so we will put
					 * the authored label id into the matching labels array for
					 * the student label
					 */
					var authoredLabelId = authoredLabel.id;
					studentLabel.matchingLabels.push(authoredLabelId);
				}
			}
		}
	}
}

/**
 * Check if the student label matches the authored label
 * @param studentLabel the student label object
 * @param authoredLabel the authored label object
 * @returns whether the student label matches the authored label
 */
ANNOTATOR.prototype.doesStudentLabelMatchAuthoredLabel = function(studentLabel, authoredLabel) {
	var result = false;
	
	if(studentLabel != null && authoredLabel != null) {
		//get the text from the student label
		var studentLabelValue = studentLabel.text;
		
		//get the regex string for the authored label
		var authoredLabelValue = authoredLabel.value;
		
		//create the regex object
		var regex = new RegExp(authoredLabelValue, 'i');
		
		//check if the student label value matches the authored label regex
		if(regex.test(studentLabelValue)) {
			result = true;
		}
	}
	
	return result;
}

/**
 * Check if an x, y point is in a region
 * @param x the x coordinate
 * @param y the y coordinate
 * @param region the region object
 * @returns whether the point is in the region
 */
ANNOTATOR.prototype.isPointInRegion = function(x, y, region) {
	var result = false;
	
	if(x != null && y != null && region != null) {
		//get the shape object
		var shape = region.shape;
		
		if(shape != null) {
			//get the shape type e.g. 'rectangle' or 'circle'
			var shapeType = shape.type;
			
			if(shapeType == null) {
				
			} else if(shapeType == 'rectangle') {
				//get the x, y, width, and height of the rectangle
				var rx = shape.x;
				var ry = shape.y;
				var rwidth = shape.width;
				var rheight = shape.height;
				
				//check if the point is in the rectangle
				result = this.isPointInRectangle(x, y, rx, ry, rwidth, rheight);
			} else if(shapeType == 'circle') {
				//get the x, y, and radius of the circle
				var cx = shape.x;
				var cy = shape.y;
				var cradius = shape.radius;
				
				//check if the point is in the circle
				result = this.isPointInCircle(x, y, cx, cy, cradius);
			}
		}
	}
	
	return result;
}

/**
 * Check if the point is in the rectangle
 * @param x the x coordinate of the point
 * @param y the y coordinate of the point
 * @param rx the x coordinate of the upper left corner of the rectangle
 * @param ry the y coordinate of the upper left corner of the rectangle
 * @param rwidth the width of the rectangle
 * @param rheight the height of the rectangle
 * @returns whether the point is in the rectangle
 */
ANNOTATOR.prototype.isPointInRectangle = function(x, y, rx, ry, rwidth, rheight) {
	var result = false;
	
	/*
	 * check if the x coordinate of the point is within the x bounds of the rectangle
	 * check if the y coordinate of the point is within the y bounds of the rectangle
	 */
	if(rx <= x && x <= (rx + rwidth) && ry <= y && y <= (ry + rheight)) {
		result = true;
	}
	
	return result;
}

/**
 * Check if the point is in the circle
 * @param x the x coordinate of the point
 * @param y the y coordinate of the point
 * @param cx the x coordinate of the circle
 * @param cy the y coordinate of the circle
 * @param cradius the radius of the circle
 * @returns whether the point is in the circle
 */
ANNOTATOR.prototype.isPointInCircle = function(x, y, cx, cy, cradius) {
	var result = false;
	
	//get the x distance from the point to the center of the circle
	var xDiff = cx - x;
	
	//get the y distance from the point to the center of the circle
	var yDiff = cy - y;
	
	//square the x difference, y difference, and radius
	var xDiffSquared = Math.pow(xDiff, 2);
	var yDiffSquared = Math.pow(yDiff, 2);
	var radiusSquared = Math.pow(cradius, 2);
	
	/*
	 * Use the circle radius equation to determine if the point is
	 * within the circle or not
	 * 
	 * r = sqrt(x^2 + y^2)
	 * r^2 = x^2 + y^2
	 * 
	 * if (x^2 + y^2) is less than r^2, that means the point is within
	 * the circle
	 */
	if((xDiffSquared + yDiffSquared) <= radiusSquared) {
		result = true;
	}
	
	return result;
}

/**
 * Compares the student labels with the regions and determines
 * which student labels are in which regions. For each student label,
 * an array will be created in that student label object that will contain
 * the region ids that the student label is in.
 * 
 * @param studentLabels the array of student label objects
 * @param regions an array of region objects
 */
ANNOTATOR.prototype.matchStudentLabelsToRegions = function(studentLabels, regions) {
	
	if(studentLabels != null && regions != null) {
		//loop through all the student labels
		for(var x=0; x<studentLabels.length; x++) {
			//get a student label
			var studentLabel = studentLabels[x];
			
			//get the x and y coordinates of the student label
			var studentLabelX = studentLabel.location.x;
			var studentLabelY = studentLabel.location.y;
			
			/*
			 * create the array that will contain the region ids that this
			 * student label is in
			 */
			studentLabel.occupiedRegions = [];
			
			//loop through all the regions
			for(var y=0; y<regions.length; y++) {
				//get a region
				var region = regions[y];
				var regionId = region.id;
				
				//check if the point is in the region
				var isInRegion = this.isPointInRegion(studentLabelX, studentLabelY, region);
				
				if(isInRegion) {
					//the point is in the region so we will add the region id to the array
					studentLabel.occupiedRegions.push(regionId);
				}
			}
		}
	}
}

/**
 * Create an array of objects that contain the pairings of label ids
 * and the region ids that they are in. The student labels must already
 * contain matchingLabels and occupiedRegions. 
 * matchStudentLabelsToAuthoredLabels() can be called to generate the matchingLabels
 * matchStudentLabelsToRegions() can be called to generate the occupiedRegions.
 * @param studentLabels the student labels
 * @returns an array containing objects that contain all the region id and
 * label id pairings based on the student labels. for example if 
 * label1 is in region1 and region2
 * label2 is in region2
 * the array would look like
 * [
 *    {
 *       "labelId":1,
 *       "regionId":1
 *    },
 *    {
 *       "labelId":1,
 *       "regionId":2
 *    },
 *    {
 *       "labelId":2,
 *       "regionId":2
 *    },
 * ]
 */
ANNOTATOR.prototype.generateLabelToRegionMappings = function(studentLabels) {
	var studentMappings = [];
	
	if(studentLabels != null) {
		//loop through all the student labels
		for(var x=0; x<studentLabels.length; x++) {
			//get a student label
			var studentLabel = studentLabels[x];
			
			if(studentLabel != null) {
				//get the occupied regions for this student label
				var occupiedRegions = studentLabel.occupiedRegions;
				
				//get the matching labels for this student label
				var matchingLabels = studentLabel.matchingLabels;
				
				//loop through all the occupied regions
				for(var r=0; r<occupiedRegions.length; r++) {
					//get an occupied region
					var regionId = occupiedRegions[r];
					
					//loop through all the matching labels
					for(var l=0; l<matchingLabels.length; l++) {
						//get a label
						var labelId = matchingLabels[l];
						
						//create the mapping object with the label id and region id
						var studentMapping = {
							labelId: labelId,
							regionId: regionId,
							
						}
						
						//add the object to our mappings array
						studentMappings.push(studentMapping);
					}
				}
			}
		}
	}
	
	return studentMappings;
}

/**
 * Compare the authored mappings with the student mappings and determine
 * which mappings have been satisfied
 * @param mappings the authored mappings
 * @param studentMappings the student mappings
 * @returns an array containing objects that contain a mapping id and whether
 * that mapping was satisifed
 */
ANNOTATOR.prototype.calculateSatisfiedMappings = function(mappings, studentMappings) {
	var mappingResults = [];
	
	if(mappings != null && studentMappings != null) {
		//loop through all the authored mappings
		for(var x=0; x<mappings.length; x++) {
			//get the mapping id
			var mapping = mappings[x];
			var mappingId = mapping.id;
			
			//check if the student has satisfied this mapping
			var isMappingSatisfied = this.isMappingInStudentMappings(mapping, studentMappings);
			
			//create the object that will contain the mapping id and whether it was satisifed
			var mappingResult = {
				id:mappingId,
				isSatisfied:isMappingSatisfied
			}
			
			//add the object to the mapping results array
			mappingResults.push(mappingResult);
		}
	}
	
	return mappingResults;
}


/**
 * Check if the mapping has been satisfied by the student
 * @param mapping the authored mapping
 * @param studentMappings the student mappings
 * @returns whether the mapping is in the student mappings
 */
ANNOTATOR.prototype.isMappingInStudentMappings = function(mapping, studentMappings) {
	var result = false;
	
	if(mapping != null && studentMappings != null) {
		//get the mapping id, region id, and label id
		var mappingId = mapping.id;
		var mappingRegionId = mapping.regionId;
		var mappingLabelId = mapping.labelId;
		
		//loop through all the student mappings
		for(var x=0; x<studentMappings.length; x++) {
			//get a student mapping
			var studentMapping = studentMappings[x];
			
			//get the region id and label id from the student mapping
			var studentMappingRegionId = studentMapping.regionId;
			var studentMappingLabelId = studentMapping.labelId;
			
			//check if the region id and label id match
			if(mappingRegionId == studentMappingRegionId && mappingLabelId == studentMappingLabelId) {
				//the region id and label id match so the student has satisfied this mapping
				result = true;
				break;
			}
		}
		
	}
	
	return result;
}

/**
 * Calculate the score and feedback for the student work
 * @param scoringCriteria an array containing all the scoring criterias
 * @param mappingResults an array containing all region to label mappings
 * and whether the student has satisfied each
 * @returns an object containing the score and the feedback
 */
ANNOTATOR.prototype.calculateScore = function(scoringCriteria, mappingResults) {
	var score = 0;
	var feedback = '';
	var scoringCriteriaResults = [];
	
	if(scoringCriteria != null && mappingResults != null) {
		//loop through all the scoring criteria objects
		for(var x=0; x<scoringCriteria.length; x++) {
			//get a scoring criteria object
			var scoringCriteriaObject = scoringCriteria[x];
			
			//check if the scoring criteria was satisfied
			var scoringCriteriaResult = this.checkScoringCriteria(scoringCriteriaObject, mappingResults);
			
			if(scoringCriteriaResult != null) {
				//get the score and feedback
				var tempScore = scoringCriteriaResult.score;
				var tempFeedback = scoringCriteriaResult.feedback;
				var tempIsSatisfied = scoringCriteriaResult.isSatisfied;
				
				if(tempScore != null) {
					//check if the score is a valid number
					if(!isNaN(tempScore)) {
						//accumulate the score
						score += tempScore;						
					}
				}
				
				if(tempFeedback != null) {
					if(feedback != '') {
						//separate the feedback from the existing feedback with new lines
						feedback += '<br/>';
					}
					
					//add the feedback
					if(tempIsSatisfied) {
						//the student satisfied this criteria so we will show the feedback in green
						feedback += '<font color="green">' + tempFeedback + '</font>';
					} else {
						//the student did not satisfy this criteria so we will show the feedback in red
						feedback += '<font color="red">' + tempFeedback + '</font>';
					}
				}
			}
			
			scoringCriteriaResults.push(scoringCriteriaResult);
		}
	}
	
	//create the object to hold the score and feedback
	var results = {
		score:score,
		feedback:feedback,
		scoringCriteriaResults:scoringCriteriaResults
	}
	
	return results;
}


/**
 * Check if the scoring criteria was satisfied
 * @param scoringCriteriaObject a scoring criteria
 * @param mappingResults the mapping results from the student work
 * @returns an object containing the score and feedback for the scoring
 */
ANNOTATOR.prototype.checkScoringCriteria = function(scoringCriteriaObject, mappingResults) {
	var results = {
		id:null,
		isSatisfied:false,
		score:null,
		feedback:null
	}
	
	if(scoringCriteriaObject != null && mappingResults != null) {
		//get the scoring logic e.g. 1&&2
		var logic = scoringCriteriaObject.logic;
		
		/*
		 * replace the mapping ids with the mapping boolean results
		 * e.g.
		 * 1&&2 will be turned into something like true&&false
		 */
		var logicReplaced = this.replaceMappingIdsWithValues(logic, mappingResults);
		
		//evaluate the expression
		var logicEvaluated = eval(logicReplaced);
		
		//set the scoring criteria id
		results.id = scoringCriteriaObject.id;
		
		if(logicEvaluated) {
			//the scoring criteria was satisfied
			results.isSatisfied = true;
			results.score = scoringCriteriaObject.score;
			results.maxScore = scoringCriteriaObject.score;
			results.feedback = scoringCriteriaObject.successFeedback;
		} else {
			//the scoring criteria was not satisfied
			results.isSatisfied = false;
			results.score = 0;
			results.maxScore = scoringCriteriaObject.score;
			results.feedback = scoringCriteriaObject.failureFeedback;
		}
	}
	
	return results;
}

/**
 * In the logic string, replace the mapping ids with the boolean
 * values from the mapping results e.g.
 * 1&&2 would be turned into something like true&&false
 * @param logic the logic string that contains mapping ids e.g. 1&&2
 * @param mappingResults an array of mapping result objects
 * @returns a string containing the logic string with the mapping ids
 * replaced with boolean values
 */
ANNOTATOR.prototype.replaceMappingIdsWithValues = function(logic, mappingResults) {
	var result = logic;
	
	if(logic != null) {
		
		var mappingIdsUsed = logic.match(/\d+/g);
		
		
		if(mappingIdsUsed != null) {
			/*
			 * sort the mapping ids from largest to smallest because we will
			 * be replacing the mapping ids with boolean values and we want to
			 * replace the larger numbers first. we must replace the larger numbers
			 * first because if there are mappings with ids 11 and 1, we need to 
			 * make sure "11" gets replaced with "true" and not "truetrue".
			 */
			mappingIdsUsed = mappingIdsUsed.sort(this.sortNumericallyDescending);
			
			//loop through all the mapping ids
			for(var x=0; x<mappingIdsUsed.length; x++) {
				//get a mapping id e.g. "5"
				var mappingIdUsed = mappingIdsUsed[x];
				
				//check the mapping results to see if this mapping id was satisfied
				var isSatisfied = this.isMappingSatisfied(mappingResults, mappingIdUsed);
				
				//create the regex that will match the mapping id
				var regex = new RegExp(mappingIdUsed, 'g');
				
				//replace all instances of the mapping id with the boolean value
				result = result.replace(regex, isSatisfied);
			}
		}
	}
	
	return result;
}

/**
 * A sorting function to sort an array containing numbers. This will sort
 * the numbers from largest to smallest.
 * @param a number
 * @param a number
 * @returns 
 * a negative number which means a should come before b in the sorted array
 * a positive number which means b should come before a in the sorted array
 * zero which means a and b are the same number
 */
ANNOTATOR.prototype.sortNumericallyDescending = function(a, b) {
	return (b - a);
}

/**
 * Check if a mapping is satisfied
 * @param mappingResults the mapping results calculated from the student work
 * @param mappingId the mapping id
 * @returns whether the mapping is satisfied
 */
ANNOTATOR.prototype.isMappingSatisfied = function(mappingResults, mappingId) {
	var result = false;
	
	if(mappingResults != null && mappingId != null) {
		//loop through all the mapping results
		for(var x=0; x<mappingResults.length; x++) {
			//get a mapping result
			var mappingResult = mappingResults[x];
			
			//get the mapping id and whether it was satisfied
			var mappingResultId = mappingResult.id;
			var isSatisfied = mappingResult.isSatisfied;
			
			//check if the mapping id matches the one we are looking for
			if(mappingId == mappingResultId) {
				/*
				 * the mapping id is the one we want so we will return
				 * whether it was satisfied
				 */ 
				result = isSatisfied;
				break;
			}
		}
	}
	
	return result;
}

/**
 * Get the max possible score the student can obtain
 * @param scoringCriteria an array of scoring criteria objects
 * @returns the max score for the step
 */
ANNOTATOR.prototype.getMaxScore = function(scoringCriteria) {
	var maxScore = 0;
	
	if(scoringCriteria != null) {
		//loop through all the scoring criteria objects
		for(var x=0; x<scoringCriteria.length; x++) {
			//get a scoring criteria object
			var tempScoringCriteria = scoringCriteria[x];
			
			if(tempScoringCriteria != null) {
				//get the score for this criteria
				var score = tempScoringCriteria.score;
				
				if(score != null && !isNaN(score)) {
					//accumulate the score
					maxScore += score;
				}
			}
		}
	}
	
	return maxScore;
}


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/svg-edit/annotator.js');
}