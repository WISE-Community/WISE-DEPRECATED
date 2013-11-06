var coreScripts = [
	'vle/node/multiplechoice/MultipleChoiceNode.js',
	'vle/node/multiplechoice/ChallengeNode.js',
	'vle/node/multiplechoice/multipleChoiceEvents.js'
];

var coreMinScripts = [
   	'vle/node/multiplechoice/multiplechoice_core_min.js'
];

var studentVLEScripts = [
	scriptloader.jquerySrc,
	scriptloader.jqueryUISrc,
	'vle/node/common/nodehelpers.js',
	'vle/common/helperfunctions.js',
	'vle/jquery/js/jsonplugin.js',
	'vle/node/multiplechoice/multiplechoicestate.js',
	'vle/node/multiplechoice/challengestate.js',
	'vle/node/multiplechoice/branchstate.js',
	'vle/node/multiplechoice/mc.js'
];

var authorScripts = [
	'vle/node/multiplechoice/authorview_multiplechoice.js'
];

var gradingScripts = [
	'vle/node/multiplechoice/multiplechoicestate.js',
	'vle/node/multiplechoice/challengestate.js',
    'vle/node/multiplechoice/branchstate.js',
    'vle/node/common/nodehelpers.js',
    'vle/node/multiplechoice/mc.js'
];

var gradingMinScripts = [
	'vle/node/multiplechoice/multiplechoice_grading_min.js'
];

var dependencies = [
	{child:"vle/node/multiplechoice/MultipleChoiceNode.js", parent:["vle/node/Node.js"]},
	{child:'vle/node/multiplechoice/ChallengeNode.js', parent:['vle/node/Node.js','vle/node/multiplechoice/MultipleChoiceNode.js']}
];

var css = [
	scriptloader.jqueryUICss,
	"vle/node/common/css/htmlAssessment.css",
	"vle/node/multiplechoice/mcstyles.css"
];

var multipleChoiceNodeClasses = [
	{nodeClass:'multiplechoice', nodeClassText:'Multiple Choice', icon:'node/multiplechoice/icons/multiplechoice28.png'}
];

var challengeNodeClasses = [
	{nodeClass:'challengequestion', nodeClassText:'Challenge Question', icon:'node/multiplechoice/icons/challengequestion28.png'}
];

var nodeIconPath = 'node/multiplechoice/icons/';
componentloader.addNodeIconPath('MultipleChoiceNode', nodeIconPath);
componentloader.addNodeIconPath('ChallengeNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreMinScripts);
scriptloader.addScriptToComponent('multiplechoice', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingMinScripts);
scriptloader.addDependencies(dependencies);
scriptloader.addCssToComponent('multiplechoice', css);

scriptloader.addCssToComponent('author', 'vle/css/authoring/author_multiplechoice.css');

componentloader.addNodeClasses('MultipleChoiceNode', multipleChoiceNodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/multiplechoice/multipleChoiceTemplate.mc',
		nodeExtension:'mc'
	}
];

componentloader.addNodeTemplateParams('MultipleChoiceNode', nodeTemplateParams);

componentloader.addNodeClasses('ChallengeNode', challengeNodeClasses);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/multiplechoice/challengeQuestionTemplate.ch',
		nodeExtension:'ch'
	}
];

componentloader.addNodeTemplateParams('ChallengeNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/setup.js');
};