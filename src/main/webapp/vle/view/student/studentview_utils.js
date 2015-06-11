/**
 * Returns absolute URL path to student's unreferenced uploaded assets folder
 * e.g. http://localhost:8080/studentuploads/[runId]/[workgroupId]/unreferenced
 */
View.prototype.getAbsoluteRemoteStudentUnreferencedUploadsPath = function() {
	var workgroupId = this.userAndClassInfo.getWorkgroupId();
	var studentUploadsBaseURL = this.config.getConfigParam("studentUploadsBaseURL");
	return studentUploadsBaseURL + "/" + this.config.getConfigParam("runId") + "/" + workgroupId + "/unreferenced/";
};

/**
 * Returns absolute URL path to student's referenced uploaded assets folder
 * e.g. http://localhost:8080/studentuploads/[runId]/[workgroupId]/unreferenced
 */
View.prototype.getAbsoluteRemoteStudentReferencedUploadsPath = function() {
	var workgroupId = this.userAndClassInfo.getWorkgroupId();
	var studentUploadsBaseURL = this.config.getConfigParam("studentUploadsBaseURL");
	return studentUploadsBaseURL + "/" + this.config.getConfigParam("runId") + "/" + workgroupId + "/referenced/";
};

/**
 * Closes any currently-opened dialogs.
 */
View.prototype.utils.closeDialogs = function(){
	//close all dialog popups except the annotation popup and the challenge question popup
	$(".ui-dialog-content").not('#nodeAnnotationsPanel').not('#feedbackDialog').dialog("close");
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

//This will parse a delimited string into an array of
//arrays. The default delimiter is the comma, but this
//can be overriden in the second argument.
//Source: http://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
View.prototype.utils.CSVToArray = function( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];

	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;


	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];

		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			(strMatchedDelimiter != strDelimiter)
			){

			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );

		}


		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);

		} else {

			// We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];

		}


		// Now that we have our value string, let's add
		// it to the data array.
		var finalValue = strMatchedValue;
		var floatVal = parseFloat(strMatchedValue);
		if (!isNaN(floatVal)) {
			finalValue = floatVal;
		}
		arrData[ arrData.length - 1 ].push( finalValue );
	}

	// Return the parsed data.
	return( arrData );
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


View.prototype.utils.encode64 = function(input) {
	
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	// base64 strings are 4/3 larger than the original string
//	input = Utils.encodeUTF8(input); // convert non-ASCII characters
	input = Utils.convertToXMLReferences(input);
	if(window.btoa) return window.btoa(input); // Use native if available
	var output = new Array( Math.floor( (input.length + 2) / 3 ) * 4 );
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0, p = 0;

	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output[p++] = this._keyStr.charAt(enc1);
		output[p++] = this._keyStr.charAt(enc2);
		output[p++] = this._keyStr.charAt(enc3);
		output[p++] = this._keyStr.charAt(enc4);
	} while (i < input.length);

	return output.join('');
}

View.prototype.utils.decode64 = function(input) {
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	if(window.atob) return window.atob(input);
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;

	 // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	 input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	 do {
		enc1 = this._keyStr.indexOf(input.charAt(i++));
		enc2 = this._keyStr.indexOf(input.charAt(i++));
		enc3 = this._keyStr.indexOf(input.charAt(i++));
		enc4 = this._keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);

		if (enc3 != 64) {
		   output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
		   output = output + String.fromCharCode(chr3);
		}

		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";

	 } while (i < input.length);
	 return unescape(output);	
}

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/student/studentview_utils.js');
};