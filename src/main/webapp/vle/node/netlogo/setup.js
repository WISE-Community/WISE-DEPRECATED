var coreScripts = [
	'vle/node/netlogo/NetlogoNode.js',
	'vle/node/netlogo/netlogoEvents.js'
];

var studentVLEScripts = [
	scriptloader.jquerySrc,
	'vle/node/netlogo/netlogostate.js',
	'vle/node/netlogo/netlogo.js'
];

var authorScripts = [
   	'vle/node/netlogo/authorview_netlogo.js'
];

var gradingScripts = [
	'vle/node/netlogo/netlogostate.js'
];

var dependencies = [
	{child:"vle/node/netlogo/NetlogoNode.js", parent:["vle/node/Node.js"]}
];

var nodeIconPath = 'node/netlogo/icons/';

var css = [
	
];

var nodeClasses = [
	{nodeClass:'simulation', nodeClassText:'Netlogo', icon:'node/netlogo/icons/simulation28.png'}
];

componentloader.addNodeIconPath('NetlogoNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);
scriptloader.addScriptToComponent('netlogo', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);
scriptloader.addDependencies(dependencies);
scriptloader.addCssToComponent('netlogo', css);

componentloader.addNodeClasses('NetlogoNode', nodeClasses);

var nodeTemplateParams = [
    {
        nodeTemplateFilePath:'node/netlogo/netlogoTemplate.nl',
        nodeExtension:'nl'
    }
];

componentloader.addNodeTemplateParams('NetlogoNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/netlogo/setup.js');
};
