// TODO: Comment me more thoroughly!

/**
 * @constructor
 * @param node
 * @returns
 */
function SVGDRAW(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
	
	this.svgCanvas = null;
	this.teacherAnnotation = "";
	this.defaultImage = ""; // svg string to hold starting (or background) svg image
	this.toolbarOptions = null; // object to hold tool visibility options
	this.stamps  =  []; // array to hold stamp paths
	this.snapshotsActive  =  false; // boolean to specify whether snapshots are active
	this.descriptionActive =  false; // boolean to specify whether student annotations/descriptions are active
	this.description  =  ""; // string to hold annotation/description text
	this.defaultDescription = ""; // string to hold starting description text
	this.instructions = ""; // string to hold prompt/instructions text
	this.active = -1; // var to hold last selected snapshot.id
	this.selected = false; // boolean to specify whether a snapshot is currently selected
	this.snapTotal = 0; // var to hold total number of snapshots created
	this.lz77 = new LZ77(); // lz77 compression object
	// json object to hold updated student data for the node
	this.studentData = {
			"svgString": "",
			"description": "",
			"snapshots": [],
			"snapTotal": 0,
			"selected": null
			};
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

SVGDRAW.prototype.init = function(jsonURL) {
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


SVGDRAW.prototype.loadModules = function(jsonfilename, context) {
	var view = this.node.view;
	
	var myDataService = new VleDS(vle);
 	// or var myDataService = new DSSService(read,write);
	context.setDataService(myDataService);
	
	var data = context.content;
	
	if(data.stamps.length > 0){
		context.stamps = []; // clear out stamps array
		for (var x=0; x<data.stamps.length; x++) {
			context.stamps.push(data.stamps[x]);
		};
	}
	if(data.defaultSnapshots && data.defaultSnapshots.length > 0){
		context.defaultSnapshots = data.defaultSnapshots;
	}
	if(data.snapshots_active){
		context.snapshotsActive = data.snapshots_active;
	}
	if(data.snapshots_max){
		context.snapshots_max = data.snapshots_max;
	}
	if(data.description_active){
		context.descriptionActive = data.description_active;
	}
	if(data.description_default) {
		context.defaultDescription = data.description_default;
	}
	if(data.prompt){
		context.instructions = data.prompt;
	}
	if(data.toolbar_options){
		context.toolbarOptions = data.toolbar_options;
	}
	if(data.img_background && view.utils.isNonWSString(data.img_background)){
		var bgUrl = data.img_background;
		var position = 'left-top';
		var xPos = 1, yPos = 1;
		view.utils.getImageDimensions(data.img_background,function(dimensions){
			var height = dimensions.height, width = dimensions.width;
			if(data.bg_position){
				position = data.bg_position;
			}
			var rightX = 599-width;
			var centerX = (rightX+1)/2;
			var bottomY = 449-height;
			var middleY = (bottomY+1)/2;
			if(position=='left-top'){
				xPos = 1, yPos = 1;
			} else if(position=='left-middle') {
				xPos = 1, yPos = middleY;
			} else if(position=='left-bottom') {
				xPos = 1, yPos = bottomY;
			} else if(position=='right-top') {
				xPos = rightX, yPos = 1;
			} else if(position=='right-middle') {
				xPos = rightX, yPos = middleY;
			} else if(position=='right-bottom') {
				xPos = rightX, yPos = bottomY;
			} else if(position=='center-top') {
				xPos = centerX, yPos = 1;
			} else if(position=='center-middle') {
				xPos = centerX, yPos = middleY;
			} else if(position=='center-bottom') {
				xPos = centerX, yPos = bottomY;
			} 
			context.defaultImage = '<svg width="600" height="450" xmlns="http://www.w3.org/2000/svg" ' +
				'xmlns:xlink="http://www.w3.org/1999/xlink"><g><title>teacher</title>' +
				'<image x="' + xPos + '" y="' + yPos + '" width="' + width + '" height="' + height + '" xlink:href="' + bgUrl + '" /></g></svg>';
			context.load();   // load preview data, if any, or load default background
		});
	} else if(data.svg_background && view.utils.isNonWSString(data.svg_background)){
		context.defaultImage = data.svg_background;
		context.load();   // load preview data, if any, or load default background
	} else {
		context.load();   // load preview data, if any, or load default background
	}
};


SVGDRAW.prototype.setDataService = function(dataService) {
	// register VLE Data Service to the svgDraw object so that
	// it can save back to vle's persistence mechanism.
	// add a function to svgDraw that will save the data to vle (wise4)
	this.dataService=dataService;
};


SVGDRAW.prototype.loadCallback = function(studentWorkJSON, context) {
		var annotationValue;
		// set default blank canvas, TODO: perhaps de-hard code dimensions
		var defaultSvgString = '<svg width="600" height="450" xmlns="http://www.w3.org/2000/svg">' +
			'<!-- Created with SVG-edit - http://svg-edit.googlecode.com/ --><g><title>student</title></g></svg>';
		
		// check for previous work and load it
		var svgString;
		svgEditor.initLoad = true;
		if (studentWorkJSON){
			try{
				svgString = studentWorkJSON.svgString;
			} catch(err) {
				svgString = studentWorkJSON;
			}
			// handle legacy instances where student layer was not named "student" on creation
			if(svgString.indexOf("<title>Layer 1</title>") != -1){
				svgString = svgString.replace("<title>Layer 1</title>", "<title>student</title>");
			}
			context.enterState = svgString;
			svgEditor.loadFromString(svgString);
			
			/*if(context.dataService.vle.getConfig().getConfigParam('mode') == 'run'){
				//check if annotations were retrieved
				if(context.dataService.vle.annotations != null) {
					//see if there were any annotations for this step
					var annotation = context.dataService.vle.annotations.getLatestAnnotationForNodeId(context.dataService.vle.getCurrentNode().id);
					if (annotation != null) {
						var annotationValue = annotation.value;
						//annotationValue = '<g><title>teacher</title><text xml:space="preserve" text-anchor="middle" font-family="serif" font-size="24" stroke-width="0" stroke="#000000" fill="#000000" id="svg_3" y="55.5" x="103">annotation</text></g>';
						this.teacherAnnotation = annotationValue;
						context.svgCanvas.setSvgString(svgString.replace("</svg>", this.teacherAnnotation + "</svg>"));
						context.svgCanvas.setCurrentLayer('Layer 1');
					}
				}
	
				var processGetDrawAnnotationResponse = function(responseText, responseXML) {
					//parse the xml annotations object that contains all the annotations
					var annotation = annotations.getLatestAnnotationForNodeId(context.dataService.vle.getCurrentNode().id);
					vle.annotations;
					var annotationValue = annotation.value;
					//annotationValue = '<g><title>teacher</title><text xml:space="preserve" text-anchor="middle" font-family="serif" font-size="24" stroke-width="0" stroke="#000000" fill="#000000" id="svg_3" y="55.5" x="103">annotation</text></g>';
					context.svgCanvas.setSvgString(svgString.replace("</svg>", annotationValue + "</svg>"));
					context.svgCanvas.setCurrentLayer('Layer 1');
				};
				//context.dataService.vle.connectionManager.request('GET', 3, 'http://localhost:8080/vlewrapper/vle/echo.html', {}, processGetDrawAnnotationResponse);
				
				var getAnnotationsParams = {
												runId: context.dataService.vle.getConfig().getConfigParam('runId'),
												toWorkgroup: context.dataService.vle.getUserAndClassInfo().getWorkgroupId(),
												fromWorkgroup: context.dataService.vle.getUserAndClassInfo().getTeacherWorkgroupId(),
												periodId: context.dataService.vle.getUserAndClassInfo().getPeriodId()
										   };
				
				//get all the annotations (TODO: uncomment when using webapp/portal)
				//context.dataService.vle.connectionManager.request('GET', 3, context.dataService.vle.getConfig().getConfigParam('getAnnotationsUrl'), getAnnotationsParams, processGetDrawAnnotationResponse);
			}*/

		} else if (context.defaultSnapshots){ // if no previous work, load author-specified default snapshots
			var snapshots = context.defaultSnapshots;
			svgEditor.loadSnapshots(snapshots);
		} else if (context.defaultImage){ // if no previous work and no default snaps, load default background drawing
			//TODO: Perhaps modify this to allow foreground (editable) starting drawings as well
			var svgString = context.defaultImage.replace("</svg>", "<g><title>student</title></g></svg>"); // add blank student layer
			svgEditor.loadFromString(svgString);
		} else { // create blank student layer
			svgEditor.loadFromString(defaultSvgString);
		}
		context.initDisplay(studentWorkJSON,context); // initiate stamps, description, snapshots
};

SVGDRAW.prototype.saveToVLE = function() {
	//alert(svgEditor.changed);
	//if(svgEditor.changed){
		// strip out annotations
		if (this.teacherAnnotation != "") {
			svgStringToSave = svgStringToSave.replace(this.teacherAnnotation, "");
		}
		this.studentData.svgString = svgCanvas.getSvgString();
		this.studentData.description = svgEditor.description;
		this.studentData.snapshots = svgEditor.snapshots;
		this.studentData.snapTotal = svgEditor.snapTotal;
		if(svgEditor.selected == true){
			this.studentData.selected = svgEditor.active;
		} else {
			this.studentData.selected = -1;
		}
		//var data = this.studentData;
		//this.dataService.save(data);
		this.save();
	//}
};

/**
 * Save the student work
 */
SVGDRAW.prototype.save = function() {
	var data = this.studentData;
	
	/* compress nodeState data */
	var compressedData = "--lz77--" + this.lz77.compress($.stringify(data));
	var autoScore = this.autoScore;
	var autoFeedback = this.autoFeedback;
	var autoFeedbackKey = this.autoFeedbackKey;
	var checkWork = this.checkWork;

	//create a new svgdrawstate
	var svgDrawState = new SVGDRAWSTATE(compressedData, null, autoScore, autoFeedback, autoFeedbackKey, checkWork);
	
	//fire the event to push this state to the global view.states object
	this.view.pushStudentWork(this.node.id, svgDrawState);
	
	//push the state object into this object's own copy of states
	this.states.push(svgDrawState);	
	
    this.data = data;
    
    //clear out the auto score and auto feedback
    this.autoScore = null;
	this.autoFeedback = null;
	this.autoFeedbackKey = null;
	this.checkWork = null;
};

SVGDRAW.prototype.load = function() {
	this.dataService.load(this, this.loadCallback);	
};

// set currently selected snapshot as active and open corresponding drawing
SVGDRAW.prototype.setSelected = function(data){
	if(data.selected > -1){
		svgEditor.active = data.selected;
		svgEditor.selected = true;
		setTimeout(function(){
			for(var i=0; i<svgEditor.snapshots.length; i++){
				if(svgEditor.snapshots[i].id == svgEditor.active){
					svgEditor.index = i;
					svgEditor.warningStackSize = 0;
					var resetUndoStack = svgCanvas.getPrivateMethods().resetUndoStack;
					resetUndoStack();
					$("#tool_undo").addClass("tool_button_disabled").addClass("disabled");
					// scroll snap images panel depending on selected snapshot
					var page = Math.floor(svgEditor.index/3);
					$("#snap_images").attr({ scrollTop: page * 375 });
					svgEditor.snapCheck();
					break;
				}
				
			}
		},1000);
		svgEditor.initSnap = false;
	} else {
		$("#snap_images").attr({ scrollTop: 0 });
		svgEditor.warning = true;
	}
};

// populate instructions, stamp images, description/annotation text, and snapshots (wise4)
SVGDRAW.prototype.initDisplay = function(data,context) {
	if(typeof(snapsLoaded) != 'undefined' && typeof(descriptionLoaded) != 'undefined' && typeof(promptLoaded) != 'undefined' && typeof(stampsLoaded) != 'undefined' &&
		snapsLoaded && descriptionLoaded && promptLoaded && stampsLoaded){
		// initiate prompt/instructions
		if(context.instructions && context.instructions != ""){
			$('#prompt_text').html(context.instructions);
			
			if(!data){
				$('#prompt_dialog').dialog('open');
			}
		} else {
			$('#tool_prompt').remove();
			$('#prompt_dialog').remove();
		}
		
		//initiate snapshots
		if(context.snapshotsActive){
			svgEditor.setMaxSnaps(context.snapshots_max);
			if(context.snapshots_max < 11){
				svgEditor.maxDrawSize = 20480;
			} else {
				svgEditor.maxDrawSize = 10240;
			}
			if(data && data.snapshots && data.snapshots.length > 0){
				svgEditor.initSnap = true;
				svgEditor.snapTotal = data.snapTotal;
				svgEditor.loadSnapshots(data.snapshots,context.setSelected(data));
				svgEditor.initSnap = false;
			}
			
		} else {
			$('#tool_snapshot').remove();
			$('#snapshotpanel').remove();
		}
		
		//initiate stamps
		if(context.stamps.length > 0){
			svgEditor.setStampImages(context.stamps);
		} else {
			$('#tools_stamps').remove();
			$('#tool_stamp').remove();
		}
		
		$('#tool_prompt').insertAfter('#tool_snapshot');
		$('#tool_prompt').insertAfter('#tool_description');
	
		// initiate description/annotation
		if(context.descriptionActive){
			if (context.snapshotsActive) { // check whether snapshots are active
				if (data && data.selected > -1) { // check whether a snapshot is selected
					for (var i=0; i<data.snapshots.length; i++) {
						if (data.snapshots[i].id == data.selected) {
							svgEditor.description = data.snapshots[i].description;
							$('#description').show();
							break;
						}
					}
				} else {//if (context.defaultDescription!="")
					//context.description = context.defaultDescription;
					$('#description').hide();
					//$('#workarea').css('bottom','36px');
				}
				
				/// Save description text
				// update description save action to accommodate snapshots
				$('#description_content').unbind('keyup');
				$('#description_content').keyup(function(){
					var value = $('#description_content').val();
					$('#description span.minimized').text(value);
					$('#description span.minimized').attr('title',value);
					for (var i=0; i<svgEditor.snapshots.length; i++) {
						if (svgEditor.snapshots[i].id == svgEditor.active) {
							svgEditor.snapshots[i].description = value;
						}
					}
					svgEditor.changed = true;
				});
				
				// update description input focus function to accommodate snapshots
				$('#description_content').unbind('focus');
				$('#description_content').focus(function(){
					for (var i=0; i<svgEditor.snapshots.length; i++) { // TODO: this is just a double check (should be removed eventually)
						if (svgEditor.snapshots[i].id == svgEditor.active) {
							$('#description_content').val(svgEditor.snapshots[i].description);
							$('#description span.minimized').text(svgEditor.snapshots[i].description);
							$('#description span.minimized').attr('title',svgEditor.snapshots[i].description);
						}
					}
					$('#description_collapse').show();
					svgEditor.toggleDescription(false);
				});
				
				$('#loop, #play').mouseup(function(){
					$('#description').hide();
				});
				
				$('#pause').mouseup(function(){
					$('#description').show();
				});
				
				$('.description_header_text span.panel_title').text('Frame Description:');
				
				$('#description_collapse').hide();
				
				// update snapCheck function to include description modifications
				svgEditor.snapCheck = function(){
					if(svgEditor.snapshots.length<1){
						$('#description').hide();
						//$('#workarea').css('bottom','36px');
					} else {
						//$('#workarea').css('bottom','88px');
					//if(svgEditor.playback == "pause"){
						//if(svgEditor.warningStackSize == svgCanvas.getUndoStackSize()){
							for (var i=0; i<svgEditor.snapshots.length; i++){
								if(svgEditor.snapshots[i].id == svgEditor.active){
									svgEditor.index = i;
									$('#description_content').val(svgEditor.snapshots[i].description);
									$('#description span.minimized').text(svgEditor.snapshots[i].description);
									$('#description span.minimized').attr('title',svgEditor.snapshots[i].description);
									if(svgEditor.playback == "pause"){
										$('#description').show();
									}
									svgEditor.selected = true;
									break;
								}
								else {
									svgEditor.index = -1;
									svgEditor.selected = false;
									$('#description').hide();
								}
							}
							svgEditor.updateClass(svgEditor.index);
						//} else {
							//svgEditor.selected = false;
							//$('#description').hide();
							//$('#workarea').css('bottom','36px');
							//svgEditor.updateClass(-1);
							//$('#fit_to_canvas').mouseup();
						//}
						//svgEditor.toggleDescription();
					//}
					}
					svgEditor.resizeCanvas();
				};
				
				// update toggleSidePanel function to accommodate for description input
				svgEditor.toggleSidePanel = function(close){
					var SIDEPANEL_OPENWIDTH = 205;
					var w = parseInt($('#sidepanels').css('width'));
					var deltax = (w > 2 || close ? 2 : SIDEPANEL_OPENWIDTH) - w;
					var sidepanels = $('#sidepanels');
					var layerpanel = $('#layerpanel');
					//$('#description').css('right', parseInt(workarea.css('right'))+deltax);
					workarea.css('right', parseInt(workarea.css('right'))+deltax);
					sidepanels.css('width', parseInt(sidepanels.css('width'))+deltax);
					layerpanel.css('width', parseInt(layerpanel.css('width'))+deltax);
					var descheader = $('#description span.minimized');
					descheader.css('width', parseInt(descheader.css('width'))-deltax-20);
					//if(svgEditor.playback != 'pause' && parseInt(sidepanels.css('width')) < 200){
						//$('#workarea').css('bottom','36px');
					//}
					svgEditor.resizeCanvas();
				};
				
				svgEditor.toggleDescription = function(close){
					if(close){
						if(svgEditor.selected==true){
							$('#description').css('height','28px');
							$('#description_content').hide();
							$('description').show();
							$('#description_edit').show();
							$('#description_collapse').hide();
							$('#description span.maximized').hide();
							$('#description span.minimized').show();
						} else {
							$('description').hide();
						}
					} else {
						if(svgEditor.selected==true){
							$('#description').css('height','127px');
							$('#description_content').css('height','75px');
							$('#description_content').show();
							$('description').show();
							$('#description_edit').hide();
							$('#description_collapse').show();
							$('#description span.minimized').hide();
							$('#description span.maximized').show();
						} else {
							$('description').hide();
						}
					}
					svgEditor.resizeCanvas();
				};
				
			} else {
				if(data.description && data.description!=""){
					svgEditor.description = data.description;
					$('#description_content').html(data.description);
					$('#description span.minimized').text(data.description);
					$('#description span.minimized').attr('title',data.description);
					
				} else if (context.defaultDescription!="") {
					svgEditor.description = context.defaultDescription;
					$('#description_content').html(context.defaultDescription);
					$('#description span.minimized').text(context.defaultDescription);
					$('#description span.minimized').attr('title',context.defaultDescription);
				}
			}
			//$('#tool_prompt').insertAfter('#tool_description');
		} else {
			$('#description').remove();
		}
		
		// process tool visibilty options
		if(context.toolbarOptions){
			for(var key in context.toolbarOptions){
				if (context.toolbarOptions.hasOwnProperty(key)) {
					if(context.toolbarOptions[key] == false){
						context.hideTools(key);
					}
				}
			}
			if(!context.toolbarOptions.pencil && !context.toolbarOptions.line && !context.toolbarOptions.rectangle &&
					!context.toolbarOptions.ellipse && !context.toolbarOptions.polygon && !context.toolbarOptions.text){
				$('#colors').hide();
			}
		}
		
		setTimeout(function(){
			if(context.snapshotsActive){
				svgEditor.toggleSidePanel();
			}
			
			$('#closepath_panel').insertAfter('#path_node_panel');
			
			// reset undo stack to prevent users from deleting stored starting image
			var resetUndoStack = svgCanvas.getPrivateMethods().resetUndoStack;
			resetUndoStack();
			svgEditor.warningStackSize = 0;
			$("#tool_undo").addClass("tool_button_disabled").addClass("disabled");
			svgEditor.setIconSize('m');
			
			$('#loading_overlay').hide();
			$('#overlay_content').dialog('close');
			
			if ($.browser.webkit) {
				$(window).height($(window).height-1);
			}
			svgEditor.resizeCanvas();
			
		},500);
		
		svgEditor.initLoad = false;
	}
	else {
		setTimeout(function(){
			context.initDisplay(data,context);
		},100);
	}
};


// hide specified set of drawing tools
// TODO: should we remove the options from the DOM instead?
SVGDRAW.prototype.hideTools = function(option){
	if(option=='pencil'){
		$('#tool_fhpath').hide();
	} else if(option=='line'){
		$('#tool_line').hide();
	} else if(option=='connector'){
		$('#mode_connect').hide();
	} else if (option=='rectangle'){
		$('#tools_rect_show').hide();
	} else if(option=='ellipse'){
		$('#tools_ellipse_show').hide();
	} else if(option=='polygon'){
		$('#tool_path').hide();
	} else if (option=='text'){
		$('#tool_text').hide();
	} else if (option=='importStudentAsset'){
		$('#tool_import_student_asset').hide();
	}
};

/**
 * Auto grade the drawing
 */
SVGDRAW.prototype.autoGradeWork = function() {
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
					var message = 'You have ' + chancesLeft;
					
					if(chancesLeft == 1) {
						message += ' chance ';
					} else {
						message += ' chances ';
					}
					
					message += 'left to receive feedback on your answer so this should be your best work!\n\n';
					message += 'Are you ready to receive feedback on this answer?';
					
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
				this.studentData.description = svgEditor.description;
				this.studentData.snapshots = svgEditor.snapshots;
				this.studentData.snapTotal = svgEditor.snapTotal;
				if(svgEditor.selected == true){
					this.studentData.selected = svgEditor.active;
				} else {
					this.studentData.selected = -1;
				}
				
				//score the drawing
				scorer.scoreDrawing(this.studentData);
				
				//get the score
				var scoreObject = this.studentData.rubricScore;
				
				var score = null;
				var key = null;
				
				if(scoreObject != null) {
					score = scoreObject.score;
					key = scoreObject.key;
				}
				
				//get the feedback
				var feedback = this.getFeedbackByKey(key);
				
				var message = '';
				
				//display the score if we need to
				if(this.content.autoScoring.autoScoringDisplayScoreToStudent) {
					message += 'Auto score returned: ' + score + " out of 5.";
				}
				
				//display the feedback if we need to
				if(this.content.autoScoring.autoScoringDisplayFeedbackToStudent) {
					if(message != '') {
						//add line breaks if we are displaying the score
						message += '\n\n';
					}
					
					message += feedback;
				}
				
				//set the score and feedback so we can access them later when we save the svgdrawstate
				this.autoScore = score;
				this.autoFeedback = message;
				this.autoFeedbackKey = key;
				this.checkWork = true;
				
				//save the student work with the score and feedback
				this.saveToVLE();
				
				if(this.content.autoScoring.autoScoringDoNotDisplayFeedbackToStudentOnLastChance && chancesLeft == 1) {
					alert('Good Job!\n\nYou have used up all your chances to submit.\n\nYou can continue to edit your drawing if you need to.');
				} else {
					//show the Feedback button at the top right of the vle next to the previous and next arrows
					this.view.displayNodeAnnotation(this.node.id);
					
					//display the feedback in a popup dialog
					eventManager.fire("showNodeAnnotations",[this.node.id]);
				}
			}
		} else {
			//the student does not have anymore check work chances
			alert('Good Job!\n\nYou have used up all your chances to submit.\n\nYou can continue to edit your drawing if you need to.');
		}
	}
};

/**
 * Get the feedback for the given score
 * @param score the score we want feedback for
 */
SVGDRAW.prototype.getFeedbackByScore = function(score) {
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
SVGDRAW.prototype.getFeedbackByKey = function(key) {
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
SVGDRAW.prototype.getMaxCheckWorkChances = function() {
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
SVGDRAW.prototype.getCheckWorkChancesUsed = function() {
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

/*SVGDRAW.prototype.checkDrawSize = function(context){
	var current = svgCanvas.getSvgString();
	var compressed = context.lz77.compress(current);
	//alert(current.length*2 + ' ' + compressed.length * 2);
	// if compressed svg string is larger than 20k, alert user and undo latest change
	if(compressed.length * 2 > 20480){
		$('#drawlimit_dialog').dialog('open');
		$('#tool_undo').click();
	}
};*/

// VLE data service setup
// This happens when the page is loaded
(function() {
	  VleDS = function(_vle){
	    this.data = "";
	    this.annotations = "";
	    this.vle = _vle;
	    this.vleNode=_vle.getCurrentNode();
	    this.lz77 = new LZ77();
	  };

	  VleDS.prototype = {
	    save: function(_data) {
    		var data = _data;
    		/* compress nodeState data */
			data = "--lz77--" + this.lz77.compress($.stringify(_data));
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
			if(typeof data == "string"){ // check whether data has been previously compressed (for backwards compatibilty)
				if (data.match(/^--lz77--/)) {
					//alert('match');
					data = data.replace(/^--lz77--/,"");
					data = $.parseJSON(this.lz77.decompress(data));
				}
			}
			
			this.data = data;
			callback(this.data,context);
	    },
	    
	    loadAnnotations: function(context,callback) {
	    	//this.annotations = this.vle.get
	    },
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
SVGDRAW.prototype.processTagMaps = function() {
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
	eventManager.fire('scriptLoaded', 'vle/node/draw/svg-edit/svgdraw.js');
};