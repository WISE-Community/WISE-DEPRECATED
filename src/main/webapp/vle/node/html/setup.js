var coreScripts = [
	'vle/node/html/HtmlNode.js',
	'vle/node/html/htmlEvents.js'
];

var coreMinScripts = [
   	'vle/node/html/html_core_min.js'
];

var studentVLEScripts = [

];

var authorScripts = [
	'vle/node/html/authorview_html.js'
];

var gradingScripts = [
	'vle/node/html/htmlstate.js'
];

var dependencies = [
	{child:"vle/node/html/HtmlNode.js", parent:["vle/node/Node.js"]}
];

var nodeClasses = [
	{nodeClass:'intro', nodeClassText:'Introductory Page', icon:'node/html/icons/intro28.png'},
	{nodeClass:'curriculum', nodeClassText:'Curriculum Page', icon:'node/html/icons/curriculum28.png'},
	{nodeClass:'display', nodeClassText:'Display Page', icon:'node/html/icons/display28.png'},
	{nodeClass:'cartoon', nodeClassText:'Cartoon Page', icon:'node/html/icons/cartoon28.png'},
	{nodeClass:'codeit', nodeClassText:'Coding Page', icon:'node/html/icons/codeit28.png'},
	{nodeClass:'simulation', nodeClassText:'Simulation Page', icon:'node/html/icons/simulation28.png'},
	{nodeClass:'movie', nodeClassText:'Movie Page', icon:'node/html/icons/movie28.png'},
	{nodeClass:'homework', nodeClassText:'Homework Page', icon:'node/html/icons/homework28.png'},
	{nodeClass:'summary', nodeClassText:'Summary Page', icon:'node/html/icons/summary28.png'}
];

var nodeIconPath = 'node/html/icons/';
componentloader.addNodeIconPath('HtmlNode', nodeIconPath);

var css = [
	//'vle/node/html/html.css'
];

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreMinScripts);
scriptloader.addScriptToComponent('html', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);
scriptloader.addDependencies(dependencies);
scriptloader.addCssToComponent('html', css);

componentloader.addNodeClasses('HtmlNode', nodeClasses);

var nodeTemplateParams = [
   {
	   nodeTemplateFilePath:'node/html/htmlTemplate.ht',
	   nodeExtension:'ht',
	   mainNodeFile:true
   },
   {
	   nodeTemplateFilePath:'node/html/htmlTemplate.html',
	   nodeExtension:'html',
	   mainNodeFile:false
   }
];

componentloader.addNodeTemplateParams('HtmlNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/html/setup.js');
};