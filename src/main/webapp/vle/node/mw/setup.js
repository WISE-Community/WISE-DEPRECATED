var coreScripts = [
	'vle/node/mw/MWNode.js',
	'vle/node/mw/mwEvents.js'
];

var studentVLEScripts = [
	scriptloader.jquerySrc,
	'vle/node/mw/mw.js'
];

var authorScripts = [
   	'vle/node/mw/authorview_mw.js'
];

var gradingScripts = [
	'vle/node/mw/mwstate.js'
];

var dependencies = [
	{child:"vle/node/mw/MWNode.js", parent:["vle/node/Node.js"]}
];

var css = [
	"vle/node/mw/mw.css"
];

var nodeClasses = [
	{nodeClass:'simulation', nodeClassText:'Molecular Workbench', icon:'node/mw/icons/simulation28.png'}
];

var nodeIconPath = 'node/mw/icons/';
componentloader.addNodeIconPath('MWNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);
scriptloader.addScriptToComponent('mw', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);
scriptloader.addDependencies(dependencies);
scriptloader.addCssToComponent('mw', css);

componentloader.addNodeClasses('MWNode', nodeClasses);

var nodeTemplateParams = [
    {
        nodeTemplateFilePath:'node/mw/mwTemplate.mw',
        nodeExtension:'mw'
    }
];

componentloader.addNodeTemplateParams('MWNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mw/setup.js');
};