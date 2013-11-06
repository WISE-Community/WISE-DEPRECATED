/**
 * Dispatches events specific to the audio
 */

// NATE: removed all audio updating stuff -- createAudioFiles, updateAudio, etc
//  also, picked just one (the last) of the 'render finished' events...
View.prototype.audioDispatcher = function(type, args, obj) {
    // debugger;
    if (type == 'loadingProjectCompleted') {
        //obj.createAudioManagerOnProjectLoad();
    } else if (type == 'pageRenderCompleted') {
        obj.startAudioAfterRender(args[0]);
        // obj.prepareAudio(args[0]);
    } else if (type == 'createAudioFiles') {
        //obj.createAudioFiles(args[0]);
    }
    ;
};

/**
 * Creates the audio manager when the vle starts and checks to see if we need to
 * update the audio (request from authoring tool)
 */
View.prototype.createAudioManagerOnProjectLoad = function() {
    if (this.config.getConfigParam('enableAudio')) {
        if (!(this.audioManager)) {
            // used to enter here if this.config.getConfigParam('updateAudio')
            // as well... no longer
            this.audioManager = new AudioManager(this.config
                    .getConfigParam('playAudioOnStart'), this);
            // make audioControls visible -- hopefully they were hidden this
            // way!
            document.getElementById("audioControls").style.visibility = "visible";
            document.getElementById("audioControls").style.display = 'inline-block';
        }
    } else {
        document.getElementById("audioControls").style.visibility = "hidden";
        document.getElementById("audioControls").style.display = 'none';
    }

    // Don't do this here anymore
    // if(this.config.getConfigParam('updateAudio')){
    // eventManager.fire('updateAudio');
};

/**
 * rewinds currently-playing audio
 */
View.prototype.rewindStepAudio = function() {
    if (this.audioManager) {
        this.audioManager.rewindStepAudio();
    }
};

/**
 * rewinds currently-playing audio
 */
View.prototype.previousStepAudio = function() {
    if (this.audioManager) {
        this.audioManager.previousStepAudio();
    }
    ;
};

/**
 * forwards to the next audio
 */
View.prototype.forwardStepAudio = function() {
    if (this.audioManager) {
        this.audioManager.nextStepAudio();
    }
    ;
};

/**
 * toggles play/pause audio
 */
View.prototype.playPauseStepAudio = function() {
    if (this.audioManager) {
        this.audioManager.playPauseStepAudio();
    }
    ;
};


/**
 * Sends node to audio manager to update nodeaudios
 */
View.prototype.startAudioAfterRender = function(nodeId) {
    if (!this.updateAudioOnRender && this.audioManager) {
        try {
            // ? pause a bit before calling this
            var cNode = this.getProject().getNodeById(nodeId);
            if (cNode != null) {
                this.audioManager.setCurrentNode(cNode);
                if (this.config.getConfigParam("playAudioOnStart")) {
                    this.playPauseStepAudio();
                }
            }
        } catch (err) {
            this.notificationManager.notify("Error thrown making audio for node " + nodeId , 3);
        }
        // this.audioManager.setCurrentNode(this.getProject().getNodeByPosition(position));
        // var currentNode = this.getProject().getNodeByPosition(position);
        // 'this.audioManager.setCurrentNode()', 2500);
    }
    ;
};



/////////////////
///////////////// This stuff isn't handled in javascript anymore -- see APCSA scripts for generating audio
//  unneccesary

///**
// * updates the audio files for the nodes in the currently loaded project
// */
//View.prototype.updateAudio = function() {
//    this.eventManager.fire('lockScreenEvent', "Generating Audio Files...");
//    this.updateAudioOnRender = true;
//    this.audioReady = [];
//
//    setTimeout('eventManager.fire("renderNode","' + this.getProject()
//            .getStartNodePosition() + '")', 2500);// 2500
//    setTimeout('eventManager.fire("stepThruProject")', 5000);// 5000
//};
//
//
//
///**
// * Renders each node in the project waiting 2500 ms between rendering each node.
// */
//View.prototype.stepThruProject = function() {
//    if (this.renderNextNode()) {
//        setTimeout('eventManager.fire("stepThruProject")', 2500);
//    } else {
//        this.updateAudioOnRender = false;
//        this.eventManager.fire('lockScreenEvent',
//                'Finished generating audio files. Close this window.');
//    }
//    ;
//};
//
///**
// * Prepares the node audios for use by the view, creates audio for text elements
// * when specified.
// */
//View.prototype.prepareAudio = function(nodeId) {
//    /* if audio has already been prepared for this node, then exit */
//    if (this.audioReady.indexOf(nodeId) != -1) {
//        return;
//    }
//    ;
//
//    /* first parse the document and get the elements that have audio attribute */
//    var nodeAudioElements = null;
//    nodeAudioElements = getElementsByAttribute("audio", null);
//
//    /* go through each audio element and create NodeAudio objects */
//    if (nodeAudioElements) {
//        for ( var k = 0; k < nodeAudioElements.size(); k++) {
//            var audioElement = nodeAudioElements.item(k);
//            var audioElementValue = audioElement.getAttribute('audio');
//            var audioElementAudioId = nodeId + "." + audioElementValue;
//
//            var nodeAudioUrl = this.getProject().getContentBase() + "/"
//                    + this.audioLocation + "/" + audioElementAudioId + ".mp3";
//
//            /* get and normalize text content */
//            var textContent = audioElement.get('textContent');
//            if (textContent == null || textContent == "") {
//                textContent = audioElement.get('innerText'); // for IE
//            }
//            ;
//
//            var elementTextContentMD5 = hex_md5(normalizeHTML(textContent)); // MD5(this.elementTextContent);
//            var md5url = this.getProject().getContentBase() + "/"
//                    + this.audioLocation + "/audio_" + elementTextContentMD5
//                    + ".mp3";
//            var nodeAudio = new NodeAudio(audioElementAudioId, nodeAudioUrl,
//                    audioElementValue, textContent, md5url, k);
//
//            /* add new node audio to nodeAudioMap */
//            if (!this.nodeAudioMap[nodeId]) {
//                this.nodeAudioMap[nodeId] = [];
//            }
//            ;
//            this.nodeAudioMap[nodeId].push(nodeAudio);
//        }
//        ;
//    }
//    ;
//
//    /* create audio files only if explicitly-requested */
//    if (this.updateAudioOnRender) {
//        this.eventManager.fire('createAudioFiles', nodeId);
//    }
//    ;
//
//    this.audioReady.push(nodeId);
//};
//
///**
// * Creates audio files for this node with the given id.
// */
//View.prototype.createAudioFiles = function(nodeId) {
//    /* get the audios for the node of the given id */
//    var audios = this.nodeAudioMap[nodeId];
//    if (!audios || audios.length == 0) {
//        return;
//    }
//
//    /* set content base variable, if filemanager is used, remove it from base */
//    var contentBase = this.getProject().getContentBase();
//    var filemanagerString = '/webapp/author/authorproject.html?forward=filemanager&projectId=&command=retrieveFile&fileName=';
//    if (contentBase.indexOf(filemanagerString) != -1) {
//        contentBase = this.utils.getContentPath(filemanagerString, contentBase);
//    }
//
//    var createdCount = 0;
//    for ( var a = 0; a < audios.length; a++) {
//        /* only invoke updateAudioFiles if elementId exists */
//        if (audios[a].elementId) {
//            var success = function(t, x, o) {
//                if (t == 'success') {
//                    createdCount++;
//                } else if (t == 'audioAlreadyExists') {
//                } else {
//                    o.notificationManager
//                            .notify(
//                                    'could not create audio. Is your filesystem write-able? Does it have the right directories, ie audio, where the audio will go?',
//                                    3);
//                }
//            };
//
//            var failure = function(t, x, o) {
//                o.notificationManager.notify('could not create audio', 3);
//            };
//
//            var audioUrl = audios[a].md5url;
//            if (audioUrl.indexOf(filemanagerString) != -1) {
//                audioUrl = this.utils.getContentPath(filemanagerString,
//                        audioUrl);
//            }
//
//            this.connectionManager.request('POST', 1,
//                    '/webapp/author/authorproject.html', {
//                        forward : 'filemanager',
//                        projectId : '',
//                        command : 'updateAudioFiles',
//                        param1 : contentBase,
//                        param2 : audioUrl,
//                        param3 : audios[a].elementTextContent
//                    }, success, this, failure);
//        }
//    }
//};

// used to notify scriptloader that this script has finished loading
if (typeof eventManager != 'undefined') {
    eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_audio.js');
};