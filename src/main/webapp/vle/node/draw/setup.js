var coreScripts = [
	'vle/node/draw/SVGDrawNode.js',
	'vle/node/draw/svgDrawEvents.js'
];

var coreMinScripts = [
   	'vle/node/draw/svgdraw_core_min.js'
];

var studentVLEScripts = [
    /*'vle/node/draw/svg-edit/jquery.js',
    'vle/node/draw/svg-edit/jquery-ui/jquery-ui-1.8.17.custom.min.js',
    'vle/jquery/js/jsonplugin.js',
	'vle/node/draw/svg-edit/js-hotkeys/jquery.hotkeys.min.js',
	'vle/node/draw/svg-edit/jquerybbq/jquery.bbq.min.js',
	'vle/node/draw/svg-edit/svgicons/jquery.svgicons.js',
	'vle/node/draw/svg-edit/jgraduate/jquery.jgraduate.min.js',
	'vle/node/draw/svg-edit/jgraduate/jpicker.min.js',
	'vle/node/draw/svg-edit/spinbtn/JQuerySpinBtn.min.js',
	'vle/node/draw/svg-edit/touch.js',
	'vle/node/draw/svg-edit/svgedit.compiled.js',
	'vle/node/draw/svg-edit/lz77.js',
	'vle/node/draw/svg-edit/utils.js',
	'vle/node/draw/svg-edit/jquery.timers-1.2.js',*/
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

var gradingMinScripts = [
    'vle/node/draw/svgdraw_grading_min.js'
];

var dependencies = [
	{child:"vle/node/draw/SVGDrawNode.js", parent:["vle/node/Node.js"]}
	/*{child:"vle/jquery/js/jsonplugin.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/js-hotkeys/jquery.hotkeys.min.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/jquerybbq/jquery.bbq.min.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/svgicons/jquery.svgicons.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/jgraduate/jquery.jgraduate.min.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/jgraduate/jpicker.min.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/spinbtn/JQuerySpinBtn.min.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/jquery.timers-1.2.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/touch.js", parent:['vle/node/draw/svg-edit/jquery.js']},
	{child:"vle/node/draw/svg-edit/svgedit.compiled.js", parent:[
		'vle/node/draw/svg-edit/jquery.js',
		'vle/node/draw/svg-edit/jquery-ui/jquery-ui-1.8.17.custom.min.js',
		'vle/node/draw/svg-edit/touch.js',
		'vle/node/draw/svg-edit/spinbtn/JQuerySpinBtn.min.js',
		'vle/node/draw/svg-edit/jgraduate/jpicker.min.js',
		'vle/node/draw/svg-edit/jgraduate/jquery.jgraduate.min.js',
		'vle/node/draw/svg-edit/svgicons/jquery.svgicons.js',
		'vle/node/draw/svg-edit/jquerybbq/jquery.bbq.min.js',
		'vle/node/draw/svg-edit/js-hotkeys/jquery.hotkeys.min.js'
    ]},
	{child:'vle/node/draw/svg-edit/svgdraw.js', parent:['vle/node/draw/svg-edit/svgedit.compiled.js']},
	{child:'vle/node/draw/svg-edit/jquery-ui/jquery-ui-1.8.17.custom.min.js', parent:['vle/node/draw/svg-edit/jquery.js']}*/
	
];

var css = [
	scriptloader.jqueryUICss,
	/*'vle/node/draw/svg-edit/jgraduate/css/jPicker.css',
	'vle/node/draw/svg-edit/jgraduate/css/jgraduate.css',
	'vle/node/draw/svg-edit/svg-editor.css',
	'vle/node/draw/svg-edit/spinbtn/JQuerySpinBtn.css'*/
];

var nodeClasses = [
	{nodeClass:'quickdraw', nodeClassText:'Drawing', icon:'node/draw/icons/quickdraw28.png'}
];

var nodeIconPath = 'node/draw/icons/';
componentloader.addNodeIconPath('SVGDrawNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreMinScripts);
scriptloader.addScriptToComponent('svgdraw', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingMinScripts);
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
