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
 * MatchSequence Bucket object
 *
 * SAMPLE bucketDOM:
 *   <gapMultiple identifier="yes" ordinal="false" numberOfEntries="0">&lt;html&gt;&lt;body class="slot"&gt;Items that contain one or more computers:)&lt;/body&gt;&lt;/html&gt;</gapMultiple>
 * @constructor
 */
function MSBUCKET(view,bucketObj) {
  if (bucketObj) {
    this.isTargetBucket = true;
    this.obj = bucketObj;
    this.identifier = this.obj.identifier;
    this.text = this.obj.name;   // bucket header that students will see, can be html
    this.choices = [];
  } else {
    this.isTargetBucket = false;
    this.identifier = "sourceBucket";
    this.text = view.getI18NString("choices","MatchSequenceNode");
    this.choices = [];
  }
}

/**
 * Shuffles the choices in the bucket
 */
MSBUCKET.prototype.shuffle = function(){
	this.choices.shuffle();
};

/**
 * If prototype 'shuffle' for array is not found, create it
 */
if(!Array.shuffle){
	Array.prototype.shuffle = function (){ 
        for(var rnd, tmp, i=this.length; i; rnd=parseInt(Math.random()*i), tmp=this[--i], this[i]=this[rnd], this[rnd]=tmp);
    };
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/matchsequencebucket.js');
}