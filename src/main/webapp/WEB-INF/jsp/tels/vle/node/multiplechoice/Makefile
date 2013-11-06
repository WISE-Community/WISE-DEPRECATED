CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### multiplechoice_core_min #####
# usage: make multiplechoice_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	MultipleChoiceNode.js \
	ChallengeNode.js \
	multipleChoiceEvents.js
        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=multiplechoice_core_min.js


multiplechoice_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/multiplechoice_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          


##### multiplechoice_grading_min #####
# usage: make multiplechoice_grading_min

# All grading files that will be compiled by the Closure compiler.                                                                                                                                                                                 
GRADING_JS_FILES=\
	multiplechoicestate.js \
	challengestate.js \
	branchstate.js
        
GRADING_CLOSURE_JS_ARGS=$(addprefix --js , $(GRADING_JS_FILES))
GRADING_COMPILED_JS=multiplechoice_grading_min.js


multiplechoice_grading_min:
	rm -rf $(GRADING_COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(GRADING_CLOSURE_JS_ARGS) \
		--js_output_file $(GRADING_COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/multiplechoice/multiplechoice_grading_min.js');}" >> $(GRADING_COMPILED_JS)	                                                                                                                                          


