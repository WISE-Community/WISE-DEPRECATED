CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### table_core_min #####
# usage: make table_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	TableNode.js \
	tableEvents.js 
	        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=table_core_min.js


table_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/table/table_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          


##### table_grading_min #####
# usage: make table_grading_min

# All grading files that will be compiled by the Closure compiler.                                                                                                                                                                                 
GRADING_JS_FILES=\
	tablestate.js \
	table.js 
	        
GRADING_CLOSURE_JS_ARGS=$(addprefix --js , $(GRADING_JS_FILES))
GRADING_COMPILED_JS=table_grading_min.js


table_grading_min:
	rm -rf $(GRADING_COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(GRADING_CLOSURE_JS_ARGS) \
		--js_output_file $(GRADING_COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/table/table_grading_min.js');}" >> $(GRADING_COMPILED_JS)	                                                                                                                                          


