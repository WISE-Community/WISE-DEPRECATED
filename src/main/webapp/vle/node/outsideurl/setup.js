var coreScripts = [
	'vle/node/outsideurl/OutsideUrlNode.js',
	'vle/node/outsideurl/outsideUrlEvents.js'
];

var coreMinScripts = ['vle/node/outsideurl/outsideurl_core_min.js'];

var studentVLEScripts = [

];

var authorScripts = [
	'vle/node/outsideurl/authorview_outsideurl.js'
];

var gradingScripts = [
	
];

var dependencies = [
	{child:"vle/node/outsideurl/OutsideUrlNode.js", parent:["vle/node/Node.js"]}
];

var nodeClasses = [
	{nodeClass:'www', nodeClassText:'WWW Page', icon:'node/outsideurl/icons/www28.png'}
];

var nodeIconPath = 'node/outsideurl/icons/';
componentloader.addNodeIconPath('OutsideUrlNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreMinScripts);
scriptloader.addScriptToComponent('outsideurl', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);

scriptloader.addDependencies(dependencies);

componentloader.addNodeClasses('OutsideUrlNode', nodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/outsideurl/outsideUrlTemplate.ou',
		nodeExtension:'ou'
	}
];

componentloader.addNodeTemplateParams('OutsideUrlNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/outsideurl/setup.js');
};