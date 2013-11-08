/**
 * The environment object is the most basic environment in which a view
 * is created. A view is a collection of components specific to that view.
 * A component is a collection of functions, variables, events and styling
 * grouped according to some common purpose.
 * 
 * @author patrick lawler
 */
function createEnvironment(name, em){
	
	window[name] = function(em, sl, cl, name){
		var viewStarted = false;
		var componentloader = cl;
		var eventManager = em;
		var scriptloader = sl;
		view = new View();
		view.eventManager = em;
		view.scriptloader = sl;
		var name = name;
		view.$ = window.$;
		
		//listener for loading View complet to set boolean viewStarted to true
		var viewLoaded = function(type, args, obj){
			viewStarted = true;
		};
		
		eventManager.subscribe('loadingViewComplete', viewLoaded);
		
		/*
		 * Starts the view of the specified type
		 */
		var startView = function(type, compress){
			if(!type){
				alert('No view type specified, cannot start view');
			} else if(viewStarted){
				alert('View with name ' + view.name + ' already started. Cannot start view.');
			} else {
				view.name = type;
				componentloader.loadView(window[name], view, document, compress);
			};
		};
		
		return {
			startView:function(type, compress){
				startView(type, compress);
			},
			generateMethod:function(methodName, fun){
				this[methodName] = fun(view);
			}
		};
	}(em, scriptloader, componentloader, name);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/environment/environment.js');
};