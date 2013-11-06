var coreScripts = [
    /*
     * TODO: rename grapher
     * TODO: rename GrapherNode.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/grapher/GrapherNode.js',
	/*
     * TODO: rename grapher
     * TODO: rename grapherEvents.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
	 */
	'vle/node/grapher/grapherEvents.js'
];

var studentVLEScripts = [
 	/*
     * TODO: rename grapher
     * TODO: rename grapher.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
	 */
	'vle/node/grapher/grapher.js',
	/*
     * TODO: rename grapher
     * TODO: rename grapherState.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/grapher/grapherState.js',
	'vle/jquery/js/flot/excanvas.js',
	'vle/jquery/js/flot/jquery.js',
	'vle/jquery/js/flot/jquery.flot.js'
];

var authorScripts = [
	/*
	 * TODO: rename grapher
	 * TODO: rename authorview_grapher.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/authorview_quiz.js'
	 */
	'vle/node/grapher/authorview_grapher.js'
];

var gradingScripts = [
  	/*
	 * TODO: rename grapher
	 * TODO: rename grapherState.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/grapher/grapherState.js',
	'vle/node/grapher/grapher.js',
	'vle/jquery/js/flot/jquery.flot.js'
];

var dependencies = [
  	/*
	 * TODO: rename grapher
	 * TODO: rename GrapherNode.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/QuizNode.js'
	 */
	{child:"vle/node/grapher/GrapherNode.js", parent:["vle/node/Node.js"]},
	{child:"vle/jquery/js/flot/jquery.flot.js", parent:["vle/jquery/js/flot/jquery.js"]}
];

/*
 * TODO: rename grapher
 * For example if you are creating a quiz node and you want to use custom icons,
 * you would change it to 'quiz' and replace the 'grapher16.png' and 'grapher28.png'
 * files in the node's 'icons' directory with 'quiz16.png' and 'quiz28.png' 
 * (the icons should be png files with 16x16 and 28x28 pixels respectively)
 * 
 * TODO: rename Grapher
 * For example if you are creating a quiz node you would change it to
 * 'Quiz'
 * 
 * If you want to provide authors with multiple icon options for this node type,
 * add another entry to the nodeClasses array and add the corresponding icons
 * (using that nodeClass in the filenames) to the 'icons' directory
 */
var nodeClasses = [
	{nodeClass:'grapher', nodeClassText:'Grapher', icon:'node/grapher/icons/grapher28.png'}
];

/*
 * TODO: rename grapher
 * TODO: rename GrapherNode
 */
var nodeIconPath = 'node/grapher/icons/';
componentloader.addNodeIconPath('GrapherNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);

/*
 * TODO: rename grapher
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('grapher', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);

scriptloader.addDependencies(dependencies);

/*
 * TODO: rename GrapherNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeClasses('GrapherNode', nodeClasses);

/*
 * TODO: rename the file path value
 * 
 * For example if you are creating a quiz node you would change it to
 * 'vle/node/quiz/quiz.css'
 */
var css = [
];

/*
 * TODO: rename grapher
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addCssToComponent('grapher', css);

var topMenuScripts = [
	'vle/node/grapher/grapher.js',
	'vle/node/grapher/grapherState.js',
	'vle/jquery/js/flot/jquery.flot.js'
];

scriptloader.addScriptToComponent('topMenu', topMenuScripts);

var nodeTemplateParams = [
	{
		/*
		 * TODO: rename the file path value
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'node/quiz/quizGrapher.qz'
		 */
		nodeTemplateFilePath:'node/grapher/grapherTemplate.grph',
		
		/*
		 * TODO: rename the extension value for your step type, the value of the
		 * extension is up to you, we just use it to easily differentiate between
		 * different step type files
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'qz'
		 */
		nodeExtension:'grph'
	}
];

/*
 * TODO: rename GrapherNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeTemplateParams('GrapherNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/grapher/setup.js');
};