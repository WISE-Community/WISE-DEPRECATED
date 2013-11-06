/*
 * the scripts that are always necessary regardless of whether the
 * user is using the vle, authoring tool, or grading tool
 */
var coreScripts = [
	'vle/node/epigame/EpigameNode.js',
	'vle/node/epigame/epigameEvents.js'
];

var coreMinScripts = ['vle/node/epigame/epigame_core_min.js'];

//the scripts used in the vle
var studentVLEScripts = [
	scriptloader.jquerySrc,
	scriptloader.jqueryUISrc,
	'vle/swfobject/swfobject.js',
	'vle/node/common/nodehelpers.js',
	'vle/node/epigame/epigame.js',
	'vle/node/epigame/epigameState.js'
];

//the scripts used in the authoring tool
var authorScripts = [
	'vle/node/epigame/authorview_epigame.js'
];

//the scripts used in the grading tool
var gradingScripts = [
	'vle/node/epigame/epigameState.js'
];

//dependencies when a file requires another file to be loaded before it
var dependencies = [
	{child:"vle/node/epigame/EpigameNode.js", parent:["vle/node/Node.js"]}
];

var nodeClasses = [
	{nodeClass:'mission-easy', nodeClassText:'Easy Mission', icon:'node/epigame/icons/planet-easy.png'},
	{nodeClass:'mission-easy-bronze', nodeClassText:'Easy Mission (Bronze)', icon:'node/epigame/icons/planet-easy-bronze.png'},
	{nodeClass:'mission-easy-silver', nodeClassText:'Easy Mission (Silver)', icon:'node/epigame/icons/planet-easy-silver.png'},
	{nodeClass:'mission-easy-gold', nodeClassText:'Easy Mission (Gold)', icon:'node/epigame/icons/planet-easy-gold.png'},
	{nodeClass:'mission-medium', nodeClassText:'Medium Mission', icon:'node/epigame/icons/planet-medium.png'},
	{nodeClass:'mission-medium-bronze', nodeClassText:'Medium Mission (Bronze)', icon:'node/epigame/icons/planet-medium-bronze.png'},
	{nodeClass:'mission-medium-silver', nodeClassText:'Medium Mission (Silver)', icon:'node/epigame/icons/planet-medium-silver.png'},
	{nodeClass:'mission-medium-gold', nodeClassText:'Medium Mission (Gold)', icon:'node/epigame/icons/planet-medium-gold.png'},
	{nodeClass:'mission-hard', nodeClassText:'Hard Mission', icon:'node/epigame/icons/planet-hard.png'},
	{nodeClass:'mission-hard-bronze', nodeClassText:'Hard Mission (Bronze)', icon:'node/epigame/icons/planet-hard-bronze.png'},
	{nodeClass:'mission-hard-silver', nodeClassText:'Hard Mission (Silver)', icon:'node/epigame/icons/planet-hard-silver.png'},
	{nodeClass:'mission-hard-gold', nodeClassText:'Hard Mission (Gold)', icon:'node/epigame/icons/planet-hard-gold.png'},
	{nodeClass:'mission-locked', nodeClassText:'Locked Mission', icon:'node/epigame/icons/planet-locked.png'},
	{nodeClass:'warp-blue', nodeClassText:'Blue Warp Mission', icon:'node/epigame/icons/warp-blue.png'},
	{nodeClass:'warp-green', nodeClassText:'Green Warp Mission', icon:'node/epigame/icons/warp-green.png'},
	{nodeClass:'warp-red', nodeClassText:'Red Warp Mission', icon:'node/epigame/icons/warp-red.png'},
	{nodeClass:'star-bronze', nodeClassText:'Bronze Star', icon:'node/epigame/icons/star-bronze.png'},
	{nodeClass:'star-silver', nodeClassText:'Silver Star', icon:'node/epigame/icons/star-silver.png'},
	{nodeClass:'star-gold', nodeClassText:'Gold Star', icon:'node/epigame/icons/star-gold.png'},
	{nodeClass:'star-locked', nodeClassText:'Locked Star', icon:'node/epigame/icons/star-locked.png'}
];

var nodeIconPath = 'node/epigame/icons/';
componentloader.addNodeIconPath('EpigameNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreMinScripts);
scriptloader.addScriptToComponent('epigame', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);
scriptloader.addDependencies(dependencies);

componentloader.addNodeClasses('EpigameNode', nodeClasses);

var css = [
	"vle/node/epigame/epigame.css"
];

scriptloader.addCssToComponent('epigame', css);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/epigame/epigameTemplate.ep',
		nodeExtension:'ep'
	}
];

componentloader.addNodeTemplateParams('EpigameNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/epigame/setup.js');
};