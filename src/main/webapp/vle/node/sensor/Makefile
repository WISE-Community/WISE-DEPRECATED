CLOSURE=../../../WEB-INF/lib/closure-compiler.jar

##### sensor_core_min #####
# usage: make sensor_core_min

# All core files that will be compiled by the Closure compiler.                                                                                                                                                                                 
JS_FILES=\
	SensorNode.js \
	sensorEvents.js 
	        
CLOSURE_JS_ARGS=$(addprefix --js , $(JS_FILES))
COMPILED_JS=sensor_core_min.js


sensor_core_min:
	rm -rf $(COMPILED_JS)
	java -jar $(CLOSURE) \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		$(CLOSURE_JS_ARGS) \
		--js_output_file $(COMPILED_JS)
	echo "if(typeof eventManager != 'undefined'){eventManager.fire('scriptLoaded', 'vle/node/sensor/sensor_core_min.js');}" >> $(COMPILED_JS)	                                                                                                                                          

