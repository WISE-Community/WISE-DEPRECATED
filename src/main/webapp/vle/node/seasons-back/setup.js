var coreScripts = [
    /*
     * TODO: rename seasons
     * TODO: rename SeasonsNode.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/seasons/SeasonsNode.js',
	/*
     * TODO: rename seasons
     * TODO: rename seasonsEvents.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
	 */
	'vle/node/seasons/seasonsEvents.js'
];

var studentVLEScripts = [
 	/*
     * TODO: rename seasons
     * TODO: rename seasons.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
	 */
	'vle/node/seasons/seasons.js',
	/*
     * TODO: rename seasons
     * TODO: rename seasonsstate.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizstate.js'
	 */
	'vle/node/seasons/seasonsstate.js',
	'vle/jquery/js/jquery-1.6.1.min.js',
	'vle/jquery/js/jquery-ui-1.8.7.custom.min.js'
];

var authorScripts = [
	/*
	 * TODO: rename seasons
	 * TODO: rename authorview_seasons.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/authorview_quiz.js'
	 */
	'vle/node/seasons/authorview_seasons.js'
];

var gradingScripts = [
  	/*
	 * TODO: rename seasons
	 * TODO: rename seasonsstate.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/quizstate.js'
	 */
	'vle/node/seasons/seasonsstate.js'
];

var dependencies = [
  	/*
	 * TODO: rename seasons
	 * TODO: rename SeasonsNode.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/QuizNode.js'
	 */
	{child:"vle/node/seasons/SeasonsNode.js", parent:["vle/node/Node.js"]}
];

/*
 * TODO: rename Seasons
 * 
 * For example if you are creating a quiz node you would change it to
 * 'Quiz'
 */
var nodeClasses = [
	{nodeClass:'display', nodeClassText:'Seasons'}
];

scriptloader.addScriptToComponent('core', coreScripts);

/*
 * TODO: rename seasons
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('seasons', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addDependencies(dependencies);

/*
 * TODO: rename SeasonsNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeClasses('SeasonsNode', nodeClasses);

var nodeTemplateParams = [
	{
		/*
		 * TODO: rename the file path value
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'node/quiz/quizTemplate.qz'
		 */
		nodeTemplateFilePath:'node/seasons/seasonsTemplate.ss',
		
		/*
		 * TODO: rename the extension value for your step type, the value of the
		 * extension is up to you, we just use it to easily differentiate between
		 * different step type files
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'qz'
		 */
		nodeExtension:'ss'
	}
];

/*
 * TODO: rename SeasonsNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeTemplateParams('SeasonsNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename seasons to your new folder name
	 * 
	 * For example if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/setup.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/seasons/setup.js');
};