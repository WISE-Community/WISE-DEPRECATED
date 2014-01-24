var coreScripts = [
    /*
     * TODO: rename webApp
     * TODO: rename WebAppNode.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/webApp/WebAppNode.js',
	/*
     * TODO: rename webApp
     * TODO: rename webAppEvents.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
	 */
	'vle/node/webApp/webAppEvents.js'
];

var studentVLEScripts = [
    //NOTE:  NOT SURE WHY I DISABLED THESE IN TEST STEP.
	scriptloader.jquerySrc,
	scriptloader.jqueryUISrc,
 	/*
     * TODO: rename webApp
     * TODO: rename webApp.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
	 */
	'vle/node/webApp/webApp.js',
	/*
     * TODO: rename webApp
     * TODO: rename webAppState.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/webApp/webAppState.js'
];

var authorScripts = [
	/*
	 * TODO: rename webApp
	 * TODO: rename authorview_webApp.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/authorview_quiz.js'
	 */
	'vle/node/webApp/authorview_webApp.js'
];

var gradingScripts = [
  	/*
	 * TODO: rename webApp
	 * TODO: rename webAppState.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/webApp/webAppState.js'
];

var dependencies = [
  	/*
	 * TODO: rename webApp
	 * TODO: rename WebAppNode.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/QuizNode.js'
	 */
	{child:"vle/node/webApp/WebAppNode.js", parent:["vle/node/Node.js"]}
];

/*
 * TODO: rename webApp
 * For example if you are creating a quiz node and you want to use custom icons,
 * you would change it to 'quiz' and replace the 'webApp16.png' and 'webApp28.png'
 * files in the node's 'icons' directory with 'quiz16.png' and 'quiz28.png' 
 * (the icons should be png files with 16x16 and 28x28 pixels respectively)
 * 
 * TODO: rename WebApp
 * For example if you are creating a quiz node you would change it to
 * 'Quiz'
 * 
 * If you want to provide authors with multiple icon options for this node type,
 * add another entry to the nodeClasses array and add the corresponding icons
 * (using that nodeClass in the filenames) to the 'icons' directory
 */
var nodeClasses = [
	{nodeClass:'webApp', nodeClassText:'WebApp'}
];

/*
 * TODO: rename webApp
 * TODO: rename WebAppNode
 */
var nodeIconPath = 'node/webApp/icons/';
componentloader.addNodeIconPath('WebAppNode', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);

/*
 * TODO: rename webApp
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('webApp', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);

scriptloader.addDependencies(dependencies);

/*
 * TODO: rename WebAppNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeClasses('WebAppNode', nodeClasses);

/*
 * TODO: rename the file path value
 * 
 * For example if you are creating a quiz node you would change it to
 * 'vle/node/quiz/quiz.css'
 */
var css = [
       	"vle/node/webApp/webApp.css"
];

/*
 * TODO: rename webApp
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addCssToComponent('webApp', css);

var nodeTemplateParams = [
	{
		/*
		 * TODO: rename the file path value
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'node/quiz/quizWebApp.qz'
		 */
		nodeTemplateFilePath:'node/webApp/webAppTemplate.wa',
		
		/*
		 * TODO: rename the extension value for your step type, the value of the
		 * extension is up to you, we just use it to easily differentiate between
		 * different step type files
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'qz'
		 */
		nodeExtension:'wa'
	}
];

/*
 * TODO: rename WebAppNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeTemplateParams('WebAppNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename webApp to your new folder name
	 * 
	 * For example if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/setup.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/webApp/setup.js');
};