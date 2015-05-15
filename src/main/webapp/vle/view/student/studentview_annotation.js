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
									
									tempFeedbackHTML += this.replaceWISEVariables(autoFeedback);
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

/**
 * Create a notification annotation with an empty array for the value
 * @return a notification annotation with an empty array for the value
 */
View.prototype.createNotificationAnnotation = function() {
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
    var type = 'notification';
    
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
    var notificationAnnotation = new Annotation(runId, nodeId, toWorkgroup, fromWorkgroup, type, value, postTime, stepWorkId);
    
    return notificationAnnotation;
};

/**
 * Add an annotation value to the values array in the notification annotation.
 * @param nodeVisit the node visit the notification annotation is associated with
 * @param notificationValue an object containing an annotation for a specific node state
 * 
 * Here's an example of a notification value.
 * 
 * {
 *    "attemptNumber": 2,
 *    "score": "1",
 *    "notificationLevel": 5,
 *    "dismissCode": "pineapple2",
 *    "nodeStateId": 1426542353000,
 *    "id": "I4J3TqcUBG",
 *    "message": "Your student scored poorly on the second attempt"
 * }
 * 
 * 
 * Here's an example of an annotation object. Notice how the notification value from above
 * is placed into the value array below.
 * 
 * {
 *    "stepWorkId": 7644783,
 *    "nodeId": "node_186.or",
 *    "fromWorkgroup": -1,
 *    "value": [
 *        {
 *           "attemptNumber": 1,
 *           "score": "0-2",
 *           "notificationLevel": 5,
 *           "dismissCode": "pineapple1",
 *           "nodeStateId": 1426542353000,
 *           "id": "1wBdXcHtH1",
 *           "message": "Your student scored poorly on the first attempt"
 *        },
 *        {
 *           "attemptNumber": 2,
 *           "score": "1",
 *           "notificationLevel": 5,
 *           "dismissCode": "pineapple2",
 *           "nodeStateId": 1426542453000,
 *           "id": "I4J3TqcUBG",
 *           "message": "Your student scored poorly on the second attempt"
 *        }
 *    ],
 *    "runId": 6490,
 *    "type": "notification",
 *    "toWorkgroup": 156302,
 *    "postTime": 1409780146000
 * }
 */
View.prototype.addNotificationAnnotation = function(nodeVisit, notificationValue) {
    if(nodeVisit != null && notificationValue != null) {
        /*
         * get the notification annotation associated with the node visit if
         * the notification annotation exists
         */
        var currentNotificationAnnotation = this.getNodeVisitNotificationAnnotation(nodeVisit);
        
        if(currentNotificationAnnotation == null) {
            /*
             * we do not have a notification annotation for the node visit so we will
             * now make one
             */
            currentNotificationAnnotation = this.createNotificationAnnotation();
            
            //get the local copy of the annotations
            var annotations = this.getAnnotations();
            
            if(annotations != null) {
                //add the new annotation to the local copy
                annotations.addAnnotation(currentNotificationAnnotation);
            }
            
            //add the mapping between the node visit and the notification annotation
            this.addNodeVisitNotificationAnnotation(nodeVisit, currentNotificationAnnotation);
        }
        
        // add the notification value to the notification annotation
        this.insertNotificationValueIntoNotificationAnnotation(currentNotificationAnnotation, notificationValue)
        
        /*
         * fire the teacherNotificationUpdated event so that listeners can
         * perform any necessary actions
         */
        eventManager.fire('teacherNotificationUpdated');
    }
};

/**
 * Insert the notification value into the notification annotation. If the
 * notification value is already in the annotation, we will update the
 * notification value in the annotation.
 * @param notificationAnnotation the notification annotation
 * @param newNotificationValue the notification value
 */
View.prototype.insertNotificationValueIntoNotificationAnnotation = function(notificationAnnotation, newNotificationValue) {
    
    if (notificationAnnotation != null && newNotificationValue != null) {
        // get the value array from the notification annotation
        var notificationAnnotationValueArray = notificationAnnotation.value;
        
        // get the value id
        var newNotificationValueId = newNotificationValue.id;
        
        if (notificationAnnotationValueArray != null) {
            /*
             * loop through all the values and check if a notification value 
             * with the same id as the new notification value already exists 
             * in the value array. if it does, we will remove it from the array
             * and then add the new notification value. doing this essentially 
             * updates the notification value in the array.
             */
            for (var x = 0; x < notificationAnnotationValueArray.length; x++) {
                
                // get a value from the value array
                var notificationAnnotationValue = notificationAnnotationValueArray[x];
                
                if (notificationAnnotationValue != null) {
                    // get the id of the value
                    var notificationAnnotationValueId = notificationAnnotationValue.id;
                    
                    // check if the id matches
                    if (notificationAnnotationValueId === newNotificationValueId) {
                        // the id matches so we will remove this value element
                        notificationAnnotationValueArray.splice(x, 1);
                        x--;
                    }
                }
            }
            
            // add the value to the array
            notificationAnnotationValueArray.push(newNotificationValue);
        }
    }
};

/**
 * Add the mapping between the node visit and the notification annotation
 * @param nodeVisit the node visit
 * @param notificationAnnotation the notification annotation
 */
View.prototype.addNodeVisitNotificationAnnotation = function(nodeVisit, notificationAnnotation) {
    //initialize the array of mappings if necessary
    if(this.nodeVisitToNotificationAnnotationMappings == null) {
        this.nodeVisitToNotificationAnnotationMappings = [];
    }
    
    if(nodeVisit != null && notificationAnnotation != null) {
        //create the object to map the node visit to the notification annotation
        var nodeVisitToNotificationAnnotationMapping = {
            nodeVisit:nodeVisit,
            notificationAnnotation:notificationAnnotation
        }
        
        //add the mapping object to the array
        this.nodeVisitToNotificationAnnotationMappings.push(nodeVisitToNotificationAnnotationMapping);
    }
};

/**
 * Get the notification annotation for a node visit. There should only be
 * one notification annotation associated with a node visit.
 * @param nodeVisit the node visit
 * @return the notification annotation associated with the node visit
 * or null if one does not exist
 */
View.prototype.getNodeVisitNotificationAnnotation = function(nodeVisit) {
    //initialize the array of mappings if necessary
    if(this.nodeVisitToNotificationAnnotationMappings == null) {
        this.nodeVisitToNotificationAnnotationMappings = [];
    }
    
    //get the mappings
    var nodeVisitToNotificationAnnotationMappings = this.nodeVisitToNotificationAnnotationMappings;
    
    var notificationAnnotation = null;
    
    if(nodeVisit != null) {
        //loop through all the mappings
        for(var x=0; x<nodeVisitToNotificationAnnotationMappings.length; x++) {
            //get a mapping
            var nodeVisitToNotificationAnnotationMapping = nodeVisitToNotificationAnnotationMappings[x];
            
            if(nodeVisitToNotificationAnnotationMapping != null) {
                //get the node visit
                var tempNodeVisit = nodeVisitToNotificationAnnotationMapping.nodeVisit;
                
                //compare the node visit with the one we are looking for
                if(nodeVisit === tempNodeVisit) {
                    /*
                     * we have found the node visit we want so we can get the associated
                     * notification annotation
                     */
                    notificationAnnotation = nodeVisitToNotificationAnnotationMapping.notificationAnnotation;
                    break;
                }
            }
        }
    }
    
    return notificationAnnotation;
};

/**
 * Get the open notification annotations. For each notification annotation we
 * will look at all the values in the annotation. If any of the values in the
 * annotation are open, we will add the whole annotation to the array of
 * annotations that will be returned.
 * @returns an array of open notification annotations
 */
View.prototype.getOpenNotificationAnnotations = function() {
    var openNotifications = [];
    
    //get the local copy of the annotations
    var annotations = this.getAnnotations();
    
    if (annotations != null) {
        // get the notification annotations
        var notificationAnnotations = annotations.getAnnotationsByType('notification');
        
        if (notificationAnnotations != null) {
            
            // loop through all the notification annotations
            for (var n = 0; n < notificationAnnotations.length; n++) {
                // get a notification annotation
                var notificationAnnotation = notificationAnnotations[n];
                
                if (notificationAnnotation != null) {
                    var isOpen = false;
                    
                    // get the value of the notification annotation
                    var value = notificationAnnotation.value;
                    
                    if (value != null) {
                        
                        // loop through all the values in the notification annotation
                        for (var v = 0; v < value.length; v++) {
                            // get a value element
                            var valueElement = value[v];
                            
                            if (valueElement != null) {
                                
                                // get the dismiss timestamp
                                var dismissTimestamp = valueElement.dismissTimestamp;
                                
                                if (dismissTimestamp == null) {
                                    /*
                                     * the dismiss timestamp is null which means
                                     * the notification is open
                                     */
                                    isOpen = true;
                                    
                                }
                            }
                        }
                    }
                    
                    if (isOpen) {
                        /*
                         * there is at least one value in this notification value
                         * that is open so we will add this notification to the
                         * array that will be returned
                         */
                        openNotifications.push(notificationAnnotation);
                    }
                }
            }
        }
    }
    
    return openNotifications;
};

/**
 * Create a teacher notification annotation value that will be used
 * to create an annotation
 * @param teacherNotification the teacher notification object from
 * the step content
 * @return a new teacher notification annotation value that will be
 * used to create an annotation
 */
View.prototype.createTeacherNotificationAnnotationValue = function(teacherNotification, nodeState) {
    
    var newTeacherNotificationAnnotationValue = null;
    
    if (teacherNotification != null) {
        // get the values from the teacher notification
        var id = teacherNotification.id;
        var message = teacherNotification.message;
        var notificationLevel = teacherNotification.notificationLevel;
        var dismissCode = teacherNotification.dismissCode;
        var type = teacherNotification.type;
        var nodeStateId = nodeState.timestamp;
        
        /*
         * create a teacher notification annotation value object
         * that will become active
         */
        newTeacherNotificationAnnotationValue = {};
        newTeacherNotificationAnnotationValue.id = id;
        newTeacherNotificationAnnotationValue.message = message;
        newTeacherNotificationAnnotationValue.notificationLevel = notificationLevel;
        newTeacherNotificationAnnotationValue.dismissCode = dismissCode;
        newTeacherNotificationAnnotationValue.type = type;
        newTeacherNotificationAnnotationValue.nodeStateId = nodeStateId;
    }
    
    return newTeacherNotificationAnnotationValue;
};

/**
 * Get the teacher notification values by node id and teacher notification id
 * @param nodeId the node id
 * @param teacherNotificationId the teacher notification id
 * @returns an array of annotation values
 */
View.prototype.getTeacherNotificationsByNodeIdAndId = function(nodeId, teacherNotificationId) {
    
    var values = [];
    
    //get the local copy of the annotations
    var annotations = this.getAnnotations();
    
    if (annotations != null) {
        // get the notification annotations
        var notificationAnnotations = annotations.getAnnotationsByType('notification');
        
        if (notificationAnnotations != null) {
            
            // loop through all the notification annotations
            for (var n = 0; n < notificationAnnotations.length; n++) {
                
                // get a notification annotation
                var notificationAnnotation = notificationAnnotations[n];
                
                if (notificationAnnotation != null) {
                    //var isOpen = false;
                    
                    var notificationAnnotationNodeId = notificationAnnotation.nodeId;
                    
                    if (notificationAnnotationNodeId != null && 
                            nodeId === notificationAnnotationNodeId) {
                        
                        // get the value of the notification annotation
                        var value = notificationAnnotation.value;
                        
                        if (value != null) {
                            
                            // loop through all the values in the notification annotation
                            for (var v = 0; v < value.length; v++) {
                                // get a value element
                                var valueElement = value[v];
                                
                                if (valueElement != null) {
                                    var valueElementId = valueElement.id;
                                    
                                    if (teacherNotificationId === valueElementId) {
                                        // the teacher notification id matches the one we want
                                        values.push(valueElement);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return values;
};

/**
 * Determine if we need to activate a minTotalTimeSpentOnStep teacher
 * notification
 * @param nodeId the node id
 * @param teacherNotification the teacher notification from the step content
 * @param nodeVisit the node visit
 * @param nodeState the node state
 */
View.prototype.handleMinTotalTimeSpentOnStepTeacherNotification = function(nodeId, teacherNotification, nodeVisit, nodeState) {
    
    if (nodeId != null && teacherNotification != null && nodeState != null && nodeVisit != null) {
        var timeSpent = this.getTimeSpentOnNodeId(nodeId);
        
        var minTime = teacherNotification.minTime;
        var onlyActivateOnce = teacherNotification.onlyActivateOnce;
        
        if (minTime != null) {
            if (timeSpent < minTime) {
                /*
                 * the student has spent less than the minimum time
                 * so we will create a teacher notification
                 */
                
                var activate = true;
                
                if (onlyActivateOnce) {
                    // we should only activate this teacher notification once
                    
                    // get all the annotations for this node id and teacher notification id
                    var teacherNotificationValues = this.getTeacherNotificationsByNodeIdAndId(nodeId, teacherNotification.id);
                    
                    if (teacherNotificationValues != null && teacherNotificationValues.length > 0) {
                        /*
                         * we have activated this teacher notification previously
                         * so we will not activate it again
                         */
                        activate = false;
                    }
                }
                
                if (activate) {
                    /*
                     * create a new notification annotation and associate it
                     * with the current node visit
                     */
                    var newTeacherNotification = this.createTeacherNotificationAnnotationValue(teacherNotification, nodeState);
                    newTeacherNotification.timeSpent = timeSpent;
                    newTeacherNotification.minTime = minTime;
                    this.addNotificationAnnotation(nodeVisit, newTeacherNotification);
                }
            }
        }
    }
};

/**
 * Determine if we need to activate a maxTotalTimeSpentOnStep teacher
 * notification
 * @param nodeId the node id
 * @param teacherNotification the teacher notification from the step content
 * @param nodeVisit the node visit
 * @param nodeState the node state
 */
View.prototype.handleMaxTotalTimeSpentOnStepTeacherNotification = function(nodeId, teacherNotification, nodeVisit, nodeState) {
    
    if (nodeId != null && teacherNotification != null && nodeState != null && nodeVisit != null) {
        var timeSpent = this.getTimeSpentOnNodeId(nodeId);
        
        var maxTime = teacherNotification.maxTime;
        var onlyActivateOnce = teacherNotification.onlyActivateOnce;
        
        if (maxTime != null) {
            if (timeSpent > maxTime) {
                // the student has spent more than the maximum time
                
                var activate = true;
                
                if (onlyActivateOnce) {
                    // we should only activate this teacher notification once
                    
                    // get all the annotations for this node id and teacher notification id
                    var teacherNotificationValues = this.getTeacherNotificationsByNodeIdAndId(nodeId, teacherNotification.id);
                    
                    if (teacherNotificationValues != null && teacherNotificationValues.length > 0) {
                        /*
                         * we have activated this teacher notification previously
                         * so we will not activate it again
                         */
                        activate = false;
                    }
                }
                
                if (activate) {
                    
                    /*
                     * create a new notification annotation and associate it
                     * with the current node visit
                     */
                    var newTeacherNotification = this.createTeacherNotificationAnnotationValue(teacherNotification, nodeState);
                    newTeacherNotification.timeSpent = timeSpent;
                    newTeacherNotification.maxTime = maxTime;
                    this.addNotificationAnnotation(nodeVisit, newTeacherNotification);
                }
            }
        }
    }
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/student/studentview_annotation.js');
}