/* Node Audio Object */
function NodeAudio(id, url, elementId, textContent, md5url, index) {
	this.id = id;
	this.url = url;
	this.elementId = elementId;    // VALUE in <p audio=VALUE .../> or <div audio=VALUE ../>
	this.elementTextContent = textContent;
	this.md5url = md5url;
	this.audio = null;
	this.backupAudio = null;  // backup audio, ie NoAvailableAudio.mp3 or MD5
	this.index = index;   // index of this nodeaudio in relation to other nodeaudios
};

NodeAudio.prototype.play = function() {
	this.audio.play();
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/sound/nodeaudio.js');
};