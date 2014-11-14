var coreScripts = [
	'vle/node/draw/SVGDrawNode.js',
	'vle/node/draw/svgDrawEvents.js'
];

var studentVLEScripts = [
	'vle/node/draw/svg-edit/svgdraw.js',
	'vle/node/draw/svg-edit/svgdrawstate.js'
];

var authorScripts = [
	'vle/node/draw/authorview_svgdraw.js',
	'vle/node/draw/svg-edit/lz77.js',
	'vle/node/draw/svg-edit/autograde/drawScorer.js'
];

var gradingScripts = [
	'vle/node/draw/svg-edit/lz77.js',
	'vle/node/draw/svg-edit/utils.js',
	'vle/node/draw/svg-edit/svgdrawstate.js'
];

var dependencies = [
	{child:"vle/node/draw/SVGDrawNode.js", parent:["vle/node/Node.js"]}
];

var css = [
	scriptloader.jqueryUICss,
];

var nodeClasses = [
	{nodeClass:'quickdraw', nodeClassText:'Drawing', icon:'node/draw/icons/quickdraw28.png'}
];

var nodeIconPath = 'node/draw/icons/';
componentloader.addNodeIconPath('SVGDrawNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('svgdraw', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addDependencies(dependencies);
scriptloader.addCssToComponent('svgdraw', css);

componentloader.addNodeClasses('SVGDrawNode', nodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/draw/svgDrawTemplate.sd',
		nodeExtension:'sd'
	}
];

componentloader.addNodeTemplateParams('SVGDrawNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/setup.js');
}
