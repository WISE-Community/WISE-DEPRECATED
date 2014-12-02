var coreScripts = [
	'vle/node/matchsequence/MatchSequenceNode.js',
	'vle/node/matchsequence/matchSequenceEvents.js'
];

var studentVLEScripts = [
	scriptloader.jquerySrc,
	scriptloader.jqueryUISrc_interactions,
	scriptloader.bootstrapSrc,
	'vle/lib/bootstrap/bootstrap-dialog/dist/js/bootstrap-dialog.min.js',
	'vle/lib/jquery/slick/slick.min.js',
	'vle/node/common/nodehelpers.js',
	'vle/lib/jquery/js/jsonplugin.js',
	'vle/lib/jquery/js/jquery.ui.touch-punch.min.js',
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
	{child:"vle/lib/jquery/js/jquery.ui.touch-punch.min.js", parent:[scriptloader.jqueryUISrc_interactions]},
	{child:scriptloader.bootstrapSrc, parent:[scriptloader.jquerySrc]},
	{child:'vle/lib/bootstrap/bootstrap-dialog/dist/js/bootstrap-dialog.min.js', parent:[scriptloader.bootstrapSrc]},
	{child:'vle/lib/jquery/slick/slick.min.js', parent:[scriptloader.jquerySrc]}
];

var css = [
	//scriptloader.bootstrapCss,
	//scriptloader.globalCss,
	//"vle/node/matchsequence/match-styles.css",
	//"vle/node/matchsequence/matchstyles.css"
];

var nodeClasses = [
	{nodeClass:'matchsequence', nodeClassText:'Match & Sequence', icon:'node/matchsequence/icons/matchsequence28.png'}
];

var nodeIconPath = 'node/matchsequence/icons/';
componentloader.addNodeIconPath('MatchSequenceNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('matchsequence', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
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