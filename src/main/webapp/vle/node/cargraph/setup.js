var coreScripts = [
	'vle/node/cargraph/CarGraphNode.js',
	'vle/node/cargraph/cargraphEvents.js'
];

var coreMinScripts = [
	'vle/node/cargraph/cargraph_core_min.js'
];

var studentVLEScripts = [
	//scriptloader.jquerySrc,
	//scriptloader.jqueryUISrc,
	//'vle/jquery/js/jquery-ui-1.8.17.custom.min.js',
	'vle/node/cargraph/cargraph.js',
	'vle/node/cargraph/cargraphstate.js',	
	'vle/jquery/js/flot/excanvas.js',
	'vle/jquery/js/flot/jquery.js',
	'vle/jquery/js/flot/jquery.flot.js',
	'vle/jquery/js/flot/jquery.flot.crosshair.js'	
];

var css = [
	'vle/jquery/css/custom-theme/jquery-ui-1.8.7.custom.css'
];

var authorScripts = [
	'vle/node/cargraph/authorview_cargraph.js'
];

var gradingScripts = [
	'vle/node/cargraph/cargraphstate.js',
	'vle/node/cargraph/cargraph.js',
	'vle/jquery/js/flot/jquery.flot.js'		
];

var dependencies = [
	{child:"vle/node/cargraph/CarGraphNode.js", parent:["vle/node/Node.js"]},
	{child:"vle/node/cargraph/cargraph.js", parent:["vle/node/cargraph/cargraphstate.js"]},
	{child:"vle/jquery/js/flot/jquery.flot.js", parent:["vle/jquery/js/flot/jquery.js"]},
	{child:"vle/jquery/js/flot/jquery.flot.crosshair.js", parent:["vle/jquery/js/flot/jquery.flot.js"]}	
];

var nodeClasses = [
	{nodeClass:'simulation', nodeClassText:'CarGraph', icon:'node/cargraph/icons/simulation28.png'}
];

var nodeIconPath = 'node/cargraph/icons/';
componentloader.addNodeIconPath('CarGraphNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreMinScripts);
scriptloader.addScriptToComponent('cargraph', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);
scriptloader.addDependencies(dependencies);

componentloader.addNodeClasses('CarGraphNode', nodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/cargraph/cargraphTemplate.cg',
		
		nodeExtension:'cg'
	}
];

componentloader.addNodeTemplateParams('CarGraphNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/cargraph/setup.js');
};