CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### openresponse_core_min #####
# usage: make openresponse_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	OpenResponseNode.js \
	NoteNode.js \
	openResponseEvents.js \
	openresponsestate.js \
    openresponse.js 
        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=openresponse_core_min.js


openresponse_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/openresponse/openresponse_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          


