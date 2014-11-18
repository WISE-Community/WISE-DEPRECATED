
/**
 * Registers new i18n prototype to VLEView
 */
View.prototype.i18n = {
		locales:[]
};

// default locale, in case all else fails...this guy will save the day. He's like Superman.
View.prototype.i18n.defaultLocale = "en_US";

/**
 * Map of supportedLocales to their equivalent locale codes that WISE knows about.
 * For example, nl_NL and nl_BG are both nederlands, and should map to locale "nl", which WISE will use to look up the
 * translation values for both nl_NL and nl_BG.
 * 
 * This saves us from having to write out two translation files.
 * (unless we want to translate to nl_NL and nl_BG...we can certainly do this also)
 */  
View.prototype.i18n.supportedLocales = {
		main: {
			"en_US":"en_US",
			"es":"es",
			"fr":"fr",
			"iw":"he",
			"it":"it",
			"ja":"ja",
			"ko":"ko",
			"nl":"nl",
			"nl_NL":"nl",
			"nl_BG":"nl",
			"th":"th",
			"tr":"tr",
			"zh_CN":"zh_CN",
			"zh_TW":"zh_TW"
		},
		theme: {
			"en_US":"en_US",
			"es":"es",
			"it":"it",
			"iw":"he",
			"ja":"ja",
			"ko":"ko",
			"nl":"nl",
			"nl_NL":"nl",
			"nl_BG":"nl",
			"th":"th",
			"tr":"tr",
			"zh_CN":"zh_CN",
			"zh_TW":"zh_TW"
		}
};

/**
 * Returns translated value of the given key for most of the VLE UI, the "main"
 * Uses locale that was specified in config. To specify
 * locale, use View.prototype.i18n.getString(key,locale) directly instead.
 * @param key
 * @return
 */
View.prototype.getI18NString = function(key, componentName) {
	if (!componentName) {
		componentName = "main";
	}
	return this.i18n.getString(key,this.config.getConfigParam("locale"),componentName);	
};

/**
 * Injects provided params into the translated string for most of the VLE UI, the "main"
 * @param key is the key used to lookup the value in i18n_XX.js file
 * @param params is an array of values to replace in the translated string.
 * the translated string should have the same number of replaceable elements as in the params
 * ex. params: ['goodbye', 'hello']
 * translated string: 'You say {0}, I say {1}'
 * 
 * Uses locale that was specified in config. To specify
 * locale, use View.prototype.i18n.getStringWithParam(key,locale,params) directly instead.
 */
View.prototype.getI18NStringWithParams = function(key,params, componentName) {
	if (!componentName) {
		componentName = "main";
	}
	return this.i18n.getStringWithParams(key,this.config.getConfigParam("locale"),params,componentName);		
};

/**
 * @param key is the key used to lookup the value in i18n_XX.js file
 * @param locale is which locale to use. will be appended in i18n_[locale].js
 * if local does not exist, use defaultLocale
 * if key is not found, use defaultLocale's values
 * @param componentName [main, theme, node] components of the VLE that has translation. used to look up locale
 * to see if it's supported.
 */
View.prototype.i18n.getString = function(key,locale,componentName) {
	if (!View.prototype.i18n.supportedLocales[componentName]) {
		return "";
	}
	if (View.prototype.i18n.supportedLocales[componentName][locale] != null) {
		// convert locale to a locale that WISE knows about
		locale = View.prototype.i18n.supportedLocales[componentName][locale];
	} else {
		// if specified locale does not exist, use default locale
		locale = View.prototype.i18n.defaultLocale;
	}
	if (!this[componentName]) {
		console.log('no component:' + componentName);
		return "";
	}
	if (!this[componentName][locale]) {
		console.log('no locale:' + locale);
		return "";
	}
	if (this[componentName][locale][key] !== undefined) {
		return this[componentName][locale][key].value;
	} else if (this[componentName][View.prototype.i18n.defaultLocale][key] !== undefined) {
		return this[componentName][View.prototype.i18n.defaultLocale][key].value;		
	} else {
		return "N/A";
	}
};


/**
 * Injects provided params into the translated string
 * @param key is the key used to lookup the value in i18n_XX.js file
 * locale is which locale to use. will be appended in i18n_[locale].js
 * @param params is an array of values to replace in the translated string.
 * the translated string should have the same number of replaceable elements as in the params
 * @param componentName [main, theme, node] components of the VLE that has translation. used to look up locale
 * to see if it's supported.
 * ex. params: ['goodbye', 'hello']
 * translated string: 'You say {0}, I say {1}'
 * if local does not exist, use defaultLocale
 * if key is not found, use defaultLocale's values
 */
View.prototype.i18n.getStringWithParams = function(key,locale,params, componentName) {
	// first get translated string
	var translatedString = this.getString(key,locale,componentName);

	// then go through the string and replace {0} with paramas[0], {1} with params[1], etc.
	for (var i=0; i< params.length; i++) {
		var lookupString = "{"+i+"}";
		var replaceString = params[i];
		translatedString = translatedString.replace(lookupString,replaceString);
	}
	return translatedString;
};

/**
 * Synchronously retrieves specified locale json mapping file
 */
View.prototype.retrieveLocale = function(locale,componentName,localePath) {
	var wiseBaseUrl = view.config.getConfigParam("wiseBaseURL");
	var isAsync = false;
	if(componentName == "theme"){
		isAsync = true;
	}
	if (componentName == "main") {
		isAsync = false;  // fetching i18n files for vle needs to happen synchronously.
		localePath = wiseBaseUrl + "/vle/view/i18n/i18n_" + locale + ".json";		
	} else if (localePath) {
		// trying to load locale for a node, does not need to be sync.
		// get localePath
		//localePath = "node/"
		localePath = wiseBaseUrl + "/" + localePath + "i18n_" + locale + ".json";
	}
	$.ajax({"url":localePath,
		async:isAsync,
		dataType:"json",
		success:function(obj){
			if (!View.prototype.i18n[componentName]) {
				View.prototype.i18n[componentName] = {};
			}
			View.prototype.i18n[componentName][locale] = obj;
		},
		error:function(){
			notificationManager.notify('Please notify server admin: Error retrieving locale file for component:'+componentName, 3);
		}
	});	
};

/**
 *  retrieve i18n file based on VLE config. 
 *  first retrieves default locale and then retrieves user's locale.
 *  @param componentName [main, theme, node]. components that could be translated
 */
View.prototype.retrieveLocales = function(componentName,localePath) {
	// retrieve default locale
	this.retrieveLocale(View.prototype.i18n.defaultLocale,componentName,localePath);

	// retrieve user locale, if exists
	var userLocale = this.config.getConfigParam("locale");		
	if (userLocale != View.prototype.i18n.defaultLocale) {
		if (View.prototype.i18n.supportedLocales[componentName] != null &&
				View.prototype.i18n.supportedLocales[componentName][userLocale] != null) {
			// look up locale in the mapping. e.g. "nl_BG"->"nl"
			var locale = View.prototype.i18n.supportedLocales[componentName][userLocale];
			this.retrieveLocale(locale,componentName,localePath);
		}
	}		
	eventManager.fire('retrieveLocalesCompleted', componentName);
};

/**
 * Finds any DOM elements with data-i18n and data-i18n-* attributes and inserts
 * translation text as the inner html or specified attribute for each element.
 * 
 * Currently supported attributes are: 'title', 'placeholder', 'label', 'name',
 * 'value' (if setting 'value' for an input element, can also just use 'data-i18n')
 * 
 * @param onComplete Callback function to run when i18n insertion is complete.
 */
View.prototype.insertTranslations = function(componentName, onComplete){
	if (!componentName) {
		componentName = "main";
	}
	var view = this,
		attrs = ['i18n-title', 'i18n-placeholder', 'i18n-label', 'i18n-name', 'i18n-value'],
		totalAttrs = attrs.length,
		selector = '[data-i18n]',
		translatableElements = [];
	
	for(var i=0; i<totalAttrs; i++){
		selector += ', [data-' + attrs[i] + ']';
	}
	
	// process and insert i18n text
	if (componentName == "main") {
		translatableElements = $(selector);
	} else if (this.getProject().getUsedNodeTypes().indexOf(componentName) > -1) {
		//component is a node. we're trying to translate strings in the content panel where nodes are rendered
		if (this.currentNode && this.currentNode.contentPanel && this.currentNode.contentPanel.$) {
			translatableElements = $(this.currentNode.contentPanel.$.find(selector));			
		} else if (this.getCurrentNode() && this.getCurrentNode().getType() == "NoteNode") {
			translatableElements = $($("#notePanel").find(selector));						
		};
	}
	var count = translatableElements.length;
	if (count > 0) {
		translatableElements.each(function(){
			var n = totalAttrs,
				i18n = $(this).data('i18n');
			if(typeof i18n === 'string'){
				if ($(this).is("input")) {
					// if input, we need to set the value, not the innerHTML
					$(this).val(view.getI18NString(i18n,componentName));				
				} else {
					$(this).html(view.getI18NString(i18n,componentName));				
				}
				// remove i18n attribute from DOM element
				$(this).removeAttr('data-i18n')
			}
			
			while (n--){
				var attr = attrs[n],
					val = $(this).data(attr);
				if(typeof val === 'string'){ 
					$(this).attr(attr.replace(/^i18n-/, ''), view.getI18NString(val,componentName));
				}
				// remove i18n attribute from DOM element
				$(this).removeAttr(attr);
			}

			// when all i18n text has been inserted, run the callback function
			if(--count == 0){
				if(typeof onComplete === 'function'){
					onComplete();
				}
			}
		});
	}
};


/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/i18n/view_i18n.js');
};
