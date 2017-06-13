
// returns the string representation of what should be saved in the properties translation file
function getTranslationString_Properties(obj) {
	var soFar = "";
	for (key in obj) {
	    if (key.endsWith(".description")) { 
		continue; // don't include description twice.
	    }
		soFar += key + "=" + obj[key] + "\n";	     
		// also include the description
		var description_key = key+".description";
		var description =  View.prototype.i18n[View.prototype.i18n.defaultLocale][description_key];
		
		if (typeof(description) != "undefined") {
			soFar += description_key + "=" + description + "\n";
		}
	}
	return soFar;
}
// build and show the translation table for the currentLanguage
function buildTable_Properties() {
	var translationTable = 
	"<div id='dumpDiv' style='display:none'>"+
	"<b>Please copy and save the following into a file for backup.</b><br/><br/>You can close this window and keep working, or if you are done,<br/><button onclick='notifyComplete(\"portal\")'>Click here to notify the WISE Staff.</button>"+
	"<textarea rows='50' cols='150' id='dumpTextarea'></textarea>"+
	"</div>"+
	"<p><b>Remember to save your work before closing this window by clicking on the \"Save\" button.</b></p><div style='display:block; margin:10px 0px'><input id='onlyShowMissingTranslationInput' onClick='onlyShowMissingTranslation()' type='checkbox'></input>Only Show Missing Translations <span id='numMissingTranslations'></span>&nbsp;&nbsp;&nbsp;" +
	"<input id='saveButton' type='button' onClick='save(\"portal\")' value='Save'></input><span id='loadingGif' style='display:none'><img src='common/wait30.gif'></img></div>" +
	"<table border='1' id='translationTable'>";

	// build the header row
	translationTable += "<tr><th class='cell_key'>key</th><th>description</th><th>"+View.prototype.i18n.defaultLocale+"</th>";
	translationTable += "<th class='cell_currentLanguage'>"+currentLanguage+"</th>";
	translationTable += "</tr>\n\n";

	// build the rest of the table
	if (currentLanguage != "") {        
		for (key in View.prototype.i18n[View.prototype.i18n.defaultLocale]) {
			if (!key.endsWith(".description")) {
				var value = View.prototype.i18n[View.prototype.i18n.defaultLocale][key];
				var description = View.prototype.i18n[View.prototype.i18n.defaultLocale][key+".description"];
				translationTable += "<tr class='translationRow'>\n<td class='cell_key'>"+key+"</td>\n<td>"+description+"</td>\n<td><script type=\"text/plain\" style=\"display:block\">"+value+"</script></td>\n";
				if (View.prototype.i18n[currentLanguage][key]) {
					translationTable += "<td class='cell_currentLanguage'><textarea style='height:100%;width:100%' id='"+key+"' class='foreignText'>"+View.prototype.i18n[currentLanguage][key]+"</textarea></td>\n";
				} else {
					translationTable += "<td class='cell_currentLanguage'><textarea style='height:100%;width:100%' id='"+key+"' class='foreignText'></textarea></td>\n";
				}		
			}
			translationTable += "</tr>\n\n";                      
		}
	}
	translationTable += "</table>";
	$("#translationTableDiv").html(translationTable);

	$("textarea").change(function() {
		// user changed a value in the textarea
		var key = this.id;
		var value = $(this).val();
		if (!View.prototype.i18n[currentLanguage][key]) {
			View.prototype.i18n[currentLanguage][key] = {};
		}
		View.prototype.i18n[currentLanguage][key] = value;
		isDirty=true;  // mark document as changed
		updateMissingTranslationsCount();
	});

	// show number of missing translations
	updateMissingTranslationsCount();
}

/** Parse .properties files */
View.prototype.parseData_Properties = function(data) {
	mode="map";
	var map = {};
   var parsed = '';
   var parameters = data.split( /\n/ );
   var regPlaceHolder = /(\{\d+\})/g;
   var regRepPlaceHolder = /\{(\d+)\}/g;
   var unicodeRE = /(\\u.{4})/ig;
   for(var i=0; i<parameters.length; i++ ) {
       parameters[i] = parameters[i].replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // trim
       if(parameters[i].length > 0 && parameters[i].match("^#")!="#") { // skip comments
           var pair = parameters[i].split('=');
           if(pair.length > 0) {
               /** Process key & value */
               var name = unescape(pair[0]).replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // trim
               var value = pair.length == 1 ? "" : pair[1];
               // process multi-line values
               while(value.match(/\\$/)=="\\") {
               		value = value.substring(0, value.length - 1);
               		value += parameters[++i].replace( /\s\s*$/, '' ); // right trim
               }               
               // Put values with embedded '='s back together
               for(var s=2;s<pair.length;s++){ value +='=' + pair[s]; }
               value = value.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // trim
               
               /** Mode: bundle keys in a map */
               if(mode == 'map' || mode == 'both') {
                   // handle unicode chars possibly left out
                   var unicodeMatches = value.match(unicodeRE);
                   if(unicodeMatches) {
                     for(var u=0; u<unicodeMatches.length; u++) {
                        value = value.replace( unicodeMatches[u], unescapeUnicode(unicodeMatches[u]));
                     }
                   }
                   // add to map
                   map[name] = value;
               }
               
               /** Mode: bundle keys as vars/functions */
               if(mode == 'vars' || mode == 'both') {
                   value = value.replace( /"/g, '\\"' ); // escape quotation mark (")
                   
                   

                       parsed += name+'="'+value+'";';
               } // END: Mode: bundle keys as vars/functions
           } // END: if(pair.length > 0)
       } // END: skip comments
   }
   eval(parsed);
   return map;
};

/**
 * Synchronously retrieves specified locale properties mapping file
 */
View.prototype.retrieveLocale_Properties = function(locale,projectType) {

	$.ajax({"url":"translate/" + projectType + "/" + locale,
		    async:false,
		    dataType:"text",
		    success:function(obj){ 
			console.log('retrieved it:' + locale);
			objMap = View.prototype.parseData_Properties(obj)
				View.prototype.i18n[locale] = objMap;
			},
			error:function(){}
	});	
};
