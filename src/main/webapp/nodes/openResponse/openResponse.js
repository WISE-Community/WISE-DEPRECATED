function getStepState() {
	var response = document.getElementById("responseTextarea").value;
	return {"response":response};
}

function setContent(content) {
	 $("#title").html(content.title);
	 $("#prompt").html(content.prompt);
}

function setStepState(stepState) {
	 $("#responseTextarea").html(stepState.response);
}

function saveButtonClicked() {
	var response = getStepState();
	sendStateToWISE(response);
}

