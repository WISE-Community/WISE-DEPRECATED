/*
 * bind the documentReadyFunction to the document ready event so
 * that the function is called after the idea basket popup page loads.
 * this is not used in the idea basket step.
 */
if(documentReadyFunction != null) {
	$(document).ready(documentReadyFunction);	
}
