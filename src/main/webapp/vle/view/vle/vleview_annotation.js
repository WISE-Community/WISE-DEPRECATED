/**
 * Display annotations for the specified step.
 * Annotations for the step will popup in a dialog
 * @param nodeIdToShow id of node to show
 * @param feedbackHTML feedback html can be passed in to override the text 
 * that would regularly be displayed
 */
View.prototype.showNodeAnnotations = function(nodeId, feedbackHTML) {
	//display the feedback button
	this.displayNodeAnnotation(nodeId);
	
	$('#nodeAnnotationsLink').stop();
	$('#nodeAnnotationsLink').css('color','#FFFFFF');
	
	var currentNode = this.getProject().getNodeById(nodeId);  //get the node
	var currentNodeAnnotations = [];
	
	if(currentNode.getNodeAnnotations() != null) {
		//get the node annotations
		currentNodeAnnotations = currentNode.getNodeAnnotations();		
	}
	
	//get any persistent feedback we want to show from the step
	var stepFeedback = currentNode.getFeedback();
	
	if(feedbackHTML != null) {
		stepFeedback = feedbackHTML;
	}
	
	if (stepFeedback != null || (currentNodeAnnotations != null && currentNodeAnnotations.length > 0)) {

		//check if the nodeAnnotationPanel exists
		if($('#nodeAnnotationsPanel').size()==0){
			//the show nodeAnnotationPanel does not exist so we will create it
			$('<div id="nodeAnnotationsPanel" class="nodeAnnotationsPanel"></div>').dialog(
					{	autoOpen:false,
						closeText:'Close',
						modal:false,
						show:{effect:"fade",duration:200},
						hide:{effect:"fade",duration:200},
						title:this.getI18NString("node_annotations_title"),
						zindex:9999,
						width:450,
						height:'auto',
						position:["center","middle"],
						resizable:true    					
					}).bind( "dialogbeforeclose", {view:currentNode.view}, function(event, ui) {

					});
		};

		// set the title of the dialog based on step title
		$('#nodeAnnotationsPanel').dialog("option","title",this.getI18NString("node_annotations_title")+" "+this.getProject().getVLEPositionById(currentNode.id)+": "+currentNode.getTitle());
		var nodeAnnotationComment = null;  // latest comment
		var nodeAnnotationScore = null;    // latest score
		var nodeAnnotationCRater = null;    // latest cRater feedback
		var autoGradedAnnotations = [];
		for (var i=0; i< currentNodeAnnotations.length; i++) {
			var currentNodeAnnotation = currentNodeAnnotations[i];
			if (currentNodeAnnotation.type == "comment") {
				nodeAnnotationComment = currentNodeAnnotation;
			} else if (currentNodeAnnotation.type == "score") {
				nodeAnnotationScore = currentNodeAnnotation;
			} else if (currentNodeAnnotation.type == "cRater") {
				nodeAnnotationCRater = currentNodeAnnotation;
			} else if (currentNodeAnnotation.type == "autoGraded") {
				autoGradedAnnotations.push(currentNodeAnnotation);
			}
		}
		
		var nodeAnnotationsString = "<div id='nodeAnnotations' style='line-height:150%;height:400px'>";

		// if the node is cRater-enabled and there's feedback, show it instead of teacher feedback.
	
		if(stepFeedback != null) {
			//there is step feedback
		
			//replace all \n with <br>
			stepFeedback = stepFeedback.replace(/\n/g, '<br>');

			nodeAnnotationsString += stepFeedback;
			nodeAnnotationsString += '<br><br>';
		} else if(autoGradedAnnotations.length > 0) {
			
			//the variable used to accumulate the auto graded feeback html
			var autoGradedFeedbackHTML = '';
			
			//loop through all the auto graded annotations from newest to oldest
			for(var x=autoGradedAnnotations.length - 1; x>=0; x--) {
				//get an auto graded annotation
				var autoGradedAnnotation = autoGradedAnnotations[x];
				
				if(autoGradedAnnotation != null) {
					//get the value of the annotation which should be an array of annotation values
					var value = autoGradedAnnotation.value;
					
					if(value != null) {
						//loop through all the annotation values from newest to oldest
						for(var y=value.length - 1; y>=0; y--) {
							//get the latest annotation value from the array of annotation values
							var tempValue = value[y];
							
							if(tempValue != null) {
								//get the auto feedback message, auto score, and max auto score
								var autoFeedback = tempValue.autoFeedback;
								var autoScore = tempValue.autoScore;
								var maxAutoScore = tempValue.maxAutoScore;
								
								var tempFeedbackHTML = '';
								
								/*
								 * check if there is an auto score and if the step is authored 
								 * to show the auto score to the student
								 */
								if(autoScore != null && currentNode.showAutoScore()) {
									tempFeedbackHTML += 'Score: ' + autoScore;
									
									if(maxAutoScore != null) {
										//display the max auto score as the denominator
										tempFeedbackHTML += '/' + maxAutoScore;
									}
								}
								
								/*
								 * check if there is auto feedback and if the step is authored 
								 * to show the auto feedback to the student
								 */
								if(autoFeedback != null && currentNode.showAutoFeedback()) {
									if(tempFeedbackHTML != '') {
										tempFeedbackHTML += '<br>';
									}
									
									tempFeedbackHTML += autoFeedback;
								}
								
								if(autoGradedFeedbackHTML == '') {
									//this is the latest feedback
									autoGradedFeedbackHTML += "<span class='nodeAnnotationsComment'><b>New Feedback<br/>" + tempFeedbackHTML + "</b></span><br/><hr>";
								} else {
									//this is not the latest feedback
									autoGradedFeedbackHTML += "<span class='nodeAnnotationsComment'>Previous Feedback<br/>" + tempFeedbackHTML + "</span><br/><hr>";										
								}
							}
						}
					}
				}
			}
			
			if(autoGradedFeedbackHTML != '') {
				//add all the auto graded feedback html
				nodeAnnotationsString += autoGradedFeedbackHTML + '<br/>';
			}
		} else if (currentNode.content.getContentJSON().cRater && 
				(currentNode.content.getContentJSON().cRater.displayCRaterScoreToStudent ||
						currentNode.content.getContentJSON().cRater.displayCRaterFeedbackToStudent)) {
			var cRaterFeedbackStringSoFar = "<span class='nodeAnnotationsCRater'>";
			if (currentNode.content.getContentJSON().cRater.displayCRaterScoreToStudent) {
				if (nodeAnnotationCRater != null) {
					var you_got_a_score_of = this.getI18NString('you_got_a_score_of');
					
					// get the score from the annotation
					cRaterFeedbackStringSoFar += you_got_a_score_of + " "+nodeAnnotationCRater.value[nodeAnnotationCRater.value.length - 1].score+"<br/><br/>";					
				}
			}
			if (currentNode.content.getContentJSON().cRater.displayCRaterFeedbackToStudent) {
				// get the feedback that the student saw in the nodestate
				if (this.getState().getLatestCRaterFeedbackByNodeId(currentNode.id) != null) {
					var cRaterFeedbackText = this.getState().getLatestCRaterFeedbackByNodeId(currentNode.id);
					if (cRaterFeedbackText != null) {
						cRaterFeedbackStringSoFar += cRaterFeedbackText+"<br/>";						
					}
				}
			}
			cRaterFeedbackStringSoFar += "</span><br/>";
			nodeAnnotationsString += cRaterFeedbackStringSoFar;
		} else {
			// otherwise, show the teacher score and feedback
			if (nodeAnnotationScore != null && nodeAnnotationScore.value) {
				var score = this.getI18NString('score');
				var out_of = this.getI18NString('out_of');
				
				var maxScoreForThisStep = this.maxScores.getMaxScoreValueByNodeId(currentNode.id);
				nodeAnnotationsString += "<span class='nodeAnnotationsScore'>" + score + ": "+nodeAnnotationScore.value+" " + out_of + " "+ maxScoreForThisStep +"</span><br/><br/>";
			}
			if (nodeAnnotationComment != null && nodeAnnotationComment.value) {
				var comments = this.getI18NString('comments');
				
				nodeAnnotationsString += "<span class='nodeAnnotationsComment'>" + comments + ": "+nodeAnnotationComment.value+"</span><br/>";
			}
		}
		
		var buttonText = this.getI18NString('node_annotations_button_text'),
			you_can_always_view = this.getI18NStringWithParams('node_annotations_instructions',[buttonText]);
		
		nodeAnnotationsString += "<span class='nodeAnnotationsFooter' style='font-style:italic'>" + you_can_always_view + "</span>";
		nodeAnnotationsString += "</div>";

		//set the html into the div
		$('#nodeAnnotationsPanel').html(nodeAnnotationsString);

		// show the annotation panel
		$('#nodeAnnotationsPanel').dialog('open');
	}
    
};

/**
 * Displays node Annotation for specified nodeId
 * @param nodeId
 */
View.prototype.displayNodeAnnotation = function(nodeId){
	/* set annotation link in nav bar if annotation exists for this step
	 * populate annotation panel with current node's annotation
	 * */
	var currentNode = this.getProject().getNodeById(nodeId); //get the node the student is currently on
	var currentNodeAnnotations = currentNode.getNodeAnnotations();
	
	//get any persistent feedback we want to show from the step
	var stepFeedback = currentNode.getFeedback();
	
	if (stepFeedback != null || (currentNodeAnnotations != null && currentNodeAnnotations.length > 0)) {
    	var nodeAnnotationsLink = "<a id='nodeAnnotationsLink' onclick='eventManager.fire(\"showNodeAnnotations\",[\""+nodeId+"\"])' title='"+this.getI18NString("node_annotations_button_title")+"'>"+this.getI18NString("node_annotations_button_text")+"</a>";
    	$('#nodeAnnotations').empty().html(nodeAnnotationsLink);
	
		// highlight nodeAnnotationsLink
		function highlight(){
			$('#nodeAnnotationsLink').animate({
				color: '#FFE347'
			}, {
				duration: 1000,
				complete: function(){
					$('#nodeAnnotationsLink').animate({
						color: '#FFFFFF'
					}, {
						duration: 1000,
						complete: function(){
							highlight();
						}
					});
				}
			});
		}
    } else {
    	$("#nodeAnnotations").empty();
    }
};

/**
 * Create an autoGraded annotation
 * @return an autoGraded annotation object
 */
View.prototype.createAutoGradedAnnotation = function() {
	//get the run id
	var runId = parseInt(this.config.getConfigParam('runId'));
	
	//get the current node visit
	var currentNodeVisit = this.getState().getCurrentNodeVisit();
	
	//get the node id
	var nodeId = currentNodeVisit.nodeId;
	
	//get the to workgroup
	var toWorkgroup = this.userAndClassInfo.getWorkgroupId();
	
	//the from workgroup will be -1 since this is an auto graded annotation
	var fromWorkgroup = -1;
	
	//get the annotation type
	var type = 'autoGraded';
	
	/*
	 * get the annotation value, the value will be an array that contains
	 * objects. the objects will be annotation values for specific node 
	 * states. the annotation object is related to a single node visit.
	 * the array of values is how we will link annotation values to
	 * specific node states within the node visit.
	 */
	var value = [];
	
	/*
	 * at this point in time the post time and step work id are not generated
	 * yet so we will set them to null
	 */
	var postTime = null;
	var stepWorkId = null;
	
	//create the annotation object
	var autoGradedAnnotation = new Annotation(runId, nodeId, toWorkgroup, fromWorkgroup, type, value, postTime, stepWorkId);
	
	return autoGradedAnnotation;
};

/**
 * Add an annotation value to the values array in the current auto graded annotation.
 * @param nodeVisit the node visit the auto graded annotation is associated with
 * @param annotationValue an object containing an annotation for a specific node state
 * 
 * Here's an example of an annotation value.
 * 
 * {
 *    "nodeStateId": 1409780119000,
 *    "autoScore": 9,
 *    "autoFeedback": "Good job"
 * }
 * 
 * 
 * Here's an example of an annotation object. Notice how the annotation value from above
 * is placed into the value array below.
 * 
 * {
 *    "stepWorkId": 7644783,
 *    "nodeId": "node_186.or",
 *    "fromWorkgroup": -1,
 *    "value": [
 *        {
 *           "nodeStateId": 1409780119000,
 *           "autoScore": 9,
 *           "autoFeedback": "Good job!"
 *        },
 *        {
 *           "nodeStateId": 1409780134000,
 *           "autoScore": 10,
 *           "autoFeedback": "Great job!!"
 *        },
 *        {
 *           "nodeStateId": 1409780141000,
 *           "autoScore": 11,
 *           "autoFeedback": "Excellent job!!!"
 *        }
 *    ],
 *    "runId": 6490,
 *    "type": "autoGraded",
 *    "toWorkgroup": 156302,
 *    "postTime": 1409780146000
 * }
 */
View.prototype.addAutoGradedAnnotation = function(nodeVisit, annotationValue) {
	if(nodeVisit != null && annotationValue != null) {
		/*
		 * get the auto graded annotation associated with the node visit if
		 * the auto graded annotation exists
		 */
		var currentAutoGradedAnnotation = this.getNodeVisitAutoGradedAnnotation(nodeVisit);
		
		if(currentAutoGradedAnnotation == null) {
			/*
			 * we do not have an auto graded annotation for the node visit so we will
			 * now make one
			 */
			currentAutoGradedAnnotation = this.createAutoGradedAnnotation();
			
			//get the local copy of the annotations
			var annotations = this.getAnnotations();
			
			if(annotations != null) {
				//add the new annotation to the local copy
				annotations.addAnnotation(currentAutoGradedAnnotation);
			}
			
			//add the mapping between the node visit and the auto graded annotation
			this.addNodeVisitAutoGradedAnnotation(nodeVisit, currentAutoGradedAnnotation);
		}
		
		//add the new annotation value to the annotation
		currentAutoGradedAnnotation.value.push(annotationValue);		
	}
};

/**
 * Add the mapping between the node visit and the auto graded annotation
 * @param nodeVisit the node visit
 * @param autoGradedAnnotation the auto graded annotation
 */
View.prototype.addNodeVisitAutoGradedAnnotation = function(nodeVisit, autoGradedAnnotation) {
	//initialize the array of mappings if necessary
	if(this.nodeVisitToAutoGradedAnnotationMappings == null) {
		this.nodeVisitToAutoGradedAnnotationMappings = [];
	}
	
	if(nodeVisit != null && autoGradedAnnotation != null) {
		//create the object to map the node visit to the auto graded annotation
		var nodeVisitToAutoGradedAnnotationMapping = {
			nodeVisit:nodeVisit,
			autoGradedAnnotation:autoGradedAnnotation
		}
		
		//add the mapping object to the array
		this.nodeVisitToAutoGradedAnnotationMappings.push(nodeVisitToAutoGradedAnnotationMapping);
	}
};

/**
 * Get the auto graded annotation for a node visit
 * @param nodeVisit the node visit
 * @return the auto graded annotation associated with the node visit
 * or null if one does not exist
 */
View.prototype.getNodeVisitAutoGradedAnnotation = function(nodeVisit) {
	//initialize the array of mappings if necessary
	if(this.nodeVisitToAutoGradedAnnotationMappings == null) {
		this.nodeVisitToAutoGradedAnnotationMappings = [];
	}
	
	//get the mappings
	var nodeVisitToAutoGradedAnnotationMappings = this.nodeVisitToAutoGradedAnnotationMappings;
	
	var autoGradedAnnotation = null;
	
	if(nodeVisit != null) {
		//loop through all the mappings
		for(var x=0; x<nodeVisitToAutoGradedAnnotationMappings.length; x++) {
			//get a mapping
			var nodeVisitToAutoGradedAnnotationMapping = nodeVisitToAutoGradedAnnotationMappings[x];
			
			if(nodeVisitToAutoGradedAnnotationMapping != null) {
				//get the node visit
				var tempNodeVisit = nodeVisitToAutoGradedAnnotationMapping.nodeVisit;
				
				//compare the node visit with the one we are looking for
				if(nodeVisit === tempNodeVisit) {
					/*
					 * we have found the node visit we want so we can get the associated
					 * auto graded annotation
					 */
					autoGradedAnnotation = nodeVisitToAutoGradedAnnotationMapping.autoGradedAnnotation;
					break;
				}
			}
		}
	}
	
	return autoGradedAnnotation;
};

/**
 * Remove the node visit to auto graded annotation mapping
 * @param nodeVisit the node visit we want to remove
 */
View.prototype.removeNodeVisitAutoGradedAnnotation = function(nodeVisit) {
	//initialize the array of mappings if necessary
	if(this.nodeVisitToAutoGradedAnnotationMappings == null) {
		this.nodeVisitToAutoGradedAnnotationMappings = [];
	}

	//get the mappings
	var nodeVisitToAutoGradedAnnotationMappings = this.nodeVisitToAutoGradedAnnotationMappings;
	
	if(nodeVisit != null) {
		//loop through all the mappings
		for(var x=0; x<nodeVisitToAutoGradedAnnotationMappings.length; x++) {
			//get a mapping
			var nodeVisitToAutoGradedAnnotationMapping = nodeVisitToAutoGradedAnnotationMappings[x];
			
			if(nodeVisitToAutoGradedAnnotationMapping != null) {
				//get the node visit
				var temptNodeVisit = nodeVisitToAutoGradedAnnotationMapping.nodeVisit;
				
				//compare the node visit with the one we are looking for
				if(nodeVisit === tempNodeVisit) {
					/*
					 * we have found the node visit we want so we will remove the mapping
					 * object from the array
					 */
					nodeVisitToAutoGradedAnnotationMappings.splice(x, 1);
					
					/*
					 * move the counter back one since we have just removed an element
					 * from the array and continue searching the rest of the array
					 */
					x--;
				}
			}
		}
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_annotation.js');
}