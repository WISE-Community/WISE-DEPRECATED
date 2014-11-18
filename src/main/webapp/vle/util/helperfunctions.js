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

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/util/helperfunctions.js');
};