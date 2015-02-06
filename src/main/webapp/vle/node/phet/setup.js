var coreScripts = [
	'vle/node/phet/PhETNode.js',
	'vle/node/phet/phetEvents.js'
];

var studentVLEScripts = [

];

var authorScripts = [
	'vle/node/phet/authorview_phet.js'
];

var gradingScripts = [
	
];

var dependencies = [
	{child:"vle/node/phet/PhETNode.js", parent:["vle/node/Node.js"]}
];

var nodeClasses = [
	{nodeClass:'phet', nodeClassText:'PhET Simulation', icon:'node/phet/icons/simulation28.png'}
];

var nodeIconPath = 'node/phet/icons/';
componentloader.addNodeIconPath('PhETNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('phet', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);

scriptloader.addDependencies(dependencies);

componentloader.addNodeClasses('PhETNode', nodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/phet/phetTemplate.ph',
		nodeExtension:'ph'
	}
];

componentloader.addNodeTemplateParams('PhETNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/phet/setup.js');
};