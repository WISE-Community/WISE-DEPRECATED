CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### surge_core_min #####
# usage: make surge_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	SurgeNode.js \
	surgeEvents.js 
	        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=surge_core_min.js


surge_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/surge/surge_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          


