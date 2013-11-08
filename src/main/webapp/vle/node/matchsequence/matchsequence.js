/*
 * Copyright (c) 2009 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author: Hiroki Terashima
 */

/**
 * MatchSequence (MS) object.
 * Given xmldocument, will create a new instance of the MatchSequence object and 
 * populate its attributes. Does not render anything on the screen (see MS.render() for rendering).
 * @constructor
 */
function MS(node, view) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
    this.attempts = [];
    this.feedbacks = this.content.assessmentItem.responseDeclaration.correctResponses;
    this.choices = [];
    this.sourceBucket = undefined;
    this.originalSourceBucket = undefined;  // original source bucket with the ordering of items by the author, does not change.
    this.buckets = [];  // includes only targetbuckets
    this.customCheck = undefined;
    this.displayLayout = this.content.displayLayout;
    this.logLevel = this.content.logLevel;
    this.showFeedback = true;
    this.numSubmitsAllowedBeforeLock = (this.content.numSubmitsAllowedBeforeLock != null) ? this.content.numSubmitsAllowedBeforeLock : -1;  // how many times can the student submit before getting locked out?

    //set whether to display feedback to the student when they submit their answer
    if(this.content.showFeedback != null) {
    	this.showFeedback = this.content.showFeedback; 
    }
    
    this.states = [];
    if(node.studentWork != null) {
    	this.states = node.studentWork;
    	
    	//create a copy of the states array
    	this.attempts = this.states.slice();
    }
    
    /* set custom check function if it has been defined */
	if(this.content.customCheck){
		this.customCheck = new Function('states', this.content.customCheck);
	};
	
    /* instantiate sourcebucket */
	var sourceBucketName = (this.content.sourceBucketName != null) ? this.content.sourceBucketName : this.view.getI18NString("choices","MatchSequenceNode");
	this.sourceBucket = new MSBUCKET(this.view);
	this.sourceBucket.text = sourceBucketName;
    
    /* instantiate choices */
    for (var i=0; i < this.content.assessmentItem.interaction.choices.length; i++) {
      var choice = new MSCHOICE(this.content.assessmentItem.interaction.choices[i], this.sourceBucket);
      this.choices.push(choice);      
      this.sourceBucket.choices.push(choice);   // to start out, put all choices in sourcebucket
    };
    
    /* shuffle choices if required */
    if(this.content.assessmentItem.interaction.shuffle){
    	this.sourceBucket.shuffle();
    };
    
    // make a snapshot of the sourceBucket into originalSourceBucket
    this.originalSourceBucket = this.sourceBucket;
    
    /* instantiate target buckets */
    for (var i=0; i < this.content.assessmentItem.interaction.fields.length; i++) {
      this.buckets.push(new MSBUCKET(this.view,this.content.assessmentItem.interaction.fields[i]));
    };
    
    /*
	 * allow the submit answer button to be enabled. this is set to
	 * false when challenge question is enabled and the student answers
	 * incorrectly
	 */
    this.allowEnableSubmitButton = true;
};

/**
 * Retrieves an array of choice identifiers that are supposed
 * to be in the target bucket in order to be correct
 * @param bucketId the id of the target bucket we want the list
 * of correct choices for
 */
MS.prototype.getCorrectChoicesForBucket = function(bucketId) {
	var correctChoices = [];
	
	//loop through all the feedbacks
	for(var x=0; x<this.feedbacks.length; x++) {
		//get a feedback
		var feedback = this.feedbacks[x];
		
		/*
		 * check that the target field identifier matches the bucketId
		 * and check that this feedback is for the correct instance
		 */
		if(feedback.fieldIdentifier == bucketId && feedback.isCorrect) {
			//put the choice id into our array
			correctChoices.push(feedback.choiceIdentifier);
		}
	}
	
	return correctChoices;
};

/**
 * Loads the student's previous work from the last time they
 * visited the step. Parses through the student state and
 * places choices in the target buckets and removes the
 * choices from the source bucket.
 * @param nodeState the student work to load
 */
MS.prototype.loadStudentWork = function(nodeState) {
	//clear the source and target buckets
	this.clearBuckets();
	
	//check that there is a latest state, if not, we don't need to do anything
	if(nodeState != null) {
		//get the target buckets from the student state
		var targetBuckets = nodeState.buckets;
		
		//loop through the target buckets
		for(var x=0; x<targetBuckets.length; x++) {
			//get a target bucket
			var targetBucket = targetBuckets[x];
			
			//get the id of the target bucket
			var targetBucketId = targetBucket.identifier;
			
			//get the choices that are in the target bucket
			var choices = targetBucket.choices;
			
			//loop through the choices that are in the target bucket
			for(var y=0; y<choices.length; y++) {
				//get a choice
				var choice = choices[y];

				//get the id of the choice
				var choiceId = choice.identifier;
				
				/*
				 * put the choice into the MS's target bucket that
				 * has the given targetBucketId
				 */
				this.putChoiceInBucket(choiceId, targetBucketId);
				
				/*
				 * remove the choice from the MS's source bucket
				 * because in the contructor all of the choices
				 * are initially placed in the source bucket
				 */
				this.removeFromSourceBucket(choiceId);
			}
		}		
	}
};

/**
 * Remove the choice from the source bucket
 * @param choiceId the id of the choice to remove
 */
MS.prototype.removeFromSourceBucket = function(choiceId) {
	//loop through the choices in the source bucket
	for(var x=0; x<this.sourceBucket.choices.length; x++) {
		//get a choice
		var choice = this.sourceBucket.choices[x];
		
		//see if the choice identifier matches
		if(choice.identifier == choiceId) {
			//remove the choice from the source bucket
			this.sourceBucket.choices.splice(x, 1);
		}
	}
};

/**
 * Puts a choice into a bucket
 * @param choiceId the id of the choice
 * @param bucketId the id of the bucket
 */
MS.prototype.putChoiceInBucket = function(choiceId, bucketId) {
	//get the bucket object
	var bucket = this.getTargetBucketById(bucketId);
	
	//get the choice object
	var choice = this.getChoiceById(choiceId);

	//make sure both are not null
	if(bucket != null && choice != null) {
		//put the choice into the bucket
		bucket.choices.push(choice);		
	}
};

/**
 * Retrieves a choice object given the choiceId
 * @param choiceId the id of the choice
 * @return a choice object or null if the choiceId was not found
 */
MS.prototype.getChoiceById = function(choiceId) {
	//loop through the choices
	for(var x=0; x<this.choices.length; x++) {
		//get a choice
		var choice = this.choices[x];
		
		//compare the ids
		if(choice.identifier == choiceId) {
			//the ids matched so we will return the choice object
			return choice;
		}
	}
	
	//if the choiceId was not found, return null
	return null;
};

/**
 * Retrieves a target bucket object given the bucketId
 * @param bucketId the id of a target bucket
 * @return a target bucket object or null if the bucketId
 * was not found
 */
MS.prototype.getTargetBucketById = function(bucketId) {
	//loop through the target buckets
	for(var x=0; x<this.buckets.length; x++) {
		//get a bucket
		var bucket = this.buckets[x];
		
		//compare the ids
		if(bucket.identifier == bucketId) {
			//the ids matched so we will return the bucket object
			return bucket;
		}
	}
	
	//if the bucketId was not found, return null
	return null;
};

/**
 *  Orders the items in the SourceBucket in accordance to how it was originally ordered by the author 
 */
MS.prototype.orderSourceBucket = function() {
	// get the state before we remove items from the source bucket in the UI
	var sourceBucketListItems = $("#sourceBucket li");
	// then remove all items from the source bucket in the UI
	$("#sourceBucket").html("");
	// go through the original source bucket and order
	for (var x=0; x < this.originalSourceBucket.choices.length; x++) {
		var originalSourceBucketChoice = this.originalSourceBucket.choices[x];
		for (var i=0; i < sourceBucketListItems.length; i++) {
			var sourceBucketListItem = sourceBucketListItems[i];
			if (originalSourceBucketChoice.identifier == sourceBucketListItem.id) {
				$("#sourceBucket").append(sourceBucketListItem);
			}
		}		
	}
};

/**
 * Adds orderings to choices within the targetbuckets
 * Iterates through all of the target buckets and adds
 * ordering to the choices. Iterates through all sourcebuckets and
 * removes ordering from the choices.
 */
MS.prototype.addOrderingToChoices = function() {
	
	if (!this.content.assessmentItem.interaction.ordered) {
		return;
	}
	
	var state = this.getState();
	
	/* go through the sourcebucket and remove any ordering */
	for (var i=0; i < state.sourceBucket.choices.length; i++) {
		addOrderToChoice(state.sourceBucket.choices[i].identifier, "");
	}
	
	/* now go through the targetbuckets */
	for (var i=0; i < state.buckets.length; i++) {
		var bucket = state.buckets[i];
		for (var j=0; j < bucket.choices.length; j++) {
			addOrderToChoice(bucket.choices[j].identifier, j+1);
		}
	}
};

/**
 * It is implicitly assumed that
 * this function will only be called if this is. MatchSequence
 */
function addOrderToChoice(identifier, orderNumber) {
	$('#' + identifier + ' .orderNumber').html(orderNumber);
};

/**
 * Renders choices and buckets with DD abilities
 * MS must have been instantiated already (ie this.choices should be populated)
 */
MS.prototype.render = function() {
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
	
	//get the latest node state
	var nodeState = this.states[this.states.length - 1];
	
	if(nodeState == null && workToImport != null && workToImport.length > 0) {
		/*
		 * there was no previous node state but there is work to
		 * import so we will import the work
		 */
		nodeState = workToImport[workToImport.length - 1];
	}
	
	this.loadStudentWork(nodeState);
	
	// render the prompt
	var promptdiv = document.getElementById('promptDiv');
	promptdiv.innerHTML=this.content.assessmentItem.interaction.prompt;
	  
	var bucketsHtml = "";
	var choicesBucketHtml = "";
    document.getElementById('play').innerHTML = "";
    
    //layout is vertical or horizontal
    var displayLayout = this.displayLayout;
    
    if(displayLayout == "horizontal") {
    	bucketsHtml += "<table>";
    	bucketsHtml += "<tr>";
    	//add the html for the target bucket(s)
    	
    	//loop through the target buckets
    	for(var x=0; x<this.buckets.length; x++) {
    		//get a target bucket
    		var currentBucket = this.buckets[x];
    		
    		//add the html for the target bucket
    		bucketsHtml += this.getBucketHtml(currentBucket, displayLayout, true, this.buckets.length);	
    	}
    	bucketsHtml += "</tr>";
    	bucketsHtml += "</table>";
    	
    	bucketsHtml += "<table>";
    	bucketsHtml += "<tr>";
    	//add the html for the source bucket(s)
    	bucketsHtml += this.getBucketHtml(this.sourceBucket, displayLayout, false);
    	bucketsHtml += "</tr>";
    	bucketsHtml += "</table>";
    } else {
    	choicesBucketHtml = this.getBucketHtml(this.sourceBucket);
        bucketsHtml += "<table><tr><td><div id=\"choicesColumn\">"+ choicesBucketHtml +"</div></td>";
        bucketsHtml += "<td><div id=\"bucketsAndFeedbackColumn\">";
        for (var i=0; i < this.buckets.length; i++) {
            var currentBucket = this.buckets[i];
            var currentBucketHtml = this.getBucketHtml(currentBucket);
            bucketsHtml += currentBucketHtml;
        };
        bucketsHtml += "</div></td></tr></table>";
    }
    
    document.getElementById('play').innerHTML = bucketsHtml;
    
    /* enables jquery drag and drop */
    renderDragAndDrop();
    
    //check if we want to display feedback
    if(this.showFeedback) {
        //check to see if the student answered the question correctly last time they visited
    	var checkBucketAnswerResults = this.checkBucketAnswers(true);
    	var feedbackHTMLString = checkBucketAnswerResults.feedbackHTMLString;
    	var numWrongChoices = checkBucketAnswerResults.numWrongChoices;
    	var numCorrectChoices = checkBucketAnswerResults.numCorrectChoices;
    	
    	if(numWrongChoices == 0) {
    		//the student answered the question correctly last time so we will display the congratulations message
    		this.displayCompletionMessage();
    	}
    	
        //check if scoring is enabled
        if(this.isChallengeScoringEnabled()) {
        	this.displayCurrentPossibleScoreTable(numWrongChoices);
        }
        
    	if(numWrongChoices != 0) {
    		//the student has not correctly answered this question so we will display the current attempt number
    		this.displayCurrentAttemptNumber();
    	} else {
    		//the student has previously correctly answered the question so we will display the previous attempt number
    		this.displayPreviousAttemptNumber();
    	}
    	
    	if(numWrongChoices != 0) {
    		//student has not answered this question correctly
    		
    	    if(this.isChallengeEnabled()) {
    	    	//challenge question is enabled so we will create the constraint
    	    	this.view.addActiveTagMapConstraint(this.node.id, null, 'mustCompleteBeforeAdvancing', null);
    	    }
    	}
    } else {
    	//hide the feedback and number of attempts display
    	$('#feedbackDiv').hide();
    	$('#numberAttemptsDiv').hide();
	}
    
    $("#checkAnswerButton").val(this.view.getI18NString("check_answer","MatchSequenceNode"));
    
	// check to see if we need to disable the step from further interactivity by checking if student has exhausted number of attempted allowed
	if (this.numSubmitsAllowedBeforeLock != -1) {
		if (this.attempts.length == this.numSubmitsAllowedBeforeLock) {
			this.node.disableInteractivity(true, this.view.getI18NString("step_completed","MatchSequenceNode"));
		}
	}
    
    this.node.view.eventManager.fire('contentRenderCompleted', this.node.id, this.node);
};

/**
 * Check if the author only wants to allow one choice per target bucket
 * @return true if we are only allowing one choice per target bucket
 * false if we are allowing multiple choices per target bucket
 */
MS.prototype.allowOnlyOneChoicePerTargetBucket = function() {
	//check if this parameter was set in the json content
	if(this.content.allowOnlyOneChoicePerTargetBucket != null && 
			this.content.allowOnlyOneChoicePerTargetBucket == true) {
		//only allow one choice
		return true;
	} else {
		//allow multiple choices
		return false;
	}
};

/**
 * Given a MSBUCKET object, returns a HTML-representation of the bucket as a string.
 * All the choices in the buckets are list items <li>.
 */
MS.prototype.getBucketHtml = function(bucket, displayLayout, targetBucket, totalNumTargetBuckets) {
	var bucketHtml = "";
	
	var bucketName = "bucket_ul";
	var bucketClass = "bucket_ul";
	
	if(!targetBucket) {
		//this is a source bucket
		bucketClass += " sourceBucket";
	}
	
	if(displayLayout == "horizontal") {
		var choicesInBucketHtml = "";
		var tempChoicesInRowHtml = "";
		
		//the max number of choices in a row for the source bucket
		var maxChoicesPerRow = 4;
		var numChoicesInRow = 0;
		
		/*
		 * the default width and height for the target buckets.
		 * there may be multiple buckets. these dimensions will
		 * accomodate up to 4 target buckets without the buckets
		 * going off the screen
		 */
		
		//var targetWidth = 150;
		var targetWidth = 700 / totalNumTargetBuckets - 25;
		var targetHeight = 125;
		
		//loop through all the choices
		for(var x=0; x<bucket.choices.length; x++) {
			var choice = bucket.choices[x];
			var choiceText = choice.text;
			var choiceId = bucket.choices[x].identifier;
			
			var choiceLi = "";
			//create the td for the choice
			if (this.content.assessmentItem.interaction.ordered) {
				choiceLi = "<li id="+ choiceId +" class=\"choice draggable horizontalLi\"><div class=\"orderNumber\"></div>" + choiceText +"</li>";
			} else {
				choiceLi = "<li id="+ choiceId +" class=\"choice draggable horizontalLi\">" + choiceText +"</li>";
			};
			
			//wrap the choice in td if it is in the source bucket
			if(!targetBucket) {
				//choice is in source bucket
				tempChoicesInRowHtml += choiceLi;
			} else {
				//choice is in target bucket
				tempChoicesInRowHtml += choiceLi;
			}
			
			//increment the number of choices in the current tr
			numChoicesInRow++;
			
			//check if we've hit the max choices per row, only do this for source buckets
			if(!targetBucket && numChoicesInRow >= maxChoicesPerRow) {
				/*
				 * we have hit the max choices per row so we will end this tr
				 * so subsequent td's will start on a new row
				 */
				choicesInBucketHtml += tempChoicesInRowHtml;
				
				//reset the html and counter
				tempChoicesInRowHtml = "";
				numChoicesInRow = 0;
			}
		}
		
		/*
		 * check if there were any remaining choices that we haven't
		 * added to the choices bucket html
		 */
		if(tempChoicesInRowHtml != "") {
			if(!targetBucket) {
				//wrap in tr if choice is in source bucket
				choicesInBucketHtml += tempChoicesInRowHtml;	
			} else {
				//choice is in target bucket, don't wrap in tr
				choicesInBucketHtml += tempChoicesInRowHtml;
			}
			
		}
		
		//check if there were any choices
		if(!targetBucket && choicesInBucketHtml != "") {
			//this is a source bucket and there were choices so we will put them in a table
			choicesInBucketHtml = choicesInBucketHtml;
		}
		
		//start the td, this will be the outermost element
		bucketHtml += "<td>";
		
		//start the bucketblock
		bucketHtml += "<div class=\"bucketblock\">";
		
		//add the label for the bucket
		bucketHtml += "<div class=\"bucketlabel\" >"+ bucket.text + "</div>";
		
		var bucketUlStyle = "";
		
		//check if this is a target bucket
		if(targetBucket) {
			//this is a target bucket, we will give it the necessary dimensions
			bucketUlStyle = "style='overflow:auto; width:" + targetWidth + "px; height: " + targetHeight + "px;'";
		}
		
		//create the bucket and add any necessary choices
		bucketHtml += "<div class=\"bucket\"><ul name=\"" + bucketName + "\" class=\"" + bucketClass + "\" id=" + bucket.identifier +" " + bucketUlStyle + ">" + choicesInBucketHtml + "</ul></div>";
		
		//add the feedback div
		bucketHtml += "<div id=\"feedbackdiv_"+ bucket.identifier +"\"></div>";
		
		//close the bucketblock
		bucketHtml += "</div>";
		
		//end the td, this is the outermost element
		bucketHtml += "</td>";
	} else {
		var choicesInBucketHtml = "";
		for (var j=0; j < bucket.choices.length; j++) {
			var choice = bucket.choices[j];
			var choiceText = choice.text;
			var choiceId = bucket.choices[j].identifier;
			
			if (this.content.assessmentItem.interaction.ordered) {
			    choicesInBucketHtml += "<li id="+ choiceId +" class=\"choice draggable\"><div class=\"orderNumber\"></div>" + choiceText +"</li>";			
			} else {
			    choicesInBucketHtml += "<li id="+ choiceId +" class=\"choice draggable\">" + choiceText +"</li>";
			};
		};

		bucketHtml += "<div class=\"bucketblock\">";
		bucketHtml += "<div class=\"bucketlabel\" >"+ bucket.text + "</div>";
		bucketHtml += "<table id='bucketTable'><tr><td>";
		bucketHtml += "<div class=\"bucket\"><ul name=\"" + bucketName + "\" class=\"" + bucketClass + "\" id=" + bucket.identifier +">"+choicesInBucketHtml+"</ul></div></td>";
		bucketHtml += "<td><div id=\"feedbackdiv_"+ bucket.identifier +"\"></div></td></tr>"
		bucketHtml += "</table></div>";
	}

	return bucketHtml;
};

/**
 * Returns current state of the MS
 */
MS.prototype.getState = function() {
	var state = new MSSTATE();
	var bucketElements = document.getElementsByTagName('ul'); 
	for (var i=0; i < bucketElements.length; i++) {
		var currentBucketIdentifier = bucketElements[i].getAttribute('id');
		if(currentBucketIdentifier){//if it doesn't have one, then it is probably a feedback div so no further processing is desired
			var currentBucketCopy = this.getBucketCopy(currentBucketIdentifier);
			var choicesInCurrentBucket = bucketElements[i].getElementsByTagName('li');
			for (var j=0; j < choicesInCurrentBucket.length; j++) {
				/* filter out elements with null ids */
				if(choicesInCurrentBucket[j].getAttribute('id')){
					currentBucketCopy.choices.push(this.getChoiceCopy(choicesInCurrentBucket[j].getAttribute('id')));
				}
			}
	
			if (currentBucketIdentifier == 'sourceBucket') {
				state.sourceBucket = currentBucketCopy;
			} else {
				state.buckets.push(currentBucketCopy);
			}
		}
	}
	return state;
};

/**
 * Gets the bucket with the specified identifier
 */
MS.prototype.getBucket = function(identifier) {
	if (this.sourceBucket.identifier == identifier) {
		return this.sourceBucket;
	};
    for (var i=0; i < this.buckets.length; i++) {
        if (this.buckets[i].identifier == identifier) {
            return this.buckets[i];
        };
    };
    return null;
};

/**
 * Gets the choice with the specified identifier
 */
MS.prototype.getChoice = function(identifier) {
    for (var i=0; i < this.choices.length; i++) {
        if (this.choices[i].identifier == identifier) {
            return this.choices[i];
        };
    };
    return null;
};

/**
 * Given an identifier string, returns a new MSCHOICE instance
 * of a MSCHOICE with the same identifier.
 */
MS.prototype.getChoiceCopy = function(identifier) {
   var original = this.getChoice(identifier);
   var copy = new MSCHOICE(null, original.bucket);
   copy.identifier = original.identifier;
   copy.text = original.text;
   copy.dom = original.dom;
   return copy;
};

/**
 * Given an identifier string, returns a new MSBUCKET instance
 * of a MSBUCKET with the same identifier.
 */
MS.prototype.getBucketCopy = function(identifier) {
    var original = this.getBucket(identifier);
    var copy = new MSBUCKET(this.view);
    copy.isTargetBucket = original.isTargetBucket;	
    copy.identifier = identifier;
    copy.choices = [];
    copy.text = original.text;
    return copy;
};

/**
 * Gets the current state of the MatchSequence and provides appropriate feedback.
 * If the sourcebucket is not empty, then the student is not considered to be finished and
 * does not check if the state is correct.
 */
MS.prototype.checkAnswer = function() {
	// check to see if student can check answer, or they've depleted their attempts already
	if (this.numSubmitsAllowedBeforeLock != -1) {
		if (this.attempts.length + 1 == this.numSubmitsAllowedBeforeLock) {
			var doCheckAnswer = window.confirm(this.view.getI18NString("click_ok_to_save","MatchSequenceNode"));
			if (!doCheckAnswer) {
				// student has opted to continue working some more before submitting
				return;
			}
		} else if (this.attempts.length + 1 < this.numSubmitsAllowedBeforeLock) {
			// student still has submit attempts left
		} else if (this.attemtps.length + 1 > this.numSubmitsAllowedBeforeLock) {
			// shouldn't get here. student has submitted more than they're allowed. Maybe show a message?
		}
	}
	
	if ($('#checkAnswerButton').parent().hasClass('ui-state-disabled')) {
		return;
	}
	
	//clear the previous result message
	$('#resultMessageDiv').html('');
	
	this.attempts.push(null);
	
	if(!this.showFeedback) {
		//we are not showing feedback
		
		//disable the submit button
		//addClassToElement("checkAnswerButton", "disabledLink");
		$('#checkAnswerButton').parent().addClass('ui-state-disabled');
		
		//get the student data
		var state = this.getState();
		
		//save the student data
		this.view.pushStudentWork(this.node.id, state.getJsonifiableState());
	} else if(this.customCheck!=null){
		var feedback = this.customCheck(ms.getState());
		var message;
		if(feedback.getSuccess()){
			message = "<font color='008B00'>" + feedback.getMessage() + "</font>";
			this.setChoicesDraggable(false);
			//document.getElementById('checkAnswerButton').className = 'disabledLink';
			$('#checkAnswerButton').parent().addClass('ui-state-disabled');
		} else {
			message = "<font color='8B0000'>" + feedback.getMessage() + "</font>";
			
			//display which attempt number was just attempted
			this.displayPreviousAttemptNumber();
		}
		document.getElementById("feedbackDiv").innerHTML = message;
	} else {
		//we are showing feedback
		
		var state = this.getState();
		
		//check the buckets to see if the student correctly answered the question
		var checkBucketAnswerResults = this.checkBucketAnswers();
		
		//get the results from checking the buckets
		var feedbackHTMLString = checkBucketAnswerResults.feedbackHTMLString;
		var numWrongChoices = checkBucketAnswerResults.numWrongChoices;
		var numCorrectChoices = checkBucketAnswerResults.numCorrectChoices;
		
		// update feedback div
		var feedbackDiv = document.getElementById("feedbackDiv");
		
		//clear the previous feedback
		feedbackDiv.innerHTML = "&nbsp";
		
		if (numWrongChoices == 0) {
			//the student answered correctly
			state.isCorrect = true;
			
			//display which attempt number was just attempted
			this.displayPreviousAttemptNumber();
			
			//the student answered correctly so we will congratulate them
			this.displayCompletionMessage();
			
			//check if scoring is enabled
			if(this.isChallengeScoringEnabled()) {
				//get the score
				var currentScore = this.getScore(this.attempts.length);
				
				if(state != null) {
					//set the score into the state
					state.score = currentScore;				
				}
			}
		} else {
			//the student answered incorrectly
			state.isCorrect = false;
			
			//check if scoring is enabled
			if(this.isChallengeScoringEnabled()) {
				if(state != null) {
					state.score = 0;
				}
			}
			
			//display which attempt number was just attempted
			this.displayPreviousAttemptNumber();
			
			var totalNumChoices = numCorrectChoices + numWrongChoices;
			feedbackDiv.innerHTML = this.view.getI18NStringWithParams("correct_feedback",[numCorrectChoices,totalNumChoices],"MatchSequenceNode");
			
			if(this.challengeEnabled()) {
				//display the linkto so the student can visit the associated step
				if(this.content.assessmentItem.interaction.attempts != null) {
					var challengeSettings = this.content.assessmentItem.interaction.attempts; 
					var msg = '<b>'+this.view.getI18NString("please_review","MatchSequenceNode") + " ";
					var nodeId = challengeSettings.navigateTo;
					var linkNode = this.node.view.getProject().getNodeById(challengeSettings.navigateTo);
					var stepNumberAndTitle = this.node.view.getProject().getStepNumberAndTitle(challengeSettings.navigateTo);
					
					/* create the linkTo and add it to the message */
					var linkTo = {key:this.node.utils.generateKey(),nodeIdentifier:nodeId};
					this.node.addLink(linkTo);
					msg += '<a style=\"color:blue;text-decoration:underline;font-weight:bold;cursor:pointer\" onclick=\"node.linkTo(\'' + linkTo.key + '\')\">'+this.view.getI18NString("please_review_step","MatchSequenceNode") + "&nbsp;"+ stepNumberAndTitle + '</a>&nbsp;' +this.view.getI18NString("please_review_before_trying_again","MatchSequenceNode") +' </b>';
					
					//create the args to pass to the tag map constraint
					var additionalFunctionArgs = {
						mustVisitNodeId:challengeSettings.navigateTo,
						createTime:Date.parse(new Date()),
						mustVisitAfterCreateTime:true
					};
					
					//create the constraint to make the student visit the navigateTo step
					this.view.addActiveTagMapConstraint(this.node.id, null, 'mustVisitXBefore', null, additionalFunctionArgs);
					
					/*
					 * the student answered incorrectly so we will make the 
					 * background yellow since we will also be highlighting
					 * the associated step in the menu yellow
					 */
					var msgHTML = "<table style='background-color:yellow' align='center'><tr><td>" + msg + "</td></tr></table>";
					
					//display the linkto message and link to the student
					$('#resultMessageDiv').html(msgHTML);
					
					//disable the check answer button
					$('#checkAnswerButton').parent().addClass('ui-state-disabled');
					
					//do not allow the submit button to be enabled
					this.allowEnableSubmitButton = false;
				}
			}
		}
		
		//check if there are any scores enabled for this challenge question
		if(this.isChallengeScoringEnabled()) {
			this.displayCurrentPossibleScoreTable(numWrongChoices);
		}
		
		//fire the event to push this state to the global view.states object
		this.view.pushStudentWork(this.node.id, state.getJsonifiableState());
	};
	
	// check to see if we need to disable the step from further interactivity by checking if student has exhausted number of attempted allowed
	if (this.numSubmitsAllowedBeforeLock != -1) {
		if (this.attempts.length == this.numSubmitsAllowedBeforeLock) {
			this.node.disableInteractivity(true, this.view.getI18NString("step_completed","MatchSequenceNode"));
		}
	}
};

/**
 * Display the current possible score table
 */
MS.prototype.displayCurrentPossibleScoreTable = function(numWrongChoices) {
	
	//check if there is an attempts object
	if(this.content.assessmentItem.interaction.attempts != null) {
		//get the scores
		var scores = this.content.assessmentItem.interaction.attempts.scores;
		
		//get the number of attempts the student has made
		var numAttempts = this.attempts.length;
		
		if(numWrongChoices != null && numWrongChoices != 0) {
			/*
			 * the student has not answered the question correctly so their
			 * possible current possible score is if they answer it on their
			 * next attempt
			 */ 
			numAttempts += 1;
		}
		
		//get the current possible score table
		var scoreMessage = getCurrentPossibleScoreTable(numAttempts, scores);
		
		//display the score
		$('#scoreDiv').html(scoreMessage);	
	}
};

/**
 * Check if the student put all the correct items in the correct buckets
 */
MS.prototype.checkBucketAnswers = function(initialRenderCheck) {
	var state = this.getState();   // state is a MSSTATE instance
	// clean out old feedback
	for (var i=0; i < state.buckets.length; i++) {
		var bucket = state.buckets[i];
		var feedbackDivElement = document.getElementById('feedbackdiv_'+bucket.identifier);
		feedbackDivElement.innerHTML = "";  // clean out old feedback
	}
	
	var numCorrectChoices = 0;
	var numWrongChoices = 0;
	var numUnusedChoices = state.sourceBucket.choices.length;
	
	//loop through all the choices in the source bucket
	for(var x=0; x<state.sourceBucket.choices.length; x++) {
		//get a source choice
		var sourceBucketChoice = state.sourceBucket.choices[x];
		
		if(!initialRenderCheck) {
			//make the source choice incorrect
			removeClassFromElement(sourceBucketChoice.identifier, "correct");
			removeClassFromElement(sourceBucketChoice.identifier, "wrongorder");																			
			addClassToElement(sourceBucketChoice.identifier, "incorrect");				
		}
	}
	
	//loop through all the target buckets
	for (var i=0; i < state.buckets.length; i++) {
		var bucket = state.buckets[i];
		var feedbackDivElement = document.getElementById('feedbackdiv_'+bucket.identifier);
		var feedbackHTMLString = "";
		
		//loop through all the choices in the target bucket
		for (var j=0; j < bucket.choices.length; j++) {
			// get feedback object for this choice in this bucket
			var feedback = this.getFeedback(bucket.identifier,bucket.choices[j].identifier,j);
			
			if (feedback) {
				if (feedback.isCorrect) {
					removeClassFromElement(bucket.choices[j].identifier, "incorrect");						
					removeClassFromElement(bucket.choices[j].identifier, "wrongorder");						
					addClassToElement(bucket.choices[j].identifier, "correct");
					feedbackHTMLString += "<li class=\"feedback_li correct\">"+ bucket.choices[j].text + ": " + feedback.feedback +"</li>";
					numCorrectChoices++;
				} else {
					removeClassFromElement(bucket.choices[j].identifier, "correct");
					removeClassFromElement(bucket.choices[j].identifier, "wrongorder");																			
					addClassToElement(bucket.choices[j].identifier, "incorrect");					
					//removeClassFromElement("resetWrongChoicesButton", "disabledLink");
					feedbackHTMLString += "<li class=\"feedback_li incorrect\">"+ bucket.choices[j].text + ": " + feedback.feedback +"</li>";
					numWrongChoices++;
				}
			} else {/* it could be that there is no feedback because it is in the wrong order */
				if (this.content.assessmentItem.interaction.ordered && this.isInRightBucketButWrongOrder(bucket.identifier,bucket.choices[j].identifier,j)) {   // correct bucket, wrong order
					removeClassFromElement(bucket.choices[j].identifier, "correct");												
					removeClassFromElement(bucket.choices[j].identifier, "incorrect");												
					addClassToElement(bucket.choices[j].identifier, "wrongorder");						
					feedbackHTMLString += "<li class=\"feedback_li wrongorder\">"+ bucket.choices[j].text + ": "+this.view.getI18NString("correct_box_wrong_order","MatchSequenceNode")+"</li>";
					numWrongChoices++;
				} else {/* this should never be the case, but it could be that no default feedback was created */
					removeClassFromElement(bucket.choices[j].identifier, "correct");												
					removeClassFromElement(bucket.choices[j].identifier, "wrongorder");												
					addClassToElement(bucket.choices[j].identifier, "incorrect");						
					feedbackHTMLString += "<li class=\"feedback_li incorrect\">"+ bucket.choices[j].text + ": " + this.view.getI18NString("no_feedback","MatchSequenceNode") +"</li>";
					numWrongChoices++;
				}
			}
		}
		
		if (feedbackHTMLString != "") {
			feedbackDivElement.innerHTML = "<ul class=\"feedback_ul\">"+ feedbackHTMLString + "</ul>";
		}
	}
	
	//add the number of unused choices to the number of wrong choices
	numWrongChoices += numUnusedChoices;
	
	//create an object with all the values we will need to look at
	var returnObject = {
		numWrongChoices:numWrongChoices,
		numCorrectChoices:numCorrectChoices,
		feedbackHTMLString:feedbackHTMLString
	};
	
	return returnObject;
};

/**
 * Display the message when the student answers correctly
 */
MS.prototype.displayCompletionMessage = function() {
	var resultMessageDiv = document.getElementById("resultMessageDiv");
	var resultMessage = this.view.getI18NString("all_completed_msg","MatchSequenceNode");
	
	//check if scoring is enabled
	if(this.isChallengeScoringEnabled()) {
		//display the score they received
		var currentScore = this.getScore(this.attempts.length);
		resultMessage += this.view.getI18NStringWithParams("you_received_x_points",[currentScore],"MatchSequenceNode");
	}
	
	//set the message into the div
	resultMessageDiv.innerHTML = resultMessage;
	
	//disable moving of the items
	this.setChoicesDraggable(false);
	
	//disable the check answer button
	$('#checkAnswerButton').parent().addClass('ui-state-disabled');
};

/**
 * Check if challenge is enabled by checking if there is a linkTo step
 * @returns whether challenge is enabled
 */
MS.prototype.challengeEnabled = function() {
	var enabled = false;
	
	if(this.content.assessmentItem.interaction.attempts != null) {
		var navigateTo = this.content.assessmentItem.interaction.attempts.navigateTo;
		
		if(navigateTo != null && navigateTo != "") {
			/*
			 * get the navigateToPosition to make sure the navigateTo step is in the project.
			 * steps that are inactive will not have a position, so as long as getPositionById()
			 * returns a non null value, we know that step is an active step in the project.
			 */
			var navigateToPosition = this.node.view.getProject().getPositionById(navigateTo);
			
			if(navigateToPosition != null) {
				//the navigateTo field has been set which means challenge is enabled
				enabled = true;				
			}
		}
	}
	
	return enabled;
};

/**
 * Determine if challenge question is enabled
 */
MS.prototype.isChallengeEnabled = function() {
	var isChallengeQuestion = false;
	
	if(this.content.assessmentItem.interaction.attempts != null &&
			this.content.assessmentItem.interaction.attempts.navigateTo != null &&
			this.content.assessmentItem.interaction.attempts.navigateTo != "") {
		/*
		 * get the navigateToPosition to make sure the navigateTo step is in the project.
		 * steps that are inactive will not have a position, so as long as getPositionById()
		 * returns a non null value, we know that step is an active step in the project.
		 */
		var navigateToPosition = this.node.view.getProject().getPositionById(this.content.assessmentItem.interaction.attempts.navigateTo);
		
		if(navigateToPosition != null) {
			//the navigateTo field has been set which means challenge is enabled
			isChallengeQuestion = true;				
		}
	}
	
	return isChallengeQuestion;
};

/**
 * Determine if scoring is enabled
 */
MS.prototype.isChallengeScoringEnabled = function() {
	var result = false;
	
	if(this.content.assessmentItem.interaction.attempts != null) {
		var scores = this.content.assessmentItem.interaction.attempts.scores;
		
		result = challengeScoringEnabled(scores);
	}
	
	return result;
};

/**
 * Get the score given the number attempts the students has made
 * @return the score for the student depending on the number attempts
 * they have made
 */
MS.prototype.getScore = function(numAttempts) {
	var score = 0;
	
	if(this.content.assessmentItem.interaction.attempts != null) {
		//get the scores object
		var scores = this.content.assessmentItem.interaction.attempts.scores;
		
		score = getCurrentScore(numAttempts, scores);
	}
	
	return score;
};

/**
 * Returns true if the choice is in the right bucket but is in wrong order
 * in that bucket.
 */
MS.prototype.isInRightBucketButWrongOrder = function(bucketIdentifier, choiceIdentifier, choiceOrderInBucket) {
	var isInRightBucketAndRightOrder = false;
	var isInRightBucket = false;
	for (var i=0; i < this.feedbacks.length; i++) {
		if (this.content.assessmentItem.interaction.ordered) {
			if (this.feedbacks[i].fieldIdentifier == bucketIdentifier &&
					this.feedbacks[i].choiceIdentifier == choiceIdentifier &&
					this.feedbacks[i].order == choiceOrderInBucket && 
					this.feedbacks[i].isCorrect) {
				isInRightBucketAndRightOrder = true;
			} else if (this.feedbacks[i].fieldIdentifier == bucketIdentifier &&
					this.feedbacks[i].choiceIdentifier == choiceIdentifier &&
					this.feedbacks[i].isCorrect &&
					this.feedbacks[i].order != choiceOrderInBucket) {
				isInRightBucket = true;
			};
		};
	};
	return isInRightBucket && !isInRightBucketAndRightOrder;
};

/**
 * Returns FEEDBACK object based for the specified choice in the
 * specified bucket
 * choiceOrderInBuckets is integer representing which order the choice is in
 * within its bucket.
 */
MS.prototype.getFeedback = function(bucketIdentifier, choiceIdentifier,choiceOrderInBucket) {
	for (var i=0; i < this.feedbacks.length; i++) {
		if (this.content.assessmentItem.interaction.ordered) {
			if (this.feedbacks[i].fieldIdentifier == bucketIdentifier &&
					this.feedbacks[i].choiceIdentifier == choiceIdentifier &&
					this.feedbacks[i].order == choiceOrderInBucket) {
				return this.feedbacks[i];
			} else if (this.feedbacks[i].fieldIdentifier == bucketIdentifier &&
					this.feedbacks[i].choiceIdentifier == choiceIdentifier &&
					!this.feedbacks[i].isCorrect) {
				return this.feedbacks[i];
			}
		} else {
			if (this.feedbacks[i].fieldIdentifier == bucketIdentifier &&
					this.feedbacks[i].choiceIdentifier == choiceIdentifier) {
				return this.feedbacks[i];
			}
		}
    }
    return null;
}

/**
 * enables or disables dragging of all choices
 */
MS.prototype.setChoicesDraggable = function(setDraggable) {
	if (setDraggable) {
		for (var i = 0; i < ddList.length; i++) {
			ddList[i].set("lock", false);
		}
	} else {
		for (var i = 0; i < ddList.length; i++) {
			ddList[i].set("lock", true);
		}
	}
}

/**
 * Resets to original state
 */
MS.prototype.reset = function() {
	//removeClassFromElement("checkAnswerButton", "disabledLink");
	$('#checkAnswerButton').parent().removeClass('ui-state-disabled');
	this.render();
}

/**
 * Resets to original state
 */
MS.prototype.resetWrongChoices = function() {
	var isResetWrongChoicesDisabled = $('#resetWrongChoicesButton').parent().hasClass('ui-state-disabled'); //hasClass("resetWrongChoicesButton", "disabledLink");

	if (isResetWrongChoicesDisabled) {
		return;
	}
	
	//removeClassFromElement("checkAnswerButton", "disabledLink");
	$('#checkAnswerButton').parent().removeClass('ui-state-disabled');
	this.node.view.notificationManager.notify('not implemented yet, will reset all answers for now',3);
	
	this.render();
}

/**
 * Create a MSSTATE and save it to the node visit
 * @return
 */
MS.prototype.saveState = function() {
	if(this.logLevel == "high") {
		//get the current state
		var state = this.getState();
		
		//fire the event to push this state to the global view.states object
		this.view.pushStudentWork(this.node.id, state.getJsonifiableState());
	}
};

/**
 * Enables the check answer button 
 */
MS.prototype.enableCheckAnswerButton = function() {
	//removeClassFromElement("checkAnswerButton", "disabledLink");
	$('#checkAnswerButton').parent().removeClass('ui-state-disabled');
	
	if(this.showFeedback) {
		var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_attempt_x",[this.attempts.length+1],"MatchSequenceNode");
		$("#numberAttemptsDiv").html(numberAttemptsMessage);

		//displayNumberAttempts("This is your", "attempt", this.attempts);
	}
};

/**
 * Whether the submit button is allowed to be enabled. The submit button
 * is not allowed to be enabled when this step is a challenge question
 * and the student has answered incorrectly.
 * @returns whether the submit button can be enabled
 */
MS.prototype.canSubmitButtonBeEnabled = function() {
	return this.allowEnableSubmitButton;
};

/**
 * Displays what attempt number the student is about to submit
 * e.g.
 * "This is your 2nd attempt"
 */
MS.prototype.displayCurrentAttemptNumber = function() {
	var numAttempts = this.attempts.length + 1;
	//displayNumberAttemptsMessage("This is your", "attempt", numAttempts);
	
	var numberAttemptsMessage = this.view.getI18NStringWithParams("this_is_attempt_x",[numAttempts],"MatchSequenceNode");
	$("#numberAttemptsDiv").html(numberAttemptsMessage);
};

/**
 * Displays what attempt number the student has just attempted
 * e.g.
 * "This was your 2nd attempt"
 */
MS.prototype.displayPreviousAttemptNumber = function() {
	var numAttempts = this.attempts.length;
	//displayNumberAttemptsMessage("This was your", "attempt", numAttempts);
	
	var numberAttemptsMessage = this.view.getI18NStringWithParams("this_was_attempt_x",[numAttempts],"MatchSequenceNode");
	$("#numberAttemptsDiv").html(numberAttemptsMessage);
};


/**
 * No longer used. Replaced by "this is attempt #x" format as it's easier to translate.
 * Displays the number of attempts message e.g.
 * "This is your 2nd attempt."
 * @param part1 the beginning of the message e.g. "This is your"
 * @param part2 the end of the message e.g. "attempt"
 * @param numAttempts the number of attempts
 */
function displayNumberAttemptsMessage(part1, part2, numAttempts) {
	//get the message
	var numberAttemptsMessage = getNumberAttemptsMessage(part1, part2, numAttempts);
	
	//set the message in the div
	$("#numberAttemptsDiv").html(numberAttemptsMessage);
}

/**
 * Make the number of attempts message e.g.
 * "This is your 2nd attempt."
 * @param part1 the beginning of the message e.g. "This is your"
 * @param part2 the end of the message e.g. "attempt"
 * @param numAttempts the number of attempts
 * @returns the number of attempts message string
 */
function getNumberAttemptsMessage(part1, part2, numAttempts) {
	var attemptsMessage = "";
	
	if(numAttempts == null) {
		
	} else if (numAttempts == 1) {
		attemptsMessage = "1st";		
	} else if (numAttempts == 2) {
		attemptsMessage = "2nd";		
	} else if (numAttempts == 3) {
		attemptsMessage = "3rd";		
	} else {
		attemptsMessage = numAttempts + "th";		
	}

	var numAttemptsDivHtml = part1 + " " + attemptsMessage + " " + part2 +".";
	return numAttemptsDivHtml;
};

/**
 * Get the max possible score the student can receive for this step
 * @returns the max possible score
 */
MS.prototype.getMaxPossibleScore = function() {
	var maxScore = null;
	
	if(this.content.assessmentItem.interaction.attempts != null) {
		//get the scores object
		var scores = this.content.assessmentItem.interaction.attempts.scores;
		
		if(scores != null) {
			//get the max score
			maxScore = getMaxScore(scores);
		}
	}
	
	return maxScore;
};

/**
 * Remove all the choices from all the buckets
 */
MS.prototype.clearBuckets = function() {
	//loop through the target buckets
	for(var x=0; x<this.buckets.length; x++) {
		//get a bucket
		var bucket = this.buckets[x];
		
		if(bucket != null) {
			//empty the bucket
			this.buckets.choices = [];
		}
	}
};

/**
 * Process the tag maps and obtain the results
 * @return an object containing the results from processing the
 * tag maps. the object contains three fields
 * enableStep
 * message
 * workToImport
 */
MS.prototype.processTagMaps = function() {
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
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/matchsequence.js');
};