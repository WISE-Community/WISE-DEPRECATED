CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### ideabasket_core_min #####
# usage: make ideabasket_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	IdeaBasketNode.js \
	ideaBasketEvents.js 
	        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=ideabasket_core_min.js


ideabasket_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/ideabasket/ideabasket_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          


