var coreScripts = [
	'vle/node/matchsequence/MatchSequenceNode.js',
	'vle/node/matchsequence/matchSequenceEvents.js'
];

var coreMinScripts = [
  	'vle/node/matchsequence/matchsequence_core_min.js'
];


var studentVLEScripts = [
	scriptloader.jquerySrc,
	scriptloader.jqueryUISrc,
	'vle/node/common/nodehelpers.js',
	'vle/jquery/js/jsonplugin.js',
	'vle/jquery/js/jquery.ui.touch-punch.min.js',
	'vle/node/matchsequence/matchsequencedragdrop.js',
	'vle/node/matchsequence/matchsequencebucket.js',
	'vle/node/matchsequence/matchsequencechoice.js',
	'vle/node/matchsequence/matchsequencestate.js',
	'vle/node/matchsequence/matchsequence.js'
];

var authorScripts = [
	'vle/node/matchsequence/authorview_matchsequence.js'
];

var gradingScripts = [
	'vle/node/matchsequence/matchsequencestate.js',
	'vle/node/common/nodehelpers.js',
	'vle/node/matchsequence/matchsequencedragdrop.js',
	'vle/node/matchsequence/matchsequencebucket.js',
	'vle/node/matchsequence/matchsequencechoice.js',
	'vle/node/matchsequence/matchsequence.js'
];

var dependencies = [
	{child:"vle/node/matchsequence/MatchSequenceNode.js", parent:["vle/node/Node.js"]},
	{child:"vle/jquery/js/jquery.ui.touch-punch.min.js", parent:[scriptloader.jqueryUISrc]}
];

var css = [
	scriptloader.jqueryUICss,
	"vle/node/common/css/htmlAssessment.css",
	"vle/node/matchsequence/matchstyles.css"
];

var nodeClasses = [
	{nodeClass:'matchsequence', nodeClassText:'Match & Sequence', icon:'node/matchsequence/icons/matchsequence28.png'}
];

var nodeIconPath = 'node/matchsequence/icons/';
componentloader.addNodeIconPath('MatchSequenceNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreMinScripts);
scriptloader.addScriptToComponent('matchsequence', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);
scriptloader.addDependencies(dependencies);
scriptloader.addCssToComponent('matchsequence', css);

componentloader.addNodeClasses('MatchSequenceNode', nodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/matchsequence/matchSequenceTemplate.ms',
		nodeExtension:'ms'
	}
];

componentloader.addNodeTemplateParams('MatchSequenceNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/matchsequence/setup.js');
};