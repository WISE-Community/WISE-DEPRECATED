/**
 * Returns absolute URL path to student's unreferenced uploaded assets folder
 * e.g. http://localhost:8080/studentuploads/[runId]/[workgroupId]/unreferenced
 */
View.prototype.getAbsoluteRemoteStudentUnreferencedUploadsPath = function() {
	var workgroupId = this.userAndClassInfo.getWorkgroupId();
	var getStudentUploadsBaseUrl = this.config.getConfigParam("getStudentUploadsBaseUrl");
	return getStudentUploadsBaseUrl + "/" + this.config.getConfigParam("runId") + "/" + workgroupId + "/unreferenced/";
};

/**
 * Returns absolute URL path to student's referenced uploaded assets folder
 * e.g. http://localhost:8080/studentuploads/[runId]/[workgroupId]/unreferenced
 */
View.prototype.getAbsoluteRemoteStudentReferencedUploadsPath = function() {
	var workgroupId = this.userAndClassInfo.getWorkgroupId();
	var getStudentUploadsBaseUrl = this.config.getConfigParam("getStudentUploadsBaseUrl");
	return getStudentUploadsBaseUrl + "/" + this.config.getConfigParam("runId") + "/" + workgroupId + "/referenced/";
};

/**
 * Closes any currently-opened dialogs.
 */
View.prototype.utils.closeDialogs = function(){
	$(".ui-dialog-content").dialog("close");
};

/**
 * Closes specified dialog.
 * @param name The string id of the dialog to close
 */
View.prototype.utils.closeDialog = function(name){
	$('#' + name).dialog('close');
};

/**
 * Resize the given panel to the values for the given size
 * @param panel - the panel that we want to resize
 */
View.prototype.utils.resizePanel = function(panelname, size){
	var maxHeight = $(window).height()*.97-10;
	var maxWidth = $(window).width()*.98-4;
	var centeredTop = $(window).height()/2-maxHeight/2-6;
	var centeredLeft = $(window).width()/2-maxWidth/2-4;
	var titlebarHeight = $("#" + panelname).prev().height();
	
	if(size == "minimize") {
		//resize the note to only display the resize buttons
		$('#' + panelname).parent().css({width:'430px'});
		$("#" + panelname).css({height:100-titlebarHeight + 'px'});
	} else if(size == "original") {
		//resize the note to display all the note elements easily
		$('#' + panelname).parent().css({width:'650px'});
		$("#" + panelname).css({height:'auto'});
	} else if(size == "narrow") {
		//resize the note to fit over the left nav area
		$('#' + panelname).parent().css({width:'215px', height:'auto', top:centeredTop-4 + 'px'});
		$("#" + panelname).css({height:maxHeight-titlebarHeight + 'px'});
	} else if(size == "wide") {
		//resize the note to be short and wide
		$('#' + panelname).parent().css({width:maxWidth + 'px', height:'auto', left:centeredLeft + 'px'});
		$("#" + panelname).css({height:'200px'});
	} else if(size == "maximize") {
		//resize the note to fit over the whole vle
		$('#' + panelname).parent().css({width:maxWidth + 'px', top:centeredTop-4 + 'px', height:'auto', left:centeredLeft + 'px'});
		$("#" + panelname).css({height:maxHeight-titlebarHeight + 'px'});
	}
};

/**
 * Detects array equality by recursively checking equality of elements and sub-elements.
 */
View.prototype.utils.recursiveCompare = function(obj, reference){
    if(obj === reference) return true;
    if(obj instanceof Array){
         if(obj.length !== reference.length) return false;
         for(var i=0, len=obj.length; i<len; i++){
             if(typeof obj[i] == "object" && typeof reference[j] == "object"){
                 if(!this.recursiveCompare(obj[i], reference[i])) return false;
             }
             else if(obj[i] !== reference[i]) return false;
         }
    }
    else if (!isNaN(obj) && !isNaN(reference)) {
    	return obj == reference;
    } else {
        var objListCounter = 0;
        var refListCounter = 0;
        for(var i in obj){
            objListCounter++;
            if(typeof obj[i] == "object" && typeof reference[i] == "object"){
                if(!this.recursiveCompare(obj[i], reference[i])) return false;
            }
            else if(obj[i] !== reference[i]) return false;
        }
        for(var i in reference) refListCounter++;
        if(objListCounter !== refListCounter) return false;
    }
    return true; //Every object and array is equal
};

View.prototype.utils.executeRMethod = function(method, data, callback) {
	var self = this;
	var val = "text";
	if(val == "text") {
		var rdata = { method: method, data: data };
		// console.log('method %o data %o, json str %o', method, data, JSON.stringify(rdata));
		$.post("/webapp/bridge/postdata.html", {"type": "rstat", "rdata": $.stringify(rdata)}, callback);
	}
	else {
		// do something if it is invalid
	}
};

View.prototype.utils.getRImageSourceString = function(format, width, height, data, callback) {
	var rdata = {
		format : format,
		width : width,
		height : height,
		data : data
	};
	// console.log('param is %o', $.stringify(rdata));
	return "/webapp/bridge/getdata.html?type=rimage&rdata=" + encodeURIComponent($.stringify(rdata));
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_utils.js');
};