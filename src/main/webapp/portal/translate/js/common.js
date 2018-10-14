View = function(){};   // the View namespace
var currentLanguage = "";  // language that is currently being translated
var isDirty = false;     // has user made any changes that need to be saved?

var localeToHumanReadableLanguageMap = {
    "ar":"Arabic",
    "en":"English",
    "zh_TW":"Chinese - Traditional",
    "zh_CN":"Chinese - Simplified",
    "nl":"Dutch",
    "fr":"French",
    "de":"German",
    "el":"Greek",
    "he":"Hebrew",
    "it":"Italian",
    "ja":"Japanese",
    "ko":"Korean",
    "pt":"Portuguese",
    "es":"Spanish",
    "th":"Thai",
    "tr":"Turkish"
};

// given locale (e.g. "ja"), returns human readable language (e.g. "Japanese")
function localeToHumanReadableLanguage(locale) {
  return localeToHumanReadableLanguageMap[locale];
};


// extension to String prototype
String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/**
* Display the contents of the i18n_XX.properties or i18n_XX.json file in a textarea
*/
function dump(translationString) {
  $("#dumpTextarea").html(translationString);
  $("#dumpDiv").show();
  $("#dumpDiv").dialog({
      autoOpen: true,
      title:"save successful",
      modal: true,
      width: 1000,
      height: 800,
      position: {my:"center", at:"center", of:"#saveButton"}
  });
};

// toggle show/hide rows that have already been translated
function onlyShowMissingTranslation() {
  if($("#onlyShowMissingTranslationInput:checked").length == 1) {
    $("tr textarea.foreignText").each(function() {
      if ($(this).val() != "") {
        $(this).parents(".translationRow").hide();
      }
    });
  } else {
    $("tr textarea.foreignText").each(function() {
      if ($(this).val() != "") {
        $(this).parents(".translationRow").show();
      }
    });
  }
};

function updateMissingTranslationsCount() {
  var numMissingTranslations = 0;
  $("tr textarea:empty").each(function() {
    if ($(this).val() == "") {
      /*
       * have to do this double check because textarea that was just edited will
       * still be selected by the "tr textarea:empty" selector
       */
      numMissingTranslations += 1;
    }
  });
  var numTotalTranslations = $("tr textarea.foreignText").length;
  var numCompletedTranslations = numTotalTranslations - numMissingTranslations;
  var completionPercentage =
      Math.floor(numCompletedTranslations/numTotalTranslations*100);
  var cheerfulText = "";
  if (numTotalTranslations == numCompletedTranslations) {
    cheerfulText = "Congratulations. You're done!";
  } else if (completionPercentage <= 25) {
    cheerfulText = "Take it one step at a time! A journey of a thousand miles begins with a single step.";
  } else if (completionPercentage <= 50) {
    cheerfulText = "Life is a journey, not a destination. Enjoy the journey of translation!";
  } else if (completionPercentage <= 75) {
    cheerfulText = "You're more than halfway there!";
  } else if (completionPercentage <= 90) {
    cheerfulText = "You're almost there!";
  } else {
    cheerfulText = "You're soooo close to the finish line!";
  }
  var progressSpan = "<span id='progress' style='width:150px; border: 2px solid gray; position: absolute; height:18px;padding:0px'>"
      + "<span id='bar' style='position:absolute;height:18px;background-color:#76FF3A;width:"+completionPercentage+"%'></span>"
      + "<span id='percent' style='position:absolute; left:40%; font-weight:bold;'>"+completionPercentage+"%</span></span>";
  $("#numMissingTranslations").html("| " +progressSpan + " <span style='margin-left:170px;'>" +numMissingTranslations+" translations remaining. "+cheerfulText+"</span>");
};

/**
 * Notifies the WISE Staff that the user has completed translating the projectType
 * projectType: {"vle", "portal"}
 */
function notifyComplete(projectType) {
  var translationString = getTranslationString(View.prototype.i18n[currentLanguage], projectType);
  $.ajax({
    url: "translate/complete/" + projectType + "/" + currentLanguage,
    type: "POST",
    data: {
      translationString: translationString
    },
    success:function(data, textStatus, jq) {
    },
    error:function() {
    }
  });
  alert("Thanks, WISE Staff has been notified. You should now be able to view your translations in WISE by refreshing your browser. If you have questions, please contact us!");
};

/**
 * Tries to save translation string (json string or properties string) to server.
 * Displays the string inside a textarea in a jQuery dialog
 * projectType: {"vle", "portal"}
 */
function save(projectType) {
  isDirty = false;  // assume that user does the right thing and saves changes.
  $("#saveButton").attr("disabled","disabled");   // disable multiple saving
  $("#loadingGif").show();   // show the spinning wheel.
  var translationString = getTranslationString(View.prototype.i18n[currentLanguage],projectType);
  dump(translationString);   // dump the translation file to the textarea so user can make backup.
  $("#saveButton").removeAttr("disabled");
  $("#loadingGif").hide();   // hide the spinning wheel.
  $.ajax({
    url: "translate/save/" + projectType + "/" + currentLanguage,
    type: "POST",
    data: {
      translationString: translationString
    },
    success:function(data, textStatus, jq) {
    },
    error:function() {
    }
  });
};


/**
 * Registers new i18n prototype to VLEView
 */
View.prototype.i18n = { locales:[] };
View.prototype.i18n.defaultLocale = "en";
View.prototype.i18n.supportedLocales = [
  "ar","en","zh_TW","zh_CN","nl","es","ja"
];

/**
 * Returns translated value of the given key.
 * Uses locale that was specified in config. To specify
 * locale, use View.prototype.i18n.getString(key,locale) directly instead.
 * @param key
 * @return
 */
View.prototype.getI18NString = function(key) {
  return this.i18n.getString(key,this.config.getConfigParam("locale"));
};

/**
 * Injects provided params into the translated string
 * key is the key used to lookup the value in i18n_XX.js file
 * params is an array of values to replace in the translated string.
 * the translated string should have the same number of replaceable elements as
 * in the params
 * ex. params: ['goodbye', 'hello']
 * translated string: 'You say {0}, I say {1}'
 *
 * Uses locale that was specified in config. To specify
 * locale, use View.prototype.i18n.getStringWithParam(key,locale,params)
 * directly instead.
 */
View.prototype.getStringWithParams = function(key,params) {
  return this.i18n.getStringWithParams(key,this.config.getConfigParam("locale"),params);
};


/**
 * key is the key used to lookup the value in the key-value pair mpaaing
 * locale is which locale to use. will be appended in i18n_[locale].js
 * if local does not exist, use defaultLocale
 * if key is not found, use defaultLocale's values
 */
View.prototype.i18n.getString = function(key,locale) {
  // if specified locale does not exist, use default locale
  if (View.prototype.i18n.supportedLocales.indexOf(locale) == -1) {
    locale = View.prototype.i18n.defaultLocale;
  }
  if (this[locale][key] !== undefined) {
    return this[locale][key].value;
  } else {
    return this[View.prototype.i18n.defaultLocale][key].value;
  }
};


/**
 * Injects provided params into the translated string
 * key is the key used to lookup the value in i18n_XX.js file
 * locale is which locale to use. will be appended in i18n_[locale].js
 * params is an array of values to replace in the translated string.
 * the translated string should have the same number of replaceable elements as
 * in the params
 * ex. params: ['goodbye', 'hello']
 * translated string: 'You say {0}, I say {1}'
 * if local does not exist, use defaultLocale
 * if key is not found, use defaultLocale's values
 */
View.prototype.i18n.getStringWithParams = function(key,locale,params) {
  // first get translated string
  var translatedString = this.getString(key,locale);

  //replace {0} with params[0], {1} with params[1], etc.
  for (var i = 0; i < params.length; i++) {
    var lookupString = "{" + i + "}";
    var replaceString = params[i];
    translatedString = translatedString.replace(lookupString,replaceString);
  }
  return translatedString;
};

/**
 *  retrieve i18n file based on VLE config.
 *  first retrieves default locale and then retrieves user's locale.
 */
View.prototype.retrieveLocales = function() {
  // retrieve default locale
  this.retrieveLocale(View.prototype.i18n.defaultLocale);

    var userLocale = "en";
  // retrieve user locale, if exists
    if (this.config != null && this.config.getConfigParam("locale")) {
    userLocale = this.config.getConfigParam("locale");
    }
  if (userLocale != View.prototype.i18n.defaultLocale) {
    for (var i=0; i < View.prototype.i18n.supportedLocales.length; i++) {
      var locale = View.prototype.i18n.supportedLocales[i];
      if (locale == userLocale) {
        View.prototype.i18n[locale] = {};
        this.retrieveLocale(locale);
      }
    };
  };
};

function getFileType(projectType) {
  if (projectType == "portal") {
    return "Properties";
  } else {
    return "JSON";
  };
};

function buildTable(projectType) {
  if ("Properties" == getFileType(projectType)) {
    buildTable_Properties();
  } else {
    buildTable_JSON();
  };
};

function getTranslationString(obj,projectType) {
  var wise5ProjectTypes = ["common5", "vle5", "authoringTool5", "classroomMonitor5"];
  if (wise5ProjectTypes.indexOf(projectType) > -1 || projectType.endsWith("5")) {
    // this is a WISE5 project
    return JSON.stringify(obj, Object.keys(obj).sort(), 2);
  } else if ("Properties" == getFileType(projectType)) {
    return getTranslationString_Properties(obj);
  } else {
    var newObj = {};
    for (key in obj) {
      newObj[key] = {};
      newObj[key].description = addSlashes(obj[key].description);
      newObj[key].value = addSlashes(obj[key].value);
    }
    return FormatJSON(newObj);
  }
};

/**
 * Synchronously retrieves specified locale properties mapping file
 */
View.prototype.retrieveLocale = function(locale,projectType) {
  if ("Properties" == getFileType(projectType)) {
    this.retrieveLocale_Properties(locale,projectType);
  } else {
    this.retrieveLocale_JSON(locale,projectType);
  }
};

/*
 * before user navigates away from the page or refreshes it, check to see if
 * user needs to save changes or not
 */
window.onbeforeunload = function() {
  if (isDirty) {
    /*
     * this will ensure that the user sees an "Are you sure? Unsaved things will
     * be deleted" message
     */
    return false;
  } else {
    return true;
  }
};

function addSlashes( str ) {
  if (str == null) {
    return "";
  }
  return str.replace(/\"/g, "\\\"").replace(/[\n]/g, "\\n");
};
