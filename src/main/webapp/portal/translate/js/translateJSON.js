
// returns the string representation of what should be saved in the translation file
// for VLE and step types, this is a JSONString. for Portal, this would be a properties string
function getTranslationString_JSON(obj) {
	for (key in obj) {
	    obj[key].description = addSlashes(obj[key].description);
	    obj[key].value = addSlashes(obj[key].value);
        }
        return FormatJSON(obj);
}

// build and show the translation table for the currentLanguage
function buildTable5() {
	var translationTable = 
	"<div id='dumpDiv' style='display:none'>"+
	"<b>Please copy and save the following into a file for backup.</b><br/><br/>You should be able to view your translations in WISE now by refreshing your browser. You can close this window and keep working, or if you are done,<br/><button onclick='notifyComplete(\""+projectType+"\")'>Click here to notify the WISE Staff.</button>"+
	"<textarea rows='50' cols='150' id='dumpTextarea'></textarea>"+
	"</div>"+
	"<p><b>Remember to save your work often and before closing this window by clicking on the \"Save\" button.</b></p><div style='display:block; margin:10px 0px'><input id='onlyShowMissingTranslationInput' onClick='onlyShowMissingTranslation()' type='checkbox'></input>Only Show Missing Translations <span id='numMissingTranslations'></span>&nbsp;&nbsp;&nbsp;" +
	"<input id='saveButton' type='button' onClick='save(\""+projectType+"\")' value='Save'></input><span id='loadingGif' style='display:none'><img src='common/wait30.gif'></img></div>" +
	"<table border='1' id='translationTable'>";

	// build the header row
	translationTable += "<tr><th class='cell_key'>key</th><th>"+View.prototype.i18n.defaultLocale+"</th>";
	translationTable += "<th class='cell_currentLanguage'>"+currentLanguage+"</th>";
	translationTable += "</tr>\n\n";

	// build the rest of the table
	if (currentLanguage != "") {        
		for (key in View.prototype.i18n[View.prototype.i18n.defaultLocale]) {
			var value = View.prototype.i18n[View.prototype.i18n.defaultLocale][key].replace(/[\n]/g, "\\n");
			translationTable += "<tr class='translationRow'>\n<td class='cell_key'>"+key+"</td>\n<td><textarea style='border:none;width:100%;height:100%' class='englishText' readonly='true'>"+value+"</textarea></td>\n";
			if (View.prototype.i18n[currentLanguage][key]) {
				translationTable += "<td class='cell_currentLanguage'><textarea style='height:100%;width:100%' class='foreignText' id='"+key+"'>"+View.prototype.i18n[currentLanguage][key].replace(/[\n]/g, "\\n")+"</textarea></td>\n";
			} else {
				translationTable += "<td class='cell_currentLanguage'><textarea style='height:100%;width:100%' class='foreignText' id='"+key+"'></textarea></td>\n";
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

// build and show the translation table for the currentLanguage
function buildTable_JSON() {
	var translationTable = 
	"<div id='dumpDiv' style='display:none'>"+
	"<b>Please copy and save the following into a file for backup.</b><br/><br/>You should be able to view your translations in WISE now by refreshing your browser. You can close this window and keep working, or if you are done,<br/><button onclick='notifyComplete(\""+projectType+"\")'>Click here to notify the WISE Staff.</button>"+
	"<textarea rows='50' cols='150' id='dumpTextarea'></textarea>"+
	"</div>"+
	"<p><b>Remember to save your work often and before closing this window by clicking on the \"Save\" button.</b></p><div style='display:block; margin:10px 0px'><input id='onlyShowMissingTranslationInput' onClick='onlyShowMissingTranslation()' type='checkbox'></input>Only Show Missing Translations <span id='numMissingTranslations'></span>&nbsp;&nbsp;&nbsp;" +
	"<input id='saveButton' type='button' onClick='save(\""+projectType+"\")' value='Save'></input><span id='loadingGif' style='display:none'><img src='common/wait30.gif'></img></div>" +
	"<table border='1' id='translationTable'>";

	// build the header row
	translationTable += "<tr><th class='cell_key'>key</th><th>description</th><th>"+View.prototype.i18n.defaultLocale+"</th>";
	translationTable += "<th class='cell_currentLanguage'>"+currentLanguage+"</th>";
	translationTable += "</tr>\n\n";

	// build the rest of the table
	if (currentLanguage != "") {        
		for (key in View.prototype.i18n[View.prototype.i18n.defaultLocale]) {
			var obj = View.prototype.i18n[View.prototype.i18n.defaultLocale][key];
			var value = obj.value.replace(/[\n]/g, "\\n");
			translationTable += "<tr class='translationRow'>\n<td class='cell_key'>"+key+"</td>\n<td>"+obj.description+"</td>\n<td><textarea style='border:none;width:100%;height:100%' class='englishText' readonly='true'>"+value+"</textarea></td>\n";
			if (View.prototype.i18n[currentLanguage][key]) {
				translationTable += "<td class='cell_currentLanguage'><textarea style='height:100%;width:100%' class='foreignText' id='"+key+"'>"+View.prototype.i18n[currentLanguage][key].value.replace(/[\n]/g, "\\n")+"</textarea></td>\n";
			} else {
				translationTable += "<td class='cell_currentLanguage'><textarea style='height:100%;width:100%' class='foreignText' id='"+key+"'></textarea></td>\n";
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
		View.prototype.i18n[currentLanguage][key].value = value;
		View.prototype.i18n[currentLanguage][key].description = View.prototype.i18n[View.prototype.i18n.defaultLocale][key].description;
		isDirty=true;  // mark document as changed
		updateMissingTranslationsCount();
	});

	// show number of missing translations
	updateMissingTranslationsCount();
}

/**
 * Synchronously retrieves specified locale json mapping file
 */
View.prototype.retrieveLocale_JSON = function(locale,projectType) {

	$.ajax({"url":"translate/" + projectType + "/" + locale,
		    async:false,
		    dataType:"json",
		    success:function(obj){ console.log('retrieved:' + locale);
				View.prototype.i18n[locale] = obj;
			},
			error:function(){ console.log('error retrieving:' + locale); }
	});	
};