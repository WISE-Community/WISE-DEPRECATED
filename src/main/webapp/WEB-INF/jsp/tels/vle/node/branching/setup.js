var coreScripts = [
    /*
     * TODO: rename branching
     * TODO: rename BranchingNode.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/branching/BranchingNode.js',
	/*
     * TODO: rename branching
     * TODO: rename branchingEvents.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
	 */
	'vle/node/branching/branchingEvents.js'
];

var studentVLEScripts = [
    scriptloader.jquerySrc,
    scriptloader.jqueryUISrc,
 	/*
     * TODO: rename branching
     * TODO: rename branching.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
	 */
	'vle/node/branching/branching.js',
	/*
     * TODO: rename branching
     * TODO: rename branchingState.js
     * 
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/branching/branchingState.js'
];

var authorScripts = [
	/*
	 * TODO: rename branching
	 * TODO: rename authorview_branching.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/authorview_quiz.js'
	 */
	'vle/node/branching/authorview_branching.js'
];

var gradingScripts = [
  	/*
	 * TODO: rename branching
	 * TODO: rename branchingState.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/quizState.js'
	 */
	'vle/node/branching/branchingState.js'
];

var dependencies = [
  	/*
	 * TODO: rename branching
	 * TODO: rename BranchingNode.js
	 * 
	 * For example if you are creating a quiz node you would change it to
	 * 'vle/node/quiz/QuizNode.js'
	 */
	{child:"vle/node/branching/BranchingNode.js", parent:["vle/node/Node.js"]}
];

/*
 * TODO: rename Branching
 * 
 * For example if you are creating a quiz node you would change it to
 * 'Quiz'
 */
var nodeClasses = [
	{nodeClass:'display', nodeClassText:'Branching', icon:'node/html/icons/display28.png'}
];

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);

/*
 * TODO: rename branching
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('branching', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);

scriptloader.addDependencies(dependencies);

/*
 * TODO: rename BranchingNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeClasses('BranchingNode', nodeClasses);

/*
 * TODO: rename the file path value
 * 
 * For example if you are creating a quiz node you would change it to
 * 'vle/node/quiz/quiz.css'
 */
var css = [
       	"vle/node/branching/branching.css"
];

/*
 * TODO: rename branching
 * 
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addCssToComponent('branching', css);

var nodeTemplateParams = [
	{
		/*
		 * TODO: rename the file path value
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'node/quiz/quizBranching.qz'
		 */
		nodeTemplateFilePath:'node/branching/branchingTemplate.br',
		
		/*
		 * TODO: rename the extension value for your step type, the value of the
		 * extension is up to you, we just use it to easily differentiate between
		 * different step type files
		 * 
		 * For example if you are creating a quiz node you would change it to
		 * 'qz'
		 */
		nodeExtension:'br'
	}
];

/*
 * TODO: rename BranchingNode
 * 
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeTemplateParams('BranchingNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename branching to your new folder name
	 * 
	 * For example if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/setup.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/branching/setup.js');
};