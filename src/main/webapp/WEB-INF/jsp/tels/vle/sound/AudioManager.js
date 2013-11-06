/**
 * The AudioManager will loop through all of the audio associated with the currently-rendered node in sequence. It is assumed
 * that the node-to-audio(s) association has happened already at VLE start-up.
 * 
 * There are three main controls:
 * 1) play/pause button
 * 			Plays or pauses current sound.
 * 2) rewind button
 * 			Single Click: rewinds to the beginning of the currently-playing audio
 *   		Double Click: rewinds to the previous audio.  If this is the first audio in the sequence, 
 *   			it rewinds to the beginning of the currently-playing audio.
 * 			When there is no pre-associated audio for this step, this button is disabled.
 * 3) forward button
 * 			Single Click: plays the next audio in the sequence. If this is the last audio in the sequence, stops playing.
 * 			When there is no pre-associated audio for this step, this button is disabled.
 */
function AudioManager(isPlaying, view) {
	this.view = view;
	this.currentSound = null;
	this.isPlaying = false;
	this.isSoundManagerLoaded = false;
	this.currentNode = null;
	this.postReportUrl = null;
	//this.postReportUrl = "http://veritas.eecs.berkeley.edu/voices/dottsAPCSA.php?save_dirname=2";

	if (isPlaying != null) {
		if (isPlaying != "true") {
			this.isPlaying = false;
		} else {
			this.isPlaying = true;
		}
	}
}

/**
 * Creates sound for the given nodeAudioElement, and prepared the 
 * created sound for to be played by setting it in the node.audios
 */
AudioManager.prototype.createSoundFromAudioElement = function(nodeAudioElement, node) {

	if (soundManager.canPlayURL(nodeAudioElement.url)) {
		var success = function() {
			// found audio using the audio="filename".  make this the audio
			//notificationManager.notify('success getting audio using audio=filename. o.responseText: ' + o.responseText, 4);
			nodeAudioElement.audio = 
				 soundManager.createSound( {
						id : nodeAudioElement.id,
						url : nodeAudioElement.url,
						onplay : function() {onPlayCallBack(this,node);},
						whileplaying : function() {whilePlayingCallBack(this, node);},
						onpause : function() {onPauseCallBack(this, node);},
						onfinish : function() {onFinishCallBack(this,node);},
						onload: function(loadSuccess) {
							if (!loadSuccess) {  // couldn't find mp3 file. try to load md5 hash
								if (this.readyState == 3) {
									// sometimes flash mistakingly thinks load failed because it's loading mp3 from cache
									// see SoundObject's onload() on this page: http://www.schillmania.com/projects/soundmanager2/doc/#smsoundmethods
								} else {
									notificationManager.notify('error loading audio #1');
								}
							}
						},
						onstop: function() {onStopCallBack(this,node);}
					});
			nodeAudioElement.audio.elementId = nodeAudioElement.elementId;
			nodeAudioElement.audio.index = nodeAudioElement.index;
			this.doEnableButtons(true);
			this.currentNode.audios[nodeAudioElement.index] = nodeAudioElement.audio;
			if (this.isPlaying && nodeAudioElement.index == 0) {
				this.currentSound = nodeAudioElement.audio;
				this.currentSound.play();
			}
		};
		
		var success_md5 = function() {
			notificationManager.notify('success getting md5 audio', 4);
			nodeAudioElement.audio = 
				soundManager.createSound( {
					id : nodeAudioElement.id,
					url : nodeAudioElement.md5url,
					onplay : function() {onPlayCallBack(this,node);},
					whileplaying : function() {whilePlayingCallBack(this, node);},
					onpause : function() {onPauseCallBack(this, node);},
					onfinish : function() {onFinishCallBack(this,node);},
					onstop: function() {onStopCallBack(this,node);},
					onload: function(success) {
						if (!success) {  // couldn't find mp3 file. try to load md5 hash
							if (this.readyState == 3) {
								// sometimes flash mistakingly thinks load failed because it's loading mp3 from cache
								// see SoundObject's onload() on this page: http://www.schillmania.com/projects/soundmanager2/doc/#smsoundmethods
							} else {
								notificationManager.notify('error loading audio #2');
							}
						}
					}
				});
			nodeAudioElement.audio.elementId = nodeAudioElement.elementId;
			nodeAudioElement.audio.index = nodeAudioElement.index;
			//this.doEnableButtons(true);
			this.currentNode.audios[nodeAudioElement.index] = nodeAudioElement.audio;
			if (this.isPlaying && nodeAudioElement.index == 0) {
				this.currentSound = nodeAudioElement.audio;
				this.currentSound.play();
			}
		};
		
		var failure = function() {
			// could not find the audio using the audio="filename"
			// so now go find the MD5 file
			//notificationManager.notify('failure getting audio using audio=filename. o.responseText:' + o.responseText, 4);
			
			var success_md5 = function() {
				notificationManager.notify('success getting md5 audio', 4);
				nodeAudioElement.audio = 
					soundManager.createSound( {
						id : nodeAudioElement.id,
						url : nodeAudioElement.md5url,
						onplay : function() {onPlayCallBack(this,node);},
						whileplaying : function() {whilePlayingCallBack(this, node);},
						onpause : function() {onPauseCallBack(this, node);},
						onfinish : function() {onFinishCallBack(this,node);},
						onstop: function() {onStopCallBack(this,node);},
						onload: function(success) {
							if (!success) {  // couldn't find mp3 file. try to load md5 hash
								if (this.readyState == 3) {
									// sometimes flash mistakingly thinks load failed because it's loading mp3 from cache
									// see SoundObject's onload() on this page: http://www.schillmania.com/projects/soundmanager2/doc/#smsoundmethods
								} else {
									notificationManager.notify('error loading audio #2');
								}
							}
						}
					});
				nodeAudioElement.audio.elementId = nodeAudioElement.elementId;
				nodeAudioElement.audio.index = nodeAudioElement.index;
				this.doEnableButtons(true);
				this.currentNode.audios[nodeAudioElement.index] = nodeAudioElement.audio;
				if (this.isPlaying && nodeAudioElement.index == 0) {
					this.currentSound = nodeAudioElement.audio;
					this.currentSound.play();
				}
			};
			
			var failure_md5 = function() {
				// could not find the audio using the md5 hash
				// so use the default audio file
				notificationManager.notify('failure getting md5 audio, resorting to default', 4);
				nodeAudioElement.audio = 
					soundManager.createSound( {
						id : nodeAudioElement.id,
						url : 'sound/NoAudioAvailable.mp3',
						onplay : function() {onPlayCallBack(this,node);},
						whileplaying : function() {whilePlayingCallBack(this, node);},
						onpause : function() {onPauseCallBack(this, node);},
						onfinish : function() {onFinishCallBack(this,node);},
						onstop: function() {onStopCallBack(this,node);},
						onload: function(success) {
						}
					});
				nodeAudioElement.audio.elementId = nodeAudioElement.elementId;
				nodeAudioElement.audio.index = nodeAudioElement.index;
				this.doEnableButtons(true);
				this.currentNode.audios[nodeAudioElement.index] = nodeAudioElement.audio;
				if (this.isPlaying && nodeAudioElement.index == 0) {
					this.currentSound = nodeAudioElement.audio;
					this.currentSound.play();
				}
				// send message to server about this
				if (this.postReportUrl != null) {
					var jsonStr = $.stringify(nodeAudioElement, ["id", "url", "elementId", "elementTextContent", "md5url", "index"]);				
					var callback_post_audio = function() {};
					var postRequestParam = "save_mp3=1&make_audio=true&speech=[" + jsonStr +"]";    
					alert('error!');
					$.ajax({type:'POST', url:this.postReportUrl, error:callback_post_audio, success:callback_post_audio});									       
				}
			};	
			
			$.ajax({type:'HEAD', url:nodeAudioElement.md5url, error:failure_md5, success:success_md5, context:this});	
		};
		
		$.ajax({type:'HEAD',url:nodeAudioElement.md5url, error:failure, success:success_md5, context:this});			
	} 
};

/**
 * Prepares this to play audio associated with this node.
 * If this.isPlaying is true, starts playing
 * hm, often this happens before main.js runs, which generates the audio header. sigh.
 */
AudioManager.prototype.setCurrentNode = function(node) {
	if (this.currentSound != null) { 
		// stop currently-playing audio
		this.currentSound.stop(); 
		this.currentSound = null; 
	}
	
	this.currentNode = node;
	if (!this.currentNode.audios || this.currentNode.audios == null) {
		this.currentNode.audios = [];
	}

	var audioElements = $("[audio]", this.currentNode.contentPanel.document);
	// nate -- wtf?  Need to do a 
	if (audioElements == null || audioElements.length == 0) {
		audioElements = $("[audio]", this.currentNode.contentPanel.document);
	}
	
	// NATE: we want to sort this based on the audio parameter value(if present), really.
	// $(audioElements).get().sort(function(a,b) { 
	//         var aval = a.getAttribute("audio");
	//         bval = b.getAttribute("audio");
	//         return (aval > bval ? 1 : -1);
	//         });
	var nodeAudioElements = [];
	for (var k=0;k<audioElements.length;k++) {
		var audioElement = audioElements[k];
		var sText = $(audioElement).text();
		var audioText = normalizeHTML($(audioElement).text());
//		var audioText = $(audioElement).text();
		var audioElementId = $(audioElement).attr("audio");
		var audioTextMD5 = MD5(audioText);
		// NATE!!  / ugg, this should be centralized...
		var contentBaseUrl; 
		if (node.ContentBaseUrl) {
		    contentBaseUrl = node.ContentBaseUrl;
		} else {
		    contentBaseUrl = node.view.getConfig().getConfigParam('getContentBaseUrl');
		}
		var audioBaseUrl = contentBaseUrl + "/audio"; 
		var audioUrl = audioBaseUrl + "/audio_"+audioTextMD5+".mp3";
		var nodeAudioId = this.currentNode.id + "." + audioElementId;
		var nodeAudioElement = new NodeAudio(
				nodeAudioId,
				audioUrl,
				audioElementId,
				audioText,
				audioUrl,
				k
				);
		nodeAudioElements.push(nodeAudioElement);
	}
	//var nodeAudioElements = this.view.nodeAudioMap[this.currentNode.id];
	if (nodeAudioElements && nodeAudioElements.length > 0) {
		for ( var i = 0; i < nodeAudioElements.length; i++) {
			this.createSoundFromAudioElement(nodeAudioElements[i], node);
		}
		this.currentSound = this.currentNode.audios[0];
		this.doEnableButtons(true);
	} else {  
		// no audio tags exist for this node.
		notificationManager.notify("no pre-associated audio exists for this node", 4);
		var sound = soundManager.createSound( {
			id : 'NoAudioAvailable',
			url : 'sound/NoAudioAvailable.mp3',
			whileplaying : function() {whilePlayingCallBack(this, node);}
		});
		this.currentSound = sound;
		// disable forward/rewind buttons for this node.
		this.doEnableButtons(false);
	}	
};

// Nate: unused?
AudioManager.prototype.playMD5Audio = function(sound, node) {
	notificationManager.notify('playmd5audio, id:' + sound.id, 4);
	//soundManager.stopAll();
	//soundManager.stop(sound.id);
	var backupSound = soundManager.getSoundById('md5_'+sound.id);
	soundManager.play('md5_'+sound.id);
	
	this.currentSound = backupSound;
	
	// update node.audios
	for (var i=0; i<node.audios.length;i++) {
		if (node.audios[i].id == sound.id) {
			node.audios[i].id = backupSound.id;
			node.audios[i].audio = backupSound;
		}
	}
};

// Nate: unused?
AudioManager.prototype.playBackupAudio = function(sound, node) {
	notificationManager.notify('playbackupaudio, id:' + sound.id, 4);
	soundManager.stop(sound.id);
	//soundManager.stop(sound.id);
	var backupSound = soundManager.getSoundById('backup_'+sound.id);
	soundManager.play('backup_'+sound.id);
	
	this.currentSound = backupSound;
	
	// update node.audios
	for (var i=0; i<node.audios.length;i++) {
		if (node.audios[i].id == sound.id) {
			node.audios[i].id = backupSound.id;
			node.audios[i].audio = backupSound;
		}
	}
};

/**
 * Enables or disables the rewind/forward buttons.
 * @param doEnable true iff the buttons should be enabled.
 */
AudioManager.prototype.doEnableButtons = function(doEnable) {
	if (doEnable) {
		notificationManager.notify("enabling buttons", 4);
	 	document.getElementById("rewindButton").onclick = function() {view.rewindStepAudio();};
		document.getElementById("rewindButton").ondblclick = function() {view.previousStepAudio();};
		document.getElementById("forwardButton").onclick = function() {view.forwardStepAudio();};
		document.getElementById("playPause").onclick = function() {view.playPauseStepAudio();};
	    $('#audioControls').fadeTo(0,1 );  // full opacity.
	} else {
		notificationManager.notify("disabling buttons", 4);
		$('#audioControls a').removeAttr('onclick');
	 	//document.getElementById("rewindButton").onclick = "";
		//document.getElementById("rewindButton").ondblclick = "";
		//document.getElementById("forwardButton").onclick = "";
		//document.getElementById("playPause").onclick = "";
		$('#audioControls').fadeTo(500,.33 );  // grey out the contols a bit (1/3 opacity)
	};
};

/**
 * a call-back function triggered when the node's 'onplay' callback is called
 * @param sound currently-playing audio.
 * @param current node that is rendered
 */
var onPlayCallBack = function(sound, currentNode) {
	if (sound.readyState == 3) {
	} else {
		notificationManager.notify('file not ready, play backup', 4);
		//currentNode.view.audioManager.playBackupAudio(this,currentNode);
	}
	
	// update node.audios
	for (var i=0; i<currentNode.audios.length;i++) {
		if (currentNode.audios[i].id == sound.id) {
			currentNode.audios[i].id = sound.id;
			currentNode.audios[i].audio = sound;
		}
	}

};

//a call-back function triggered when the node's 'onstop' callback is called
//@param sound currently-playing audio.
//@param current node that is rendered
var onStopCallBack = function(sound, currentNode) {
	highlightTextElement(sound.elementId, currentNode, false);
	showPlayPauseButton(false);
};

//a call-back function triggered when the node's 'onfinish' callback is called
//@param sound currently-playing audio.
//@param current node that is rendered
var onFinishCallBack = function(sound, currentNode) {
	highlightTextElement(sound.elementId, currentNode, false);
	showPlayPauseButton(false);
	currentNode.view.audioManager.nextStepAudio();
};

// a call-back function triggered when the node's 'whileplaying' callback is called
//@param sound currently-playing audio.
//@param current node that is rendered
var whilePlayingCallBack = function(sound, currentNode) {
	showPlayPauseButton(true);
	highlightTextElement(sound.elementId, currentNode, true);
	currentNode.view.audioManager.currentSound = sound;   // keep updating the currentsound
	currentNode.view.audioManager.currentSoundIndex = sound.index;
};

//a call-back function triggered when the node's 'onpause' callback is called
var onPauseCallBack = function(sound, currentNode) {
	showPlayPauseButton(false);
	//highlightTextElement(sound.elementId, currentNode, false);
};

// changes the play/pause button based on specified isPlaying parameter
// @param isPlaying if true, show the play button. else, show the pause button
function showPlayPauseButton(isPlaying) {
	if (isPlaying) {
		$('#playPause').removeClass('play').addClass('pause');
	} else {
		$('#playPause').removeClass('pause').addClass('play');
	}
};

// highlights the text that is associated with the currently-playing audio.
// @param elementId, id of element within the html page to highlight.
// @param current node that is rendered
// @param doHighlight true iff the specified element should be highlighted.
var highlightTextElement = function(elementId, currentNode, doHighlight) {
	if (currentNode != null	&& currentNode.isAudioSupported()) {
		if (doHighlight) {
			notificationManager.notify("highlighting elementId:" + elementId, 4);
			$("[audio="+elementId+"]",window.frames['ifrm'].document).css("border","3px dotted #CC6633");
		} else {
			notificationManager.notify("unhighlighting elementId:" + elementId, 4);
			$("[audio="+elementId+"]",window.frames['ifrm'].document).css("border","none");
		};
	};
};

// toggles play/pause for the entire AudioManager realm.
AudioManager.prototype.playPauseStepAudio = function() {
	if (this.currentSound == null && this.currentNode) {
		this.currentSound = this.currentNode.audios[0];
	};
	if (this.isPlaying && this.currentSound) {
		this.currentSound.pause();
		this.isPlaying = false;
	} else {
		if (this.currentSound != null) {
			this.currentSound.play();
			this.isPlaying = true;
		};
	};
};



/**
 * Gets the previous sound in the sequence, relative to the currently-playing sound.
 * If the currently-playing sound is the first sound in the sequence, return null
 */
AudioManager.prototype.getPreviousSound = function() {
	if (this.currentSound == null && this.currentNode != null && this.currentNode.audios.length > 0) {
		this.currentSoundIndex = 0;
		return this.currentNode.audios[0];
	} else if (this.currentSound == null && this.currentNode == null) {
		return null;
	}
	var currentSoundId = this.currentSound.sID;
	
	var prevSoundIndex = this.currentSoundIndex - 1;
	if (prevSoundIndex >= 0) {
		this.currentSoundIndex = prevSoundIndex;
		return this.currentNode.audios[this.currentSoundIndex];
	} else {
		this.currentSoundIndex = 0;
		return null;
	}

	// if we're playing a backup, remove the backup_ from front to get original id
	/*
	if (currentSoundId.indexOf('backup_') > -1) {
		notificationManager.notify('playing backup:' + currentSoundId, 4);
		currentSoundId = currentSoundId.substring(7);
	}
	*/
	/*
	for (var i=0; i<this.currentNode.audios.length;i++) {
		if (this.currentNode.audios[i].id == currentSoundId) {
			if (i == 0) {   // the current sound is the first sound in the sequence
				return null;
			} else {
				return this.currentNode.audios[i-1].audio;
			};
		};
	};
	*/
};

/**
 * Rewinds the currently-playing audio to the beginning of the audio.
 * If the currentSound is already at position 0 (ie, at the beginning), go 
 * to previous audio.
 */
AudioManager.prototype.rewindStepAudio = function() {
	//notificationManager.notify("Rewind. CurrentSound:" + currentNode.view.audioManager.currentSound.sID + "," + currentNode.view.audioManager.currentSound.position, 4);
	if (this.currentSound.position == 0 && this.getPreviousSound() != null) {
		this.previousStepAudio();
	} else {
		this.currentSound.setPosition(0);
	};
};

/**
 * Sets the currentSound to the currentSound's previous sound in sequence.
 * If currentSound is the first sound in the sequence, simply rewind to the beginning of the audio
 */
AudioManager.prototype.previousStepAudio = function() {
	//notificationManager.notify("Previous step audio. CurrentSound:" + currentNode.view.audioManager.currentSound.sID + "," + currentNode.view.audioManager.currentSound.position, 4);
	soundManager.stopAll(); // first, stop currently-playing audio and remove all highlights
	this.removeAllHighlights();
	var previousSound = this.getPreviousSound();
	if (previousSound == null && this.currentSound != null) {
		this.currentSound.setPosition(0);
		highlightTextElement(this.currentSound.elementId, this.currentNode, true);
		if (this.isPlaying) {
			this.playCurrentSound();
		};
	} else {
		this.currentSound = previousSound;
		if (this.isPlaying) {
			this.playCurrentSound();
		} else {
			highlightTextElement(this.currentSound.elementId, this.currentNode, true);
		};
	};
};

/**
 * Gets the next sound in the sequence, relative to the currently-playing sound.
 * If the currently-playing sound is the last sound in the sequence, return null
 * If the currently playing sound is null, return the first sound for this node
 */
AudioManager.prototype.getNextSound = function() {
	if (this.currentSound == null && this.currentNode != null && this.currentNode.audios.length > 0) {
		return this.currentNode.audios[0];
	} else if (this.currentSound == null && this.currentNode == null) {
		return null;
	}
	var currentSoundId = this.currentSound.sID;
	
	// if we're playing a backup, remove the backup_ from front to get original id
	/*
	if (currentSoundId.indexOf('backup_') > -1) {
		notificationManager.notify('playing backup:' + currentSoundId, 4);
		currentSoundId = currentSoundId.substring(7);
	}
	*/
	notificationManager.notify("getNextSound currentSoundId:" + currentSoundId, 4);
	var nextSoundIndex = this.currentSoundIndex + 1;
	if (nextSoundIndex < this.currentNode.audios.length) {
		this.currentSoundIndex = nextSoundIndex;
		return this.currentNode.audios[this.currentSoundIndex];
	} else {
		this.currentSoundIndex = 0;
		return null;
	}
	/*
	for (var i=0; i<this.currentNode.audios.length;i++) {
		var audioI = this.currentNode.audios[i];
		if (audioI.sID == currentSoundId) {
			if (i == this.currentNode.audios.length - 1) {   // the current sound is the last sound in the sequence
				return null;
			} else {
				var nextIndex = i+1;
				return this.currentNode.audios[nextIndex].audio;
			};
		};
	};
	*/
};

/**
 * Sets the currentSound to the currentSound's next sound in sequence.
 * If currentSound is the last sound in the sequence, forward to the first audio in the sequence, and do not play the audio.
 */
AudioManager.prototype.nextStepAudio = function() {
	soundManager.stopAll(); // first, stop currently-playing audio
	this.removeAllHighlights();
	var nextSound = this.getNextSound();
	
	notificationManager.notify("nextSound:" + nextSound, 4);
	if (nextSound == null && this.currentNode.audios.length > 0) {
		// no more next sound, go back to beginning and don't play
		this.currentSound = this.currentNode.audios[0].audio;		
	} else {
		this.currentSound = nextSound;
		if (this.isPlaying) {
			this.playCurrentSound();
		} else {
			highlightTextElement(this.currentSound.elementId, this.currentNode, true);
		};
	};
};

/**
 * Plays the currentSound iff the currentSound exits.
 */
AudioManager.prototype.playCurrentSound = function() {
	if (this.currentSound != null) {
		this.currentSound.play();
	};
};

/**
 * Removes all the highlights from the page.
 */
AudioManager.prototype.removeAllHighlights = function() {
	if (this.currentNode != null) {
		for (var i=0; i<this.currentNode.audios.length;i++) {
			var nodeAudio = this.currentNode.audios[i];
			highlightTextElement(nodeAudio.elementId, this.currentNode, false);
		};
	};
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/sound/AudioManager.js');
};