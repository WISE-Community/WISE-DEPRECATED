var wiseTargetOrigin = '*';

var nodeId = getParameterByName(window.location.href, 'nodeId');

//Called sometime after postMessage is called
function receiveMessage(event)
{
	var msg = event.data;
	var viewType = msg.viewType;
	var action = msg.action;

	if (viewType === 'author') {
		$('#message').html('author view');
		$("#authorView").show();
		$("#studentView").hide();
	} else if (viewType == "studentNavigation") {
		setProject(msg.project);
	} else if (viewType == "student") {
		if (action == "postWISEDataRequest") {
			sendStateToWISE(getStepState());				
		} else if (action === 'getWISEDataResponse') {
		    var studentData = msg.studentData;
		    
		    
			$("#message").html("student view");
			$("#authorView").hide();
			setContent(msg.content);
			setStudentData(studentData);

			// load global styles
			if (msg.globalStyle) {
				var globalStyle = $("<style>");
				globalStyle.html(msg.globalStyle);
				$("body").append(globalStyle);
			}

			// load step style, overriding any global styles
			if (msg.content && msg.content.style) {
				var stepStyle = $("<style>");
				stepStyle.html(msg.content.style);
				$("body").append(stepStyle);
			}


			$("#studentView").show();
			
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
		    var studentData = getStudentData();
		    
		    studentData.saveTriggeredBy = msg.saveTriggeredBy;
		    
		    var wiseData = {};
		    wiseData.studentData = studentData;
		    
	        var message = {
	            'action': 'getWISEStudentDataResponse',
	            'wiseData': wiseData,
	            'nodeId': nodeId
	        };
	        
	        postMessageToWISE(message);
		}
	} else if (viewType == "grading") {
		document.getElementById("message").appendChild( document.createTextNode("grading view") );
	}


	// Do we trust the sender of this message?
	if (event.origin !== "http://example.com:8080")
		return;

	// event.source is window.opener
	// event.data is "hello there!"

	// Assuming you've verified the origin of the received message (which
	// you must do in any case), a convenient idiom for replying to a
	// message is to call postMessage on event.source and provide
	// event.origin as the targetOrigin.
	//event.source.postMessage("hi there yourself!  the secret response " +
	//                       "is: rheeeeet!",
	//                     event.origin);
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

function postMessageToWISE(message) {
    var wiseWrapper = window.parent;
    
    wiseWrapper.postMessage(message, wiseTargetOrigin);
};

function saveNodeContent(nodeContent) {

    if (nodeContent) {
        var wiseWrapper = window.parent;

        // When the popup has fully loaded, if not blocked by a popup blocker:

        var wiseData = {};
        wiseData.nodeContent = nodeContent;
        
        // This does nothing, assuming the window hasn't changed its location.
        wiseWrapper.postMessage({"action": "postWISENodeContentRequest", "wiseData": wiseData, "nodeId": nodeId}, wiseTargetOrigin);
    }
}

//call this when step is ready to load WISE step content and student step data
function navigationIsReadyForWISE() {
	// when they get here, assume iframe has loaded completely and are ready to load content and student data
	var wiseWrapper = window.parent;

	// This does nothing, assuming the window hasn't changed its location.
	wiseWrapper.postMessage({'action': 'requestNavigationStateFromWISE'}, wiseTargetOrigin);
}


//call this when step is ready to load WISE step content and student step data
function navigation_moveToNode(nodeId) {
	// when they get here, assume iframe has loaded completely and are ready to load content and student data
	var wiseWrapper = window.parent;

	// This does nothing, assuming the window hasn't changed its location.
	wiseWrapper.postMessage({"action":"navigation_moveToNode","nodeId":nodeId}, wiseTargetOrigin);
}

window.addEventListener("message", receiveMessage, false);