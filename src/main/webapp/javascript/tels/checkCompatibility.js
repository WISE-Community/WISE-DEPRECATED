/**
 * This file contains functions that check if the client has
 * the necessary resource requirements to run wise4 projects.
 */


//the default requirements
var defaultRequirements = {
	requiredFirefoxVersion:'6.0',
	requiredInternetExplorerVersion:'9.0',
	requiredChromeVersion:'5.0',
	requiredSafariVersion:'3.0',
	requiredQuickTimeVersion:'7.0',
	requiredFlashVersion:'10.0',
	requiredJavaVersion:'1.6'
}

/**
 * Combines the specific requirements with the default requirements
 * and then checks each of the requirements.
 * 
 * Note: if javascript is disabled, all the checks will not be run and
 * the contents in the <noscript> tag in the check.jsp will be the only
 * row displayed in the compatibility check table. The row in the
 * <noscript> tag will show the user that javascript is disabled and
 * that they will need to enable it.
 * 
 * @param requirements a JSON object that is used to override any
 * or all of the default requirements
 * 
 * if a specific project has its own specific requirements it can just specify
 * the requirement for the resource that has a different requirement than
 * the default and for all other resources it will fallback to the default.
 * 
 * e.g. this specificRequirements will override the required versions of flash and java
 * 
 * specificRequirements = {requiredFlashVersion:6.0,requiredJavaVersion:1.5}
 * 
 * the compatibility check will look for a flash version 6.0 or greater
 * and a Java version 1.5 or greater and for all other resources it
 * will just use the default from defaultRequirements
 */
function checkCompatibility(specificRequirements) {
	//get the default requirements
	var combinedRequirements = defaultRequirements;
	
	//if there are any specific requirements we will obtain them
	if(specificRequirements != null) {
		if(specificRequirements.requiredFirefoxVersion != null) {
			//override the firefox version requirement
			combinedRequirements.requiredFirefoxVersion = specificRequirements.requiredFirefoxVersion;
		}
		
		if(specificRequirements.requiredInternetExplorerVersion != null) {
			//override the ie version requirement
			combinedRequirements.requiredInternetExplorerVersion = specificRequirements.requiredInternetExplorerVersion;
		}
		
		if(specificRequirements.requiredChromeVersion != null) {
			//override the chrome version requirement
			combinedRequirements.requiredChromeVersion = specificRequirements.requiredChromeVersion;
		}
		
		if(specificRequirements.requiredSafariVersion != null) {
			//override the safari version requirement
			combinedRequirements.requiredSafariVersion = specificRequirements.requiredSafariVersion;
		}
		
		if(specificRequirements.requiredQuickTimeVersion != null) {
			//override the quicktime version requirement
			combinedRequirements.requiredQuickTimeVersion = specificRequirements.requiredQuickTimeVersion;
		}
		
		if(specificRequirements.requiredFlashVersion != null) {
			//override the flash version requirement
			combinedRequirements.requiredFlashVersion = specificRequirements.requiredFlashVersion;
		}
		
		if(specificRequirements.requiredJavaVersion != null) {
			//override the java version requirement
			combinedRequirements.requiredJavaVersion = specificRequirements.requiredJavaVersion;
		}
	}
	
	var requiredResources = true;
	var recommendedResources = true;
	
	//check required resources
	requiredResources = checkJavascript() && requiredResources;
	requiredResources = checkBrowser(combinedRequirements) && requiredResources;
	
	//check recommended resources
	recommendedResources = checkQuickTime(combinedRequirements.requiredQuickTimeVersion) && recommendedResources;
	recommendedResources = checkFlash(combinedRequirements.requiredFlashVersion) && recommendedResources;
	recommendedResources = checkJava(combinedRequirements.requiredJavaVersion) && recommendedResources;
	
	if(requiredResources) {
		$('#browserPass').show();
	} else {
		$('#browserFail').show();
	}
	
	checkContentFiltering();
}

/**
 * Checks whether the client version satisfies the required version.
 * This function is a generic function that all the checks will use. 
 * 
 * @param yourVersion the client version (can be string, int, or float)
 * @param requiredVersion the required version (can be string, int, or float)
 * @return whether the client has the necessary version
 */
function requiredVersionSatisfied(yourVersion, requiredVersion) {
	//get the client version
	yourVersion = parseFloat(yourVersion);
	
	//get the required version
	requiredVersion = parseFloat(requiredVersion);
	
	//check that the client version is greater or equal to the required version
	if(yourVersion >= requiredVersion) {
		return true;
	} else {
		return false;
	}
}

/**
 * Obtains the img html that will notify the user whether their client
 * satisfies the required version for a resource.
 * This function is a generic function that all the checks will use. 
 * 
 * @param satisfied boolean true or false
 * @return a string containing the img html that will display a
 * green check (for pass) or a red x (for fail)
 */
function getRequirementSatisfiedIcon(satisfied) {
	var iconImg = "";
	
	if(satisfied) {
		//the client satisfies the requirement
		iconImg = "<img alt='check' src='../themes/tels/default/images/check_16.gif' />";
	} else {
		//the client does not satisfy the requirement
		iconImg = "<img alt='error' src='../themes/tels/default/images/error_16.gif' />";
	}
	
	return iconImg;
}

/**
 * Obtain the OS (this will not include the version of the OS)
 * @return the OS as a string (return values are 'Mac', 'Windows', or 'Linux')
 */
function getOS() {
	return BrowserDetect.OS;
}

/**
 * Check that javascript is enabled and fill in the values in the 
 * compatibility check table. We do not have to actually check
 * if javascript is enabled. If it is enabled these values will
 * be filled into the table. If it is not, the <noscript> tag
 * in the check.jsp will display javascript as disabled.
 */
function checkJavascript() {
	$('#jsEnabled').show();
	document.getElementById('javascriptRequirementSatisfied').innerHTML = "<img alt='check' src='../themes/tels/default/images/check_16.gif' />";

	return true;
}

/**
 * Checks if the browser the user is currently using meets
 * or surpasses the required version of that browser. It will
 * fill in the values in the compatibility check table for
 * the browser row.
 * 
 * @param requirements a JSON object containing the fields below
 * requiredFirefoxVersion
 * requiredInternetExplorerVersion
 * requiredChromeVersion
 * requiredSafariVersion
 * the value of each field can be a string, int or float
 */
function checkBrowser(requirements) {
	document.getElementById('browserResource').innerHTML = getBrowserName();
	document.getElementById('browserRequiredVersion').innerHTML = getBrowserRequiredVersion(requirements);
	document.getElementById('browserYourVersion').innerHTML = getBrowserVersion();
	
	//get whether the browser meets the requirement
	var browserPassed = checkBrowserVersion(requirements);
	
	//check if the browser version is satisfied and then get the icon to be displayed (pass or fail)
	var requirementSatisfiedIcon = getRequirementSatisfiedIcon(browserPassed);
	
	document.getElementById('browserRequirementSatisfied').innerHTML = requirementSatisfiedIcon;
	showBrowserAdditionalInfo();
	//document.getElementById('browserAdditionalInfo').innerHTML = getBrowserAdditionalInfo();
	
	if(browserPassed) {
		return true;
	} else {
		//browser version is too old so we will display a warning message about the browser
		
		var browserName = getBrowserName();
		if(browserName == ('Firefox' || 'Chrome')) {
			$('#browserFailMsg').show();
		} else {
			$('#browserFailMsgUnsupported').show();
		}
		
		return false;
	}
}

/**
 * Check if the client browser version satisfies the requirements
 * @param requirements a JSON object containing the fields below
 * requiredFirefoxVersion
 * requiredInternetExplorerVersion
 * requiredChromeVersion
 * requiredSafariVersion
 * the value of each field can be a string, int or float
 * 
 * @return whether the version of the browser they are currently using
 * meets or surpasses the required version for that browser
 */
function checkBrowserVersion(requirements) {
	/*
	 * get the required version of the browser they are currently using,
	 * this function will detect which browser the user is using
	 * and return the required version for that specific browser
	 */
	var requiredVersion = getBrowserRequiredVersion(requirements);
	
	//get the version of the browser the user is currently using
	var yourVersion = getBrowserVersion();
	
	//check if the client browser version meets the requirement
	return requiredVersionSatisfied(yourVersion, requiredVersion);
}

/**
 * Get the name of the browser that the client is currently using.
 * @return a string containing the name of the browser such as
 * 'Firefox'
 * 'Internet Explorer'
 * 'Chrome'
 * 'Safari'
 * you may view all the other browser names in browserdetect.js
 * look for the identity fields
 */
function getBrowserName() {
	return BrowserDetect.browser;
}

/**
 * Get the language that the browser  is currently using.
 * @return
 */
function getBrowserLanguage() {
	return BrowserDetect.language;
}
/**
 * Get the required version for the browser the client is
 * currently using
 * 
 * @param requirements a JSON object containing the fields below
 * requiredFirefoxVersion
 * requiredInternetExplorerVersion
 * requiredChromeVersion
 * requiredSafariVersion
 * the value of each field can be a string, int or float
 * 
 * @return the required version of the browser the client
 * is currently using
 */
function getBrowserRequiredVersion(requirements) {
	//get the name of the browser the client is currently using
	var browserName = getBrowserName();
	
	var requiredVersion = '';
	
	//get the required version for the browser the client is using
	if(browserName == 'Firefox') {
		requiredVersion = requirements.requiredFirefoxVersion;
	} else if(browserName == 'Internet Explorer') {
		requiredVersion = requirements.requiredInternetExplorerVersion;
	} else if(browserName == 'Chrome') {
		requiredVersion = requirements.requiredChromeVersion;
	} else if(browserName == 'Safari') {
		requiredVersion = requirements.requiredSafariVersion;
	}
	
	return requiredVersion;
}

/**
 * Get the version of the browser that the client is currently using.
 * @return the version of the browser that the client is currently using
 */
function getBrowserVersion() {
	return BrowserDetect.version;
}

/**
 * Shows the link that we will display on the browser row for users
 * to upgrade their browser.
 */
function showBrowserAdditionalInfo() {
	var browserName = getBrowserName();
	
	//show the correct link for the browser user is running (show Firefox link by default)
	if(browserName == 'Internet Explorer') {
		$('#upgradeIE').show();
	} else if(browserName == 'Chrome') {
		$('#upgradeChrome').show();
	} else if(browserName == 'Safari') {
		$('#upgradeSafari').show();
	} else {
		$('#upgradeFirefox').show();
	}
}

/**
 * Checks if the quicktime version the user is currently using meets
 * or surpasses the required version of quicktime. It will
 * fill in the values in the compatibility check table for
 * the quicktime row.
 * 
 * @param requiredQuickTimeVersion the required version of quicktime
 */
function checkQuickTime(requiredQuickTimeVersion) {
	document.getElementById('quickTimeRequiredVersion').innerHTML = requiredQuickTimeVersion;
	document.getElementById('quickTimeYourVersion').innerHTML = getQuickTimeVersion();
	
	//get whether quicktime meets the requirement
	var quickTimePassed = checkQuickTimeVersion(requiredQuickTimeVersion);
	
	//check if the quicktime version is satisfied and then get the icon to be displayed (pass or fail)
	var requirementSatisfiedIcon = getRequirementSatisfiedIcon(quickTimePassed);
	
	document.getElementById('quickTimeRequirementSatisfied').innerHTML = requirementSatisfiedIcon;
	
	if(quickTimePassed) {
		return true;
	} else {
		//quicktime version is too old so we will display a warning message about quicktime
		$('#qtMsg').show();
		
		return false;
	}
}

/**
 * Check if the client quicktime version satisfies the requirements
 * @param requiredQuickTimeVersion the required version of quicktime
 * @return whether the version of quicktime they are currently using
 * meets or surpasses the required version of quicktime
 */
function checkQuickTimeVersion(requiredQuickTimeVersion) {
	//get the required version of quicktime
	var requiredVersion = requiredQuickTimeVersion;
	
	//get the version of quicktime the user is currently using
	var yourVersion = getQuickTimeVersion();

	return requiredVersionSatisfied(yourVersion, requiredVersion);
}

/**
 * Get the version of quicktime that the client is currently using.
 * @return the version of quicktime that the client is currently using
 */
function getQuickTimeVersion() {
	var qtVersion = '-';
	
	if (navigator.plugins) {
		//loop through all the browser plugins
		for (i=0; i < navigator.plugins.length; i++ ) {
			//search for the quicktime plugin
			if (navigator.plugins[i].name.indexOf("QuickTime") >= 0)
			{
				/*
				 * the plugin name will be like
				 * QuickTime Plug-In 7.6.4
				 * or
				 * QuickTime Plug-in 7.6.4
				 * so we will remove any 'QuickTime Plug-In ' or 'QuickTime Plug-in '
				 * part of the name to obtain the quicktime version
				 */
				qtVersion = navigator.plugins[i].name.replace('QuickTime Plug-In ', '').replace('QuickTime Plug-in ', '');
			}
		}
	}

	return qtVersion;
}

/**
 * Checks if the java version the user is currently using meets
 * or surpasses the required version of java. It will
 * fill in the values in the compatibility check table for
 * the java row.
 */
function checkJava(requiredJavaVersion) {
	document.getElementById('javaRequiredVersion').innerHTML = requiredJavaVersion;
	document.getElementById('javaYourVersion').innerHTML = getJavaVersion();
	
	//get whether java meets the requirement
	var javaPassed = checkJavaVersion(requiredJavaVersion);
	
	//check if the java version is satisfied and then get the icon to be displayed (pass or fail)
	var requirementSatisfiedIcon = getRequirementSatisfiedIcon(javaPassed);
	
	document.getElementById('javaRequirementSatisfied').innerHTML = requirementSatisfiedIcon;

	if(javaPassed) {
		return true;
	} else {
		//java version is too old so we will display a warning message about java
		$('#javaMsg').show();
		
		return false;
	}
}

/**
 * Get the version of java that the client is currently using.
 * Look at deployJava.js to see how the java version is obtained.
 * @return the version of java that the client is currently using
 */
function getJavaVersion() {
	var javaVersion = '';
	
	//obtain an array of the JREs that are installed on the client
	var jres = deployJava.getJREs();
	
	//loop through all the jre versions
	for(var x=0; x<jres.length; x++) {
		//get a jre version
		var jre = jres[x];

		/*
		 * set the java version to the current jre if this is the
		 * first jre or if the jre version is greater than the 
		 * java version we currently have stored
		 */
		if(javaVersion == '' || parseFloat(jre) >= parseFloat(javaVersion)) {
			javaVersion = jre;
		}
	}
	
	if(javaVersion == '') {
		//set the java version to 'Not Installed' if we did not find any jres
		javaVersion = '-';
	}
	
	return javaVersion;
}

/**
 * Check if the client java version satisfies the requirements
 * @param requiredJavaVersion the required version of java
 * @return whether the version of java they are currently using
 * meets or surpasses the required version of java
 */
function checkJavaVersion(requiredJavaVersion) {
	//get the required version of java
	var requiredVersion = requiredJavaVersion;
	
	//get the version of java the user is currently using
	var yourVersion = getJavaVersion();
	
	return requiredVersionSatisfied(yourVersion, requiredVersion);
}

/**
 * Checks if the flash version the user is currently using meets
 * or surpasses the required version of flash. It will
 * fill in the values in the compatibility check table for
 * the flash row.
 */
function checkFlash(requiredFlashVersion) {
	document.getElementById('flashRequiredVersion').innerHTML = requiredFlashVersion;
	document.getElementById('flashYourVersion').innerHTML = getFlashVersion();
	
	//get whether flash meets the requirement
	var flashPassed = checkFlashVersion(requiredFlashVersion);
	
	//check if the flash version is satisfied and then get the icon to be displayed (pass or fail)
	var requirementSatisfiedIcon = getRequirementSatisfiedIcon(flashPassed);
	
	document.getElementById('flashRequirementSatisfied').innerHTML = requirementSatisfiedIcon;
	
	if(flashPassed) {
		return true;
	} else {
		//flash version is too old so we will display a warning message about flash
		$('#flashMsg').show();
		
		return false;
	}
}

/**
 * Get the version of flash that the client is currently using.
 * @return the version of flash that the client is currently using
 */
function getFlashVersion() {
	var flashVersion = '-';
	
	var getFlashVersion = JSGetSwfVer();
	
	if(getFlashVersion != -1) {
		flashVersion = getFlashVersion;
	}
	
	return flashVersion;
}

/**
 * Check if the client flash version satisfies the requirements
 * @param requiredFlashVersion the required version of flash
 * @return whether the version of flash they are currently using
 * meets or surpasses the required version of flash
 */
function checkFlashVersion(requiredFlashVersion) {
	//get the required version of flash
	var requiredVersion = requiredFlashVersion;
	
	//get the version of flash the user is currently using
	var yourVersion = getFlashVersion();
	
	return requiredVersionSatisfied(yourVersion, requiredVersion);
}

//from Macromedia's Flash detection kit

//Detect Client Browser type
var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;
jsVersion = 1.1;
//JavaScript helper required to detect Flash Player PlugIn version information
function JSGetSwfVer(i){
	// NS/Opera version >= 3 check for Flash plugin in plugin array
	if (navigator.plugins != null && navigator.plugins.length > 0) {
		if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
			var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
   		var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
			descArray = flashDescription.split(" ");
			tempArrayMajor = descArray[2].split(".");
			versionMajor = tempArrayMajor[0];
			versionMinor = tempArrayMajor[1];
			if ( descArray[3] != "" ) {
				tempArrayMinor = descArray[3].split("r");
			} else {
				tempArrayMinor = descArray[4].split("r");
			}
   		versionRevision = tempArrayMinor[1] > 0 ? tempArrayMinor[1] : 0;
         flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
   	} else {
			flashVer = -1;
		}
	}
	// MSN/WebTV 2.6 supports Flash 4
	else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
	// WebTV 2.5 supports Flash 3
	else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
	// older WebTV supports Flash 2
	else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
	// Can't detect in all other cases
	else {
		
		flashVer = -1;
	}
	return flashVer;
} 


//When called with reqMajorVer, reqMinorVer, reqRevision returns true if that version or greater is available
function DetectFlashVer(reqMajorVer, reqMinorVer, reqRevision) 
{
	reqVer = parseFloat(reqMajorVer + "." + reqRevision);
	// loop backwards through the versions until we find the newest version	
	for (i=25;i>0;i--) {	
		if (isIE && isWin && !isOpera) {
			versionStr = VBGetSwfVer(i);
		} else {
			versionStr = JSGetSwfVer(i);		
		}
		if (versionStr == -1 ) { 
			return false;
		} else if (versionStr != 0) {
			if(isIE && isWin && !isOpera) {
				tempArray         = versionStr.split(" ");
				tempString        = tempArray[1];
				versionArray      = tempString .split(",");				
			} else {
				versionArray      = versionStr.split(".");
			}
			versionMajor      = versionArray[0];
			versionMinor      = versionArray[1];
			versionRevision   = versionArray[2];
			
			versionString     = versionMajor + "." + versionRevision;   // 7.0r24 == 7.24
			versionNum        = parseFloat(versionString);
     	// is the major.revision >= requested major.revision AND the minor version >= requested minor
			if ( (versionMajor > reqMajorVer) && (versionNum >= reqVer) ) {
				return true;
			} else {
				return ((versionNum >= reqVer && versionMinor >= reqMinorVer) ? true : false );	
			}
		}
	}	
};

/**
 * Check if user is behind a firewall that prevents them from viewing certain resources
 * like .swf, .jar, etc. 
 * Note: Chrome and Safari seems to add extra to the response length so we need to 
 * check for >=.
 */
function checkContentFiltering() {
	// test loading of swf file
	$.ajax({ 
		url: "/webapp/flash/tels/convection-intro.swf", 
		context: document.body})
		.success(function(data, textStatus, jqXHR) {
			var contentFilterSwfRequirementSatisfied=false;
			if (jqXHR.status == '200' 
					&& jqXHR.responseText != ''
					&& jqXHR.responseText.length > 0) {
				contentFilterSwfRequirementSatisfied = true;
			} else {
				contentFilterSwfRequirementSatisfied = false;
			}
			var requirementSatisfiedIcon = getRequirementSatisfiedIcon(contentFilterSwfRequirementSatisfied);				
			document.getElementById('contentFilterSwfRequirementSatisfied').innerHTML = requirementSatisfiedIcon;		
		})
		.error(function(jqXHR,textStatus,exception) {
			var requirementSatisfiedIcon = getRequirementSatisfiedIcon(false);				
			document.getElementById('contentFilterSwfRequirementSatisfied').innerHTML = requirementSatisfiedIcon;
		});	

	// test loading of jar file
	var jqxhr = $.ajax({ 
		url: "/webapp/library/jar/commons-logging-1.1.jar", 
		context: document.body})
		.success(function(data, textStatus, jqXHR) {			
			var contentFilterRequirementSatisfied=false;
			if (jqXHR.status == '200' 
					&& jqXHR.responseText != ''
					&& jqXHR.responseText.length >= 49828) {
				contentFilterRequirementSatisfied = true;
			} else {
				contentFilterRequirementSatisfied = false;
			}
			var requirementSatisfiedIcon = getRequirementSatisfiedIcon(contentFilterRequirementSatisfied);				
			document.getElementById('contentFilterJarRequirementSatisfied').innerHTML = requirementSatisfiedIcon;		
		})
		.error(function(jqXHR,textStatus,exception) {
			var requirementSatisfiedIcon = getRequirementSatisfiedIcon(false);				
			document.getElementById('contentFilterJarRequirementSatisfied').innerHTML = requirementSatisfiedIcon;
		});

};

/**
 * If browser is not WISE4 compatible, alert the user
 * Currently, if the user is not using Firefox or Chrome, alert the user
 * TODO: internationalize in a more standard way
 */
function alertBrowserCompatibility() {
	if (getBrowserName() != "Firefox" && getBrowserName() != "Chrome") {
		var userLang = getBrowserLanguage();
		var useFirefoxMsg = "WISE has detected that you are not using Firefox or Chrome.\n\n" +
				"Some things may not work properly. For best results, please use " +
				"Firefox 3.5 or newer or the latest version of Chrome.";
		if (userLang == "ja") {
			useFirefoxMsg = "Firefox\u610f\u5916\u306e\u30d6\u30e9\u30a6\u30b6\u30fc\u306f\u30b5\u30dd\u30fc\u30c8\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002Firefox 3.5\u4ee5\u4e0a\u3092\u304a\u4f7f\u3044\u304f\u3060\u3055\u3044\u3002";
		} else if (userLang == "zh_TW") {
			useFirefoxMsg = "Firefox\u610f\u5916\u306e\u30d6\u30e9\u30a6\u30b6\u30fc\u306f\u30b5\u30dd\u30fc\u30c8\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002Firefox 3.5\u4ee5\u4e0a\u3092\u304a\u4f7f\u3044\u304f\u3060\u3055\u3044\u3002";
		}
		alert(useFirefoxMsg);
	};
}