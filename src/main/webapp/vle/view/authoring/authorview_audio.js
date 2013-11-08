/**
 * Functions specific to the creation of audio for steps
 */

/**
 * Starting with the given element, returns the first descendent element that
 * has the given id. Returns null if no descendents with that id are found.
 */
View.prototype.getElementById = function(element, id) {
	if (element.hasAttribute && element.hasAttribute("id") && element.getAttribute("id") == id) {
		return element;
	} else if (element.childNodes.length == 0) {
		return null;
	} else {
		var endResult = null;
		for (var i=0; i < element.childNodes.length; i++) {
			result = this.getElementById(element.childNodes[i], id);
			if (result != null) {
				return result;
			};
	     };
	     return null;
	};
};

/**
 * If a project is open, updates the audio for that project.
 */
View.prototype.updateAudio = function(){
	if(this.getProject()){
		if(this.getProject().getStartNodeId() || confirm('Could not find a start node for the project. You can add sequences and/or nodes to remedy this. Do you still wish to preview the project (you will not see nodes?')){
			this.updateAudioInVLE = true;
			window.open('vle.html', 'PreviewWindow', "toolbar=no,width=1024,height=768,menubar=no");
		};
	} else {
		this.notificationManager.notify('Please open or create a Project to update audio.', 3);
	};
};

/**
 * Updates AudioFiles for the current project.
 */
View.prototype.updateAudioFiles = function(){console.warn('UPDATing AudIO');
	if(this.getProject()){
		var createdCount = 0;
		var nodes = this.getProject().getLeafNodes();
		for(var b=0;b<nodes.length;b++){
			var node = nodes[b];
			for (var a=0; a<node.audios.length;a++) {
				this.notificationManager.notify('audio url:' + node.audios[a].url, 4);
				var elementId = node.audios[a].elementId;

				// only invoke updateAudioFiles if elementId exists and is ID'ed to 
				// actual element in the content.
				if (elementId && elementId != null) {

					var xmlDoc = node.content.getContentXML();
					if (xmlDoc.firstChild.nodeName == "parsererror") {
						this.notificationManager.notify('could not create audio.\nAudioFile: ' +node.audios[a].url+'\nReason: parse error parsing file: ' + node.filename, 2);
					} else {
						var foundElement = this.getElementById(xmlDoc, elementId);
						if (foundElement != null) {
							var textContent = foundElement.textContent;
							this.notificationManager.notify('creating audio file at url: ' + node.audios[a].url
														+ '\nelementId: ' + elementId + '\ncontent: ' + textContent, 4);
							
							var success = function(t,x,o){
								if (t == 'success') {
									createdCount++;
								} else {
									o.notificationManager.notify('could not create audio.  Check if you have read/write access to your desktop.  Check to confirm that an "Audio" sub-folder exists in the project folder', 3);
								}
							};
							
							var failure = function(t,o){
								o.notificationManager.notify('could not create audio', 3);
							};
							
							this.connectionManager.request('POST',1,this.requestUrl, {forward:'filemanager',projectId:this.portalProjectId,command:'updateAudioFiles',audioFilePath:node.audios[a].url,content:textContent}, success, this, failure);
						}  // if (foundElement != null) {
					}  // } else {
				}
			}
		}
			this.notificationManager.notify('number of audio files created: ' + createdCount, 4);	
	} else {
		this.notificationManager.notify('Please open or create a Project before attempting to save.', 3);
	};
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_audio.js');
};