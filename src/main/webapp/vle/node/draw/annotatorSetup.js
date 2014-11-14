var coreScripts = [
	'vle/node/draw/SVGDrawNode.js',
	'vle/node/draw/AnnotatorNode.js',
	'vle/node/draw/annotatorEvents.js'
];

var studentVLEScripts = [
	'vle/node/draw/svg-edit/annotator.js',
	'vle/node/draw/svg-edit/annotatorstate.js'
];

var authorScripts = [
	'vle/lib/bootstrap/bootstrap.min.js', // TODO: when bootstrap is standard
	'vle/node/draw/authorview_annotator.js',
	//'vle/node/draw/svg-edit/lz77.js',
	'vle/node/draw/svg-edit/autograde/annotatorAutoScore.js'
];

var gradingScripts = [
	//'vle/node/draw/svg-edit/lz77.js',
	'vle/node/draw/svg-edit/utils.js',
	'vle/node/draw/svg-edit/annotatorstate.js'
];

var dependencies = [
	{child:"vle/node/draw/SVGDrawNode.js", parent:["vle/node/Node.js"]},
	{child:"vle/node/draw/AnnotatorNode.js", parent:["vle/node/draw/SVGDrawNode.js"]},
	{child:'vle/lib/bootstrap/bootstrap.min.js',parent:[scriptloader.jQuerySrc]} // TODO: when bootstrap is standard
];

var css = [
	scriptloader.jqueryUICss,
];

var nodeClasses = [
	{nodeClass:'quickdraw', nodeClassText:'Annotator', icon:'node/draw/icons/quickdraw28.png'} // TODO: get new icon
];

var nodeIconPath = 'node/draw/icons/';
componentloader.addNodeIconPath('AnnotatorNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('annotator', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addDependencies(dependencies);
scriptloader.addCssToComponent('annotator', css);

componentloader.addNodeClasses('AnnotatorNode', nodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/draw/annotatorTemplate.an',
		nodeExtension:'an'
	}
];

componentloader.addNodeTemplateParams('AnnotatorNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/draw/annotatorSetup.js');
}
