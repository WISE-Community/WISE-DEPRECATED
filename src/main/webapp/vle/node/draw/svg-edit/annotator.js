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
		"labelTotal": 0
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
			
			console.log('height: ' + height + ', width: ' + width);
			
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
		var defaultSvgString = '<svg width="' + this.width + '" height="' + this.height + '" xmlns="http://www.w3.org/2000/svg">' +
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

ANNOTATOR.prototype.saveToVLE = function(isExit) {
	if(svgEditor.changed){
		svgEditor.canvas.leaveContext();
		svgEditor.canvas.clearSelection();
		$('#workarea').css('opacity', 0);
		svgCanvas.setResolution('fit','fit'); // set canvas dimensions to fit all label content
		this.studentData.svgString = svgCanvas.getSvgString();
		this.studentData.explanation = $('#explanationInput').val();
		this.studentData.labels = svgEditor.ext_labels.content().labels;
		this.studentData.labelTotal = svgEditor.ext_labels.total();
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
	var data = this.studentData;
	
	/* compress nodeState data */
	//var compressedData = "--lz77--" + this.lz77.compress(JSON.stringify(data));
	var autoScore = this.autoScore;
	var maxAutoScore = this.maxAutoScore;
	var autoFeedback = this.autoFeedback;
	var autoFeedbackKey = this.autoFeedbackKey;
	var checkWork = this.checkWork;

	//create a new annotatorstate
	//var annotatorState = new ANNOTATORSTATE(compressedData, null, autoScore, autoFeedback, autoFeedbackKey, checkWork, maxAutoScore);
	var annotatorState = new ANNOTATORSTATE(data, null, autoScore, autoFeedback, autoFeedbackKey, checkWork, maxAutoScore);
	
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
				context.setLabelMode(true);
			});
			
			$('#cancelNew').off('click').on('click', function(){
				context.setLabelMode(false);
			});
			
			// setup content changed listener functions
			labelsExt.changed = function(){
				context.setLabelMode(false);
				svgEditor.changed = true;
				$('#save').prop('disabled', false);
				context.toggleInstructions();
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
				$('#explanation').slideDown('fast', function(){
					$('#explanationInput').focus();
				});
				$(this).prop('disabled', true);
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
		} else {
			$('#explain').hide();
		}
		
		// bind save click action
		$('#save').off('click').on('click', function(e){
			if(context.enableStudentTextArea) {
				$('#explanation').slideUp('fast', function(){
					//save to vle
					context.saveToVLE();
				});
				$('#explain').prop('disabled', false);
				$('#explanationInput').blur();
			} else {
				context.saveToVLE();
			}
		});
		
		function showPrompt(){
			context.instructionsModal = bootbox.alert({
				message: context.instructions,
				title: view.getI18NString('prompt_link','SVGDrawNode')
			});
		}
		
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
				var failed = [];
				
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

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/svg-edit/annotator.js');
}