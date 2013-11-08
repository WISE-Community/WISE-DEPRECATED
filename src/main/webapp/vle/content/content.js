/*
 * Creates an content object
 * @param url the path to the content file
 * @param contentBaseUrlParam (optional) the path to the content base, this
 * is used to change the relative assets paths to absolute paths. if this
 * param is provided, it will change the assets paths, if it is not, it will
 * not change the assets paths.
 */
function createContent(url, contentBaseUrlParam){
	return function(url, contentBaseUrlParam){
		var url = url;
		var contentBaseUrl = contentBaseUrlParam;
		
		//make sure the contentBaseUrl ends with '/'
		if(contentBaseUrl != null && contentBaseUrl.charAt(contentBaseUrl.length - 1) != '/') {
			contentBaseUrl += '/';
		}
		
		var contentString;
		var contentXML;
		var contentJSON;
		var contentLoaded = false;
		var MAX_TIME = 30000;
		var timer;
		
		/**
		 * Fires event alert if eventManager exists, alerts message otherwise
		 */
		var msg = function(text){
			if(typeof notificationManager != 'undefined'){
				notificationManager.notify(text,3);
			} else {
				alert(text);
			};
		};
		
		/**
		 * If content has been previously loaded, returns the content
		 * in the format of the given type, otherwise, retrieves the
		 * content and then returns the content in the format of the 
		 * given type.
		 */
		var getContent = function(type){
			if(contentLoaded){
				return contentType(type);
			} else {
				return retrieveContent(type);
			};
		};
		
		/**
		 * returns the content in the format of the given type
		 */
		var contentType = function(type){
			if(type=='xml'){
				return contentXML;
			} else if(type=='json'){
				return contentJSON;
			} else if(type=='string'){
				return contentString;
			} else {
				return null;
			};
		};
		
		/**
		 * Makes a synchronous XHR request, parses the response as
		 * string, xml and json (when possible) and returns the content
		 * in the format of the given type.
		 */
		var retrieveContent = function(type){
			//make synchronous request
			timer = setTimeout('eventManager.fire("contentTimedOut","' + url + '")',MAX_TIME);
			var req = new XMLHttpRequest();
			req.open('GET', url, false);
			req.send(null);
			clearTimeout(timer);
			
			//parse the response in various formats if any response format has a value
			if(req.responseText.match('content="login for portal"') != null) {
				/*
				 * we received a login page as the response which means the user session has timed out
				 * we will logout the user from the vle
				 */
				view.forceLogout();
			} else if(req.responseText || req.responseXML){
				//xml
				if(req.responseXML){
					contentXML = req.responseXML;
				} else {//create xmlDoc from string
					setContentXMLFromString(req.responseText);
				};
				
				//string
				if(req.responseText){
					contentString = req.responseText;
				} else {//serialize xml to string
					if(window.ActiveXObject){
						contentString = req.responseXML.xml;
					} else {
						contentString = (new XMLSerializer()).serializeToString(req.responseXML);
					};
				};
				
				if(contentBaseUrl != null) {
					//change the relative assets path to an absolute path
					contentString = contentString.replace(new RegExp('\"./assets', 'g'), '\"'+contentBaseUrl + 'assets');
					contentString = contentString.replace(new RegExp('\"/assets', 'g'), '\"'+contentBaseUrl + 'assets');
					contentString = contentString.replace(new RegExp('\"assets', 'g'), '\"'+contentBaseUrl + 'assets');
					contentString = contentString.replace(new RegExp('\'./assets', 'g'), '\''+contentBaseUrl + 'assets');
					contentString = contentString.replace(new RegExp('\'/assets', 'g'), '\''+contentBaseUrl + 'assets');
					contentString = contentString.replace(new RegExp('\'assets', 'g'), '\''+contentBaseUrl + 'assets');
					contentString = contentString.replace(new RegExp('\"url=assets', 'g'), '\"url='+contentBaseUrl + 'assets');

					//contentString = contentString.replace(/^\.\/assets|^\/assets|^assets/gi, contentBaseUrl + 'assets');
				}
				
				//json
				try{
					contentJSON = $.parseJSON(contentString);
				} catch(e){
					contentJSON = undefined;
				};
				
				//set content loaded
				contentLoaded = true;
				
				//return appropriate response type
				return contentType(type);
			} else {
				msg('Error retrieving content for url: ' + url);
				return null;
			};
		};
		
		/**
		 * Sets and parses this content object's content
		 */
		var setContent = function(content){
			//check for different content types and parse to other types as appropriate
			if(typeof content=='string'){//string
				contentString = content;
				setContentXMLFromString(contentString);
				try{
					contentJSON = $.parseJSON(contentString);
				} catch(e){
					contentJSON = undefined;
				};
			} else {
				if(window.ActiveXObject){//IE
					if(content.xml){//xml Doc in IE
						contentXML = content;
						contentString = content.xml;
						try{
							contentJSON = $.parseJSON(contentString);
						} catch(e){
							contentJSON = undefined;
						};
					} else {//must be object
						contentJSON = content;
						try{
							contentString = $.stringify(contentJSON);
							setContentXMLFromString(contentString);
						} catch(e){
							contentJSON = undefined;
						};
					};
				} else {//not ie
					if(content instanceof Document){//xmlDoc
						contentXML = content;
						contentString = (new XMLSerializer()).serializeToString(contentXML);
						try{
							contentJSON = $.parseJSON(contentString);
						} catch(e){
							contentJSON = undefined;
						};
					} else {//must be object
						contentJSON = content;
						try{
							contentString = $.stringify(contentJSON);
							setContentXMLFromString(contentString);
						} catch(e){
							contentString = undefined;
						};
					};
				};
			};
			
			//set content loaded
			contentLoaded = true;
		};
		
		/**
		 * Returns true if the given xmlDoc does not contain any parsererror
		 * tag in non-IE browsers or the length of xmlDoc.xml is > 0 in IE
		 * browers, returns false otherwise.
		 */
		var validXML = function(xml){
			if(window.ActiveXObject){//IE
				if(xml.xml.length==0){
					return false;
				} else {
					return true;
				};
			} else {//not IE
				return xml.getElementsByTagName('parsererror').length < 1;
			};
		};
		
		/**
		 * Sets the contentXML variable
		 */
		var setContentXMLFromString = function(str){
			try {
				if(document.implementation && document.implementation.createDocument){
					contentXML = new DOMParser().parseFromString(str, "text/xml");
				} else if(window.ActiveXObject){
					contentXML = new ActiveXObject("Microsoft.XMLDOM")
					contentXML.loadXML(str);
				};				
			} catch (exception) {
				contentXML = undefined;
				return;
			}
			
			if(!validXML(contentXML)){
				contentXML = undefined;
			};
		};
		
		/* Returns the filename for this content given the contentBaseUrl */
		var getFilename = function(contentBase){
			return url.substring(url.indexOf(contentBase) + contentBase.length + 1, url.length);
		};
		
		return {
			/* Returns this content as an xmlDoc if possible, else returns undefined */
			getContentXML:function(){return getContent('xml');},
			/* Returns this content as a JSON object if possible, else returns undefined */
			getContentJSON:function(){return getContent('json');},
			/* Returns this content as a string */
			getContentString:function(){return getContent('string');},
			/* Sets this content given any of: a string, json object, xmlDoc */
			setContent:function(content){setContent(content);},
			/* Retrieves the content but does not return it (for eager loading) */
			retrieveContent:function(){getContent('string');},
			/* Returns the url for this content */
			getContentUrl:function(){return url;},
			/* Returns the filename for this content given the contentBaseUrl */
			getFilename:function(contentBase){return getFilename(contentBase);}
		};
	}(url, contentBaseUrlParam);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/content/content.js');
}