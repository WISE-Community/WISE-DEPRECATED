var wiseTargetOrigin = "*";

function sendStateToWISE(stepState) {

	if (stepState) {
		var wiseWrapper = window.parent;

		// When the popup has fully loaded, if not blocked by a popup blocker:

		// This does nothing, assuming the window hasn't changed its location.
		wiseWrapper.postMessage({"messageType":"sendStateToWISE","stepState":stepState}, wiseTargetOrigin);
	}
}

//Called sometime after postMessage is called
function receiveMessage(event)
{
	var msg = event.data;

	if (msg.viewType === 'author') {
		$('#message').html('author view');
		$("#authorView").show();
		$("#studentView").hide();
	} else if (msg.viewType == "studentNavigation") {
		setProject(msg.project);
	} else if (msg.viewType == "student") {
		if (msg.messageType == "requestSendStateToWISE") {
			sendStateToWISE(getStepState());				
		} else {
			$("#message").html("student view");
			$("#authorView").hide();
			setContent(msg.content);
			setStepState(msg.stepState);

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
		}
	} else if (msg.viewType == "grading") {
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

//call this when step is ready to load WISE step content and student step data
function stepIsReadyForWISE() {
    console.log('step is ready for WISE');
	// when they get here, assume iframe has loaded completely and are ready to load content and student data
	var wiseWrapper = window.parent;

	// This does nothing, assuming the window hasn't changed its location.
	wiseWrapper.postMessage({"messageType":"requestStepContentAndStateAndAnnotationFromWISE"}, wiseTargetOrigin);
}

//call this when step is ready to load WISE step content and student step data
function navigationIsReadyForWISE() {
	// when they get here, assume iframe has loaded completely and are ready to load content and student data
	var wiseWrapper = window.parent;

	// This does nothing, assuming the window hasn't changed its location.
	wiseWrapper.postMessage({"messageType":"requestNavigationStateFromWISE"}, wiseTargetOrigin);
}


//call this when step is ready to load WISE step content and student step data
function navigation_moveToNode(nodeId) {
	// when they get here, assume iframe has loaded completely and are ready to load content and student data
	var wiseWrapper = window.parent;

	// This does nothing, assuming the window hasn't changed its location.
	wiseWrapper.postMessage({"messageType":"navigation_moveToNode","nodeId":nodeId}, wiseTargetOrigin);
}

window.addEventListener("message", receiveMessage, false);