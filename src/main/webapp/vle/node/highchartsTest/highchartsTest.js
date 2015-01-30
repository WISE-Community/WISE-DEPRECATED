/*
 * This is a highchartsTest step object that developers can use to create new
 * step types.
 * 
 * TODO: Copy this file and rename it to
 * 
 * <new step type>.js
 * e.g. for example if you are creating a quiz step it would look
 * something like quiz.js
 *
 * and then put the new file into the new folder
 * you created for your new step type
 *
 * your new folder will look something like
 * vlewrapper/WebContent/vle/node/<new step type>/
 *
 * e.g. for example if you are creating a quiz step it would look something like
 * vlewrapper/WebContent/vle/node/quiz/
 * 
 * 
 * TODO: in this file, change all occurrences of the word 'HighchartsTest' to the
 * name of your new step type
 * 
 * <new step type>
 * e.g. for example if you are creating a quiz step it would look
 * something like Quiz
 */

/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at highchartsTest.html)
 * 
 * TODO: rename HighchartsTest
 * 
 * @constructor
 */
function HighchartsTest(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 * 
 * TODO: rename HighchartsTest
 * 
 * note: you do not have to use 'promptDiv' or 'studentResponseTextArea', they
 * are just provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at highchartsTest.html).
 */
HighchartsTest.prototype.render = function() {
	//display any prompts to the student
	$('#promptDiv').html(this.content.prompt);
	
	//load any previous responses the student submitted for this step
	var latestState = this.getLatestState();
	var data = null;
	
	if(latestState != null) {
		/*
		 * get the response from the latest state. the response variable is
		 * just provided as an example. you may use whatever variables you
		 * would like from the state object (look at highchartsTestState.js)
		 */
		var latestResponse = latestState.response;
		
		//set the previous student work into the text area
		$('#studentResponseTextArea').val(latestResponse);
		
		data = latestState.data;
	}
	
	var title = this.content.title;
	
	var xLabel = this.content.xLabel;
	var yLabel = this.content.yLabel;
	
	var xUnits = this.content.xUnits;
	var yUnits = this.content.yUnits;
	
	var xMin = this.content.xMin;
	var xMax = this.content.xMax;
	var yMin = this.content.yMin;
	var yMax = this.content.yMax;
	
	/*
	 * obtain the regression type from the step content
	 * the regression types can be
	 * linear
	 * polynomial
	 * logarithmic
	 * exponential
	 * loess
	 */
	var regressionType = this.content.regressionType;
	
	if(latestState != null) {
		//obtain the regression type from the student data
		if(latestState.regressionType != null) {
			regressionType = latestState.regressionType;			
		}
		
		//obtain the xMin, xMax, yMin, yMax values from the student data
		
		if(latestState.xMin != null) {
			xMin = latestState.xMin;
		}
		
		if(latestState.xMax != null) {
			xMax = latestState.xMax;
		}
		
		if(latestState.yMin != null) {
			yMin = latestState.yMin;
		}
		
		if(latestState.yMax != null) {
			yMax = latestState.yMax;
		}
	}
	
	if(regressionType != null) {
		//set the drop down box to the correct regression type
		$('#regressionTypeChooser').val(regressionType);
	}
	
	//set the number of points to be used in the regression line
	var numberOfRegressionPoints = 100;
	
	if(data != null) {
		/*
		 * if the student data has more points than the default number
		 * we usually use for the regression line, we will set the
		 * number of regression points to double the amount in the
		 * student data
		 */
		if(data.length > numberOfRegressionPoints) {
			numberOfRegressionPoints = 2 * data.length;
		}
	}
	
	//populate the input values for xMin, xMax, yMin, yMax in the student step view
	
	if(xMin != null && !isNaN(xMin)) {
		$('#xMinInput').val(xMin);
	}
	
	if(xMax != null && !isNaN(xMax)) {
		$('#xMaxInput').val(xMax);
	}
	
	if(yMin != null && !isNaN(yMin)) {
		$('#yMinInput').val(yMin);
	}
	
	if(yMax != null && !isNaN(yMax)) {
		$('#yMaxInput').val(yMax);
	}
	
	//create a scatter plot chart object
	this.chart = {
        chart: {
            type: 'scatter',
            zoomType: 'xy',
            events: {
                click: function (e) {
                    //get the x and y positions that were clicked
                    var x = e.xAxis[0].value;
                    var y = e.yAxis[0].value;
                    
                    //get the series for the graph, there should only be one in this case
                    var series = this.series[0];

                    //get the integer values
                    x = Math.floor(x);
                    y = Math.floor(y);
                    
                    //add the point to the series
                    series.addPoint([x, y]);
                }
            }
        },
        title: {
            text: title
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            title: {
                enabled: true,
                text: xLabel
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            min: xMin,
            max: xMax
        },
        yAxis: {
            title: {
                text: yLabel
            },
            min: yMin,
            max: yMax
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x} ' + xUnits + '{point.y} ' + yUnits
                }
            }
        },
        series: [{
        	
            regression: true ,
            regressionSettings: {
                type: regressionType,
                color:  'rgba(223, 83, 83, .9)',
                xMin: xMin,
                xMax: xMax,
                numberOfPoints: numberOfRegressionPoints
            },
        	id: 'primary',
            name: 'Data Point',
            color: 'rgba(119, 152, 191, .5)',
            data: [],
            //data: [[125.0, 60.0], [130.0, 80.0], [135.0, 90.0], [140.0, 70.0], [145.0, 60.0], [150.0, 60.0], [155.0, 60.0], [165.0, 100.0], [180.0, 120.0], [190.0, 110.0], [200.0, 100.0], [210.0, 90.0], [220.0, 80.0]],
            point: {
            	events: {
            		click: function (e) {
            			this.remove();
            		}
            	}
            }
        }
        ]
    };
	
	if(data != null) {
		//set the previous student chart data into the chart
		this.chart.series[0].data = data;
	}
	
	//render the chart
    this.renderChart('chartDiv', this.chart);
    
    thisHighchartsTest = this;
    
    //set the click event for the chart button
    $('#chartButton').click({thisHighchartsTest:thisHighchartsTest}, this.chartButtonClicked);
};

/**
 * Render the chart
 * @param divId the div to render the chart in
 * @param chartObject the chart object to render
 */
HighchartsTest.prototype.renderChart = function(divId, chartObject) {
	
	//check if the div exists
	if($('#' + divId).length > 0) {
		//get the highcharts object from the div
		var highchartsObject = $('#' + divId).highcharts();
		
		if(highchartsObject != null) {
			//destroy the existing chart because we will be making a new one
			highchartsObject.destroy();
		}
	}
	
	//set the divId into the chart object so we can access it in other contexts
	chartObject.chart.renderTo = divId;
	
	//render the highcharts chart
	var highchartObject = new Highcharts.Chart(chartObject);
}

/**
 * Get the data from the highcharts object
 * @param highchartsObject the highcharts object
 */
HighchartsTest.prototype.getData = function(highchartsObject) {
	/*
	 * get the data from the series, there should only be one series.
	 * the data object from the highcharts series is an array of
	 * Point objects which contain a lot of fields that we do not 
	 * need to save.
	 */
	var data = highchartsObject.series[0].data;
	
	var resultData = [];
	
	//loop through the data points
	for(var i=0; i<data.length; i++) {
		var point = data[i];
		var x = point.x;
		var y = point.y;
		
		/*
		 * put the x, y values into an array where the first
		 * element in the array will be the x value and the
		 * second element will be the y value
		 */
		var tempPoint = [];
		tempPoint.push(x);
		tempPoint.push(y);
		resultData.push(tempPoint);
	}
	
	return resultData;
}

/**
 * The update chart button was clicked
 */
HighchartsTest.prototype.chartButtonClicked = function(event) {
	var thisHighchartsTest = event.data.thisHighchartsTest;
	
	//re-draw the chart
	thisHighchartsTest.updateChart(event);
};

/**
 * Re-draw the chart to take into account whether any of the
 * xMin, xMax, yMin, yMax values have changed or if the regression
 * line type has changed
 */
HighchartsTest.prototype.updateChart = function() {
    var highchartsObject = $('#chartDiv').highcharts();
    
    //get the data from the highcharts object as an array
    var data = this.getData(highchartsObject);

    //set the data into the chart object
    this.chart.series[0].data = data;
    
    //set rendered to false so that it will render the regression again
    this.chart.series[0].rendered = false;
    
    /*
     * create a new series array so that it does not contain the regression series.
     * the regression series is in this.chart.series[1]
     */
    var series = [];
    series[0] = this.chart.series[0];

    //get the regression type to use
    var regressionType = $('#regressionTypeChooser').val();
    
    if(regressionType != null) {
    	//set the regression type into the series
    	series[0].regressionSettings.type = regressionType;
    }
    
    //set the new series into the chart
    this.chart.series = series;
    
    //render the chart
    this.renderChart('chartDiv', this.chart);
    
    //save the student data
    this.save();
};

/**
 * This function retrieves the latest student work
 * 
 * TODO: rename HighchartsTest
 * 
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
HighchartsTest.prototype.getLatestState = function() {
	var latestState = null;
	
	//check if the states array has any elements
	if(this.states != null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};

/**
 * This function retrieves the student work from the html ui, creates a state
 * object to represent the student work, and then saves the student work.
 * 
 * TODO: rename HighchartsTest
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at highchartsTest.html).
 */
HighchartsTest.prototype.save = function() {
	//get the answer the student wrote
	var response = $('#studentResponseTextArea').val();
	
    var highchartsObject = $('#chartDiv').highcharts();
    
    //get the data from the highcharts object as an array
    var data = this.getData(highchartsObject);
    
	/*
	 * create the student state that will store the new work the student
	 * just submitted
	 * 
	 * TODO: rename HighchartsTestState
	 * 
	 * make sure you rename HighchartsTestState to the state object type
	 * that you will use for representing student data for this
	 * type of step. copy and modify the file below
	 * 
	 * vlewrapper/WebContent/vle/node/highchartsTest/highchartsTestState.js
	 * 
	 * and use the object defined in your new state.js file instead
	 * of HighchartsTestState. for example if you are creating a new
	 * quiz step type you would copy the file above to
	 * 
	 * vlewrapper/WebContent/vle/node/quiz/quizState.js
	 * 
	 * and in that file you would define QuizState and therefore
	 * would change the HighchartsTestState to QuizState below
	 */
	var highchartsTestState = new HighchartsTestState(response, data);
	
	//get the regression type
	var regressionType = $('#regressionTypeChooser').val();
	highchartsTestState.regressionType = regressionType;
	
	//get the xMin, xMax, yMin, yMax values
	var xMin = parseInt($('#xMinInput').val());
	var xMax = parseInt($('#xMaxInput').val());
	var yMin = parseInt($('#yMinInput').val());
	var yMax = parseInt($('#yMaxInput').val());
	
	highchartsTestState.xMin = xMin;
	highchartsTestState.xMax = xMax;
	highchartsTestState.yMin = yMin;
	highchartsTestState.yMax = yMax;
	
	//set the timestamp for the node state
	highchartsTestState.timestamp = Date.parse(new Date());
	
	/*
	 * fire the event to push this state to the global view.states object.
	 * the student work is saved to the server once they move on to the
	 * next step.
	 */
	this.view.pushStudentWork(this.node.id, highchartsTestState);

	//push the state object into this or object's own copy of states
	this.states.push(highchartsTestState);
};

/**
 * Update the xMin, xMax, yMin, yMax values and re-draw the chart
 */
HighchartsTest.prototype.updateAxisRange = function() {
	
	//get the xMin, xMax, yMin, yMax values from the step UI
	var xMin = parseInt($('#xMinInput').val());
	var xMax = parseInt($('#xMaxInput').val());
	var yMin = parseInt($('#yMinInput').val());
	var yMax = parseInt($('#yMaxInput').val());
	
	//set the values into the chart object
	this.chart.xAxis.min = xMin;
	this.chart.xAxis.max = xMax;
	this.chart.yAxis.min = yMin;
	this.chart.yAxis.max = yMax;
	
	if(this.chart != null && 
			this.chart.series != null &&
			this.chart.series[0] != null &&
			this.chart.series[0].regressionSettings != null) {
		
		/*
		 * set the xMin and xMax into the regression settings so that
		 * the regression line will know what range to calculate points
		 * for
		 */
		this.chart.series[0].regressionSettings.xMin = xMin;
		this.chart.series[0].regressionSettings.xMax = xMax;
	}
	
	//re-draw the chart
	this.updateChart();
};

/**
 * The student has changed the regression type from the regression type
 * drop down chooser so we will update the chart
 */
HighchartsTest.prototype.regressionTypeChooserChanged = function() {
	this.updateChart();
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename highchartsTest to your new folder name
	 * TODO: rename highchartsTest.js
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/quiz.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/highchartsTest/highchartsTest.js');
}