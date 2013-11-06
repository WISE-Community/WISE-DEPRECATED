CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### fillin_core_min #####
# usage: make fillin_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	FillinNode.js \
	fillinEvents.js
        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=fillin_core_min.js


fillin_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/fillin/fillin_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          


