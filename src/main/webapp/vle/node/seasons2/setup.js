var coreScripts = [
    /*
     * TODO: rename seasons2
     * TODO: rename Seasons2Node.js
     *
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizNode.js'
     */
	'vle/node/seasons2/Seasons2Node.js',
	/*
     * TODO: rename seasons2
     * TODO: rename seasons2Events.js
     *
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/QuizEvents.js'
   */
	'vle/node/seasons2/seasons2Events.js'
];

var studentVLEScripts = [
  /*
     * TODO: rename seasons2
     * TODO: rename seasons2.js
     *
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quiz.js'
  */
	'vle/node/seasons2/seasons2.js',
	/*
     * TODO: rename seasons2
     * TODO: rename seasons2state.js
     *
     * For example if you are creating a quiz node you would change it to
     * 'vle/node/quiz/quizstate.js'
  */
	'vle/node/seasons2/seasons2state.js',
	'vle/jquery/js/jquery-1.6.1.min.js',
	'vle/jquery/js/jquery-ui-1.8.17.custom.min.js'
];

var authorScripts = [
	/*
   * TODO: rename seasons2
   * TODO: rename authorview_seasons2.js
   *
   * For example if you are creating a quiz node you would change it to
   * 'vle/node/quiz/authorview_quiz.js'
   */
	'vle/node/seasons2/authorview_seasons2.js'
];

var gradingScripts = [
  /*
   * TODO: rename seasons2
   * TODO: rename seasons2state.js
   *
   * For example if you are creating a quiz node you would change it to
   * 'vle/node/quiz/quizstate.js'
   */
	'vle/node/seasons2/seasons2state.js'
];

var dependencies = [
  /*
   * TODO: rename seasons2
   * TODO: rename Seasons2Node.js
   *
   * For example if you are creating a quiz node you would change it to
   * 'vle/node/quiz/QuizNode.js'
  */
	{child:"vle/node/seasons2/Seasons2Node.js", parent:["vle/node/Node.js"]}
];

/*
 * TODO: rename Seasons2
 *
 * For example if you are creating a quiz node you would change it to
 * 'Quiz'
 */
var nodeClasses = [
	{nodeClass:'seasons2', nodeClassText:'Seasons2', icon:'node/season2/icons/seasons28.png'}
];

var nodeIconPath = 'node/seasons2/icons/';
componentloader.addNodeIconPath('Seasons2Node', nodeIconPath);

scriptloader.addScriptToComponent('core', coreScripts);

/*
 * TODO: rename seasons2
 *
 * For example if you are creating a quiz node you would change it to
 * 'quiz'
 */
scriptloader.addScriptToComponent('seasons2', studentVLEScripts);

scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addDependencies(dependencies);

/*
 * TODO: rename Seasons2Node
 *
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeClasses('Seasons2Node', nodeClasses);

var nodeTemplateParams = [
	{
		/*
     * TODO: rename the file path value
     *
     * For example if you are creating a quiz node you would change it to
     * 'node/quiz/quizTemplate.qz'
     */
		nodeTemplateFilePath:'node/seasons2/seasons2Template.ss',

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
 * TODO: rename Seasons2Node
 *
 * For example if you are creating a quiz node you would change it to
 * 'QuizNode'
 */
componentloader.addNodeTemplateParams('Seasons2Node', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
   * TODO: rename seasons2 to your new folder name
   *
   * For example if you were creating a quiz step it would look like
   *
   * eventManager.fire('scriptLoaded', 'vle/node/quiz/setup.js');
   */
	eventManager.fire('scriptLoaded', 'vle/node/seasons2/setup.js');
};