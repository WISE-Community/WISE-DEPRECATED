CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### svgdraw_core_min #####
# usage: make svgdraw_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	SVGDrawNode.js \
	svgDrawEvents.js 
	        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=svgdraw_core_min.js


svgdraw_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/draw/svgdraw_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          


##### svgdraw_grading_min #####
# usage: make svgdraw_grading_min

# All grading files that will be compiled by the Closure compiler.                                                                                                                                                                                 
GRADING_JS_FILES=\
	svg-edit/lz77.js \
	svg-edit/utils.js \
	svg-edit/svgdrawstate.js
		        
GRADING_CLOSURE_JS_ARGS=$(addprefix --js , $(GRADING_JS_FILES))
GRADING_COMPILED_JS=svgdraw_grading_min.js


svgdraw_grading_min:
	rm -rf $(GRADING_COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(GRADING_CLOSURE_JS_ARGS) \
		--js_output_file $(GRADING_COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/draw/svgdraw_grading_min.js');}" >> $(GRADING_COMPILED_JS)	                                                                                                                                          


