/**
 * Global helper functions
 */


function createAttribute(doc, node, type, val){
	var attribute = doc.createAttribute(type);
	attribute.nodeValue = val;
	node.setAttributeNode(attribute);
};

function createElement(doc, type, attrArgs){
	var newElement = doc.createElement(type);
	if(attrArgs!=null){
		for(var option in attrArgs){
			createAttribute(doc, newElement, option, attrArgs[option]);
		};
	};
	return newElement;
};

/**
 * returns a <br> element
 */
function createBreak(){
	return createElement(document, 'br', null);
};

/**
 * returns a space
 */
function createSpace(){
	return document.createTextNode(' ');
};

/**
 * Given a string, returns a URI encoded string.
 * 
 * @param String
 * @return String
 */
function encodeString(text){
	return encodeURIComponent(text);
};

/**
 * Returns the element(s) with the given attributeName. If the attributeValue
 * is specified, it will filter further.
 * @param attributeName
 * @param attributeValue
 * @return
 */
function getElementsByAttribute(attributeName, attributeValue, frameName) {
	var doc = (frameName) ? window.frames['ifrm'].document.frames[frameName].document : window.frames['ifrm'].document;
	
	if (attributeValue != null) {
		return $(doc).filter('[' + attributeName + '=' + attributeValue + ']');
	} else if(doc){
		return $(doc).filter('[' + attributeName + ']');
		var nodes = bodyNode.queryAll('['+attributeName+']');
	}
};

/**
 * returns true iff the URL returns a 200 OK message
 * @param url url to test
 * @return
 */
function checkAccessibility(url) {
	$.ajax({type:'HEAD', url:url, success:function(){return true;},error:function(){return false;}});
};

/**
 * Given an html string, removes all whitespace and returns that string
 * 
 * @param html String
 * @return html String without whitespace
 */
function normalizeHTML(html){
	return html.replace(/\s+/g,'');
};

// define array.contains method, which returns true iff the array
//contains the element specified
if(!Array.contains){
	Array.prototype.contains = function(obj) {
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return true;
            }
        }
        return false;
	};
};

//IE 7 doesn't have indexOf method, so we need to define it........
if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    };
}


/**
 * Adds a compare function to Array.prototype if one
 * does not exist
 */
if(!Array.compare){
	Array.prototype.compare = function(testArr) {
	    if (this.length != testArr.length) return false;
	    for (var i = 0; i < testArr.length; i++) {
	        if (this[i].compare) { 
	            if (!this[i].compare(testArr[i])) return false;
	        };
	        if (this[i] !== testArr[i]) return false;
	    };
	    return true;
	};
};

/**
 * Hides the element with the given id
 */
function hideElement(id){
	document.getElementById(id).style.display = 'none';
};

/**
 * Shows the element with the given id
 */
function showElement(id){
	document.getElementById(id).style.display = 'block';
};

/**
 * Given an html element obj, returns its absolute location
 * (left & top) in the page.
 * 
 * @param HTML Element
 * @return obj {left, top}
 */
function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return {left: curleft, top: curtop};
};

/**
 * Returns the number of fields that the given object has.
 */
function objSize(obj){
	var count = 0;
	for(var field in obj){
		if(obj.hasOwnProperty(field)){
			count++;
		};
	};
	return count;
};


/**
 * Creates an xml doc object from the xml string
 * @param txt xml text
 * @return
 */
function loadXMLDocFromString(txt) {
	try //Internet Explorer
	{
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async="false";
		xmlDoc.loadXML(txt);
		return(xmlDoc); 
	}
	catch(e)
	{
		try //Firefox, Mozilla, Opera, etc.
		{
			parser=new DOMParser();
			xmlDoc=parser.parseFromString(txt,"text/xml");
			return(xmlDoc);
		}
		catch(e) {alert(e.message)}
	}
	return(null);
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/common/helperfunctions.js');
};