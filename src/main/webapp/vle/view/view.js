/**
 * A view is a prototype object which is 'built' out of one or more
 * components that contains the appropriate prototypes for that view.
 * @constructor
 * @author: Patrick Lawler
 */
function View(){
	this.name;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/view.js');
};