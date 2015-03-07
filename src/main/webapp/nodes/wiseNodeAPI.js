var wiseTargetOrigin = '*';

var nodeId = getParameterByName(window.location.href, 'nodeId');
var mode = getParameterByName(window.location.href, 'mode');
var callbackListeners = [];
var nodeMessageId = 0;

//Called sometime after postMessage is called
function receiveMessage(event) {
	var msg = event.data;
	var action = msg.action;
	
    var nodeMessageId = msg.nodeMessageId;
    if (nodeMessageId !== null) {
        for (var i = 0; i < callbackListeners.length; i++) {
            var callbackListener = callbackListeners[i];
            if (callbackListener && callbackListener.nodeMessageId === nodeMessageId) {
                callbackListener.callback(callbackListener.callbackArgs);
            }
        }
    }

	if (action == 'postWISEDataRequest') {
		sendStateToWISE(getStepState());				
	} else if (action === 'getWISEDataResponse') {
	    var wiseData = msg.wiseData;
	    var studentData = wiseData.studentData;
	    var nodeContent = wiseData.nodeContent;
	    var globalStyle = wiseData.globalStyle;
	    
		setContent(nodeContent);
		setStudentData(studentData);

		if (mode === 'student') {
            // load global styles
            if (globalStyle) {
                var globalStyleSpan = $('<style>');
                globalStyleSpan.html(globalStyle);
                $('body').append(globalStyleSpan);
            }

            // load step style, overriding any global styles
            if (nodeContent && nodeContent.style) {
                var stepStyle = $('<style>');
                stepStyle.html(nodeContent.style);
                $('body').append(stepStyle);
            }
		}
		
		var nodeStatus = {};
		nodeStatus.isContentLoaded = true;
		nodeStatus.isStudentDataLoaded = true;
		nodeStatus.isLoadingComplete = true;
		
         var message = {
             'action': 'postNodeStatusRequest',
             'nodeStatus': nodeStatus,
             'nodeId': nodeId
         };
         
         postMessageToWISE(message);
	} else if (action === 'getWISEStudentDataRequest') {
	    
	    var studentData = null;
	    if (typeof(getStudentData) !== 'undefined' && isFunction(getStudentData)) {
	        studentData = getStudentData();
	    }
	    if (studentData != null) {
            studentData.saveTriggeredBy = msg.saveTriggeredBy;
	    }
	    
	    var wiseMessageId = msg.wiseMessageId;
	    
	    var wiseData = {};
	    wiseData.studentData = studentData;
	    
        var message = {
            'action': 'getWISEStudentDataResponse',
            'wiseData': wiseData,
            'wiseMessageId':wiseMessageId,
            'nodeId': nodeId
        };
        
        postMessageToWISE(message);
	} else if (action === 'nodeOnExitRequest') {
        var wiseMessageId = msg.wiseMessageId;

	    nodeOnExit(wiseMessageId);
	}

	// Do we trust the sender of this message?
	if (event.origin !== 'http://example.com:8080')
		return;

	// event.source is window.opener
	// event.data is 'hello there!'

	// Assuming you've verified the origin of the received message (which
	// you must do in any case), a convenient idiom for replying to a
	// message is to call postMessage on event.source and provide
	// event.origin as the targetOrigin.
	//event.source.postMessage('hi there yourself!  the secret response ' +
	//                       'is: rheeeeet!',
	//                     event.origin);
}

function sendNodeOnExitResponse(wiseMessageId) {
    var message = {
            'action': 'nodeOnExitResponse',
            'wiseMessageId':wiseMessageId,
         };
            
         postMessageToWISE(message);
}

// gets parameter by name in the url
function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//call this when step is ready to load WISE step content and student step data
function loadWISEData(loadingParams) {
    var message = {
        'action': 'getWISEDataRequest',
        'nodeId': nodeId,
        'loadingParams': loadingParams
    };
    
    postMessageToWISE(message);
}

function saveStudentData(studentData) {

    if (studentData) {
        var wiseData = {};
        wiseData.studentData = studentData;
        
        var message = {
            'action': 'postWISEStudentDataRequest',
            'wiseData': wiseData,
            'nodeId': nodeId
        };
        
        postMessageToWISE(message);
    }
}

function saveNodeContentToWISE(nodeContent, callback, callbackArgs) {

    if (nodeContent) {
        var wiseData = {};
        wiseData.nodeContent = nodeContent;
        
        var message = {
            'action': 'postWISENodeContentRequest', 
            'wiseData': wiseData, 
            'nodeId': nodeId
        };
        
        postMessageToWISE(message, callback, callbackArgs);
    }
}

function postMessageToWISE(message, callback, callbackArgs) {
    message.nodeMessageId = nodeMessageId;
    if (callback != null) {
        callbackListeners.push({nodeMessageId:nodeMessageId, callback:callback, callbackArgs:callbackArgs});
    }
    nodeMessageId++;
    
    var wiseWrapper = window.parent;
    wiseWrapper.postMessage(message, wiseTargetOrigin);
};

function isFunction(possibleFunction) {
    return typeof(possibleFunction) === typeof(Function);
}

window.addEventListener('message', receiveMessage, false);