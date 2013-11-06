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
 * STATE
 *   buckets
 * @constructor
 */
function MSSTATE() {
	this.type = "ms";
	this.sourceBucket = null;
    this.buckets = [];
    this.score = null;
    this.isCorrect = null;
}

/**
 * Get the student work
 * @returns this object
 */
MSSTATE.prototype.getStudentWork = function() {
	return this;
};

/**
 * Create a MSSTATE that we can jsonify. This means removing
 * cycling references such as the the choices pointing to
 * the bucket that they are in, and the bucket pointing
 * to the choices that are in it
 * @return
 */
MSSTATE.prototype.getJsonifiableState = function() {
	//make a new MSSTATE
	var msState = new MSSTATE();
	
	//set the buckets into our new MSSTATE
	msState.buckets = this.buckets;
	
	//loop through all the buckets
	for(var x=0; x<msState.buckets.length; x++) {
		//get a bucket
		var bucket = msState.buckets[x];
		
		//loop through all the choices that are in the bucket
		for(var y=0; y<bucket.choices.length; y++) {
			//get a choice
			var choice = bucket.choices[y];
			
			//remove the reference to the bucket
			choice.bucket = null;
		}
	}
	
	msState.sourceBucket = this.sourceBucket;
	//loop through all the choices that are in the source bucket
	for(var i=0; i<msState.sourceBucket.choices.length; i++) {
		//get a choice in the source bucket
		var sourceBucketChoice = msState.sourceBucket.choices[i];
		
		//remove the reference to the bucket
		sourceBucketChoice.bucket = null;
	}

	
	if(this.score != null) {
		//set the score if available
		msState.score = this.score;
	}
	
	if(this.isCorrect != null) {
		//set isCorrect
		msState.isCorrect = this.isCorrect;
	}
	
	//return the MSSTATE
	return msState;
};

/**
 * Creates a MSSTATE from the stateJSONObj
 * @param stateJSONObj a JSON object representing a MSSTATE
 * @return a populated MSSTATE
 */
MSSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
	//create a new MSSTATE object
	var msState = new MSSTATE();

	//get the buckets from the json
	msState.buckets = stateJSONObj.buckets;

	//get the source bucket from the json
	msState.sourceBucket = stateJSONObj.sourceBucket;

	//get the score from the json
	msState.score = stateJSONObj.score;
	
	//get whether the state is correct
	msState.isCorrect = stateJSONObj.isCorrect;
	
	//return the MCSTATE object
	return msState;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/matchsequencestate.js');
}