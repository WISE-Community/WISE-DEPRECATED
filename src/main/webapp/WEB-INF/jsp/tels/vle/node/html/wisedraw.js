
/**
 * Retrieves the previous work the student submitted
 * @return the latest student work
 */
function getDrawingData() {
	if(typeof vle != 'undefined'){
		return vle.getLatestHtmlState();
	};
};

/**
 * Obtain the drawing data from the applet and save it into
 * the vle state
 */
function saveDrawingData() {
	/*
	 * obtain the drawing data from the applet. this is performed
	 * by calling the Java function getDrawingData(). the applet
	 * name is 'wisedraw' so we can access the applet from
	 * document.wisedraw and then with a handle on the applet
	 * we can call getDrawingData()
	 */
	var drawingData = document.wisedraw.getDrawingData();
	
	//save the drawing data into the vle state
	if(typeof vle != 'undefined'){
		vle.saveHtmlState(drawingData);
	};
};

/**
 * This is called when the applet has loaded. It will set
 * the initial drawing data into the applet. We have to do it
 * this way because there is a bug for Mac OSX/Firefox which
 * returns null when we call getMember() from within Java, so
 * we can't pull the drawing data from the vle state from Javascript
 * to Java. Due to this, we need to push the drawing data from 
 * Javascript to Java by having Javascript set the drawing data
 * into the Java. The applet refreshes the drawing when this is
 * called so the image is updated.
 */
function doneLoading() {
	document.wisedraw.setInitialDrawingData(getDrawingData());
};

/**
 * Called when the step is exited such as when the user moves
 * to another step. This allows us to save the student drawing
 * when they leave the step, even if they haven't clicked on
 * the save button.
 */
function onExit() {
	saveDrawingData();
};