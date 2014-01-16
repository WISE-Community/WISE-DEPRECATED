
/**
 * @constructor
 * @param node
 * @returns
 */
function MW(node) {
	this.node = node;
	this.content = node.getContent().getContentJSON();
	this.applet;
	this.init(node.getContent().getContentUrl());
}

MW.prototype.init = function(jsonURL){
	//display any prompts to the student
	$('#promptDiv').html(this.content.prompt);

	this.loadApplet(jsonURL, this);  // load the MW activity
};

MW.prototype.loadApplet = function(jsonfilename, context){
	var applet = '<applet id="mw_applet"' + 
		'archive="../../node/mw/mwapplet.jar"' + 
		'code="org.concord.modeler.MwApplet" width="' + this.content.width + '" height="' + this.content.height + '">' +
		'<param name="script" value="page:0:import ' + this.content.activity_uri + '"/>' +
		'<param name="permissions" value="sandbox"/>' +
		'</applet>';
	$('#mw_wrapper').html(applet);
	context.applet = document.getElementById('mw_applet');
	// set starting parameters
	context.setParams(context,this.content,20);

	//$.getJSON(jsonfilename, 
	//	function(data){
			//var activityPath = context.node.view.getConfig().getConfigParam('getContentBaseUrl') + data.activity_uri;
	//	}
	//);

	
	// var myDataService = new VleDS(vle);
 	   // or var myDataService = new DSSService(read,write);
	 //context.setDataService(myDataService);
	 //context.load();   // load data, if any, or load defaults
};

// Set applet starting parameters
// waits until applet is active to send starting parameters
MW.prototype.setParams = function(context,data,count){
    if (!context.applet.isActive() && count > 0) {
       setTimeout( function() { context.setParams( context,data,--count ); }, 2000 );
    }
    else if (context.applet.isActive()) {
    	if (parent.document.getElementById("ifrm") != null) {
    		$('#mw_applet').attr('height',parent.document.getElementById("ifrm").offsetHeight-20); // set applet height to fit in iframe
	    	$('#mw_applet').attr('width',parent.document.getElementById("ifrm").offsetWidth-40);
    	}
    	
		// set starting temp
		if(data.params.temperature){
			context.runScript("mw2d:1:set temperature " + data.params.temperature,context);
		}
		// set autoStart
		if(data.params.auto_start){
			context.runScript("mw2d:1:run",context);
		}
    }
    else {
       alert(this.view.getI18NString("applet_failed_to_load","MWNode")); // applet did not start within 40 seconds
    }
};

// Javascript-MW applet communication
MW.prototype.runScript = function(script,context){
	return context.applet.runMwScript(script);
};


// VLE data service setup
// This happens when the page is loaded
(function() {
	  VleDS = function(_vle){
	    this.data = "";
	    this.annotations = "";
	    this.vle = _vle;
	    this.vleNode=_vle.getCurrentNode();
	  };

	  VleDS.prototype = {
	    save: function(_data) {
			this.vle.saveState(_data,this.vleNode);
	        this.data = _data;
	    },

	    load: function(context,callback) {
			this.data = this.vle.getLatestStateForCurrentNode();
			callback(this.data,context);
	    },
	    
	    loadAnnotations: function(context,callback) {
	    	//this.annotations = this.vle.get
	    },
		
	    toString: function() {
	      return "VLE Data Service (" + this.vle + ")";
	    }
		
	};

})();


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mw/mw.js');
};