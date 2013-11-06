CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### matchsequence_core_min #####
# usage: make matchsequence_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	MatchSequenceNode.js \
	matchSequenceEvents.js
        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=matchsequence_core_min.js


matchsequence_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/matchsequence/matchsequence_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          


