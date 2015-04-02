View.prototype.classroomMonitorDispatcher = function(type, args, obj) {
    if(type == 'classroomMonitorConfigUrlReceived') {
        obj.getClassroomMonitorConfig(args[0]);
    } else if(type == 'loadingProjectCompleted') {
        obj.getStudentStatuses();
        
        //check if the idea basket is enabled for the run
        if(!obj.isIdeaBasketEnabled()) {
            //the idea basket is not enabled for the run so we will hide the idea basket button
            $('#viewIdeaBasketList').hide();
        }
    } else if(type=='premadeCommentWindowLoaded') {
        obj.premadeCommentWindowLoaded();
    }
};

/**
 * Get the classroom monitor config so we can start the classroom monitor
 * @param classroomMonitorConfigUrl the url to retrieve the classroom monitor config
 */
View.prototype.getClassroomMonitorConfig = function(classroomMonitorConfigUrl) {
    //create the classroom monitor model
    this.model = new ClassroomMonitorModel();
    
    //get the classroom monitor config
    var classroomMonitorConfigContent = createContent(classroomMonitorConfigUrl);
    this.config = this.createConfig(classroomMonitorConfigContent);
    
    //fetch i18n files
    this.retrieveLocales("main");
    
    //load the user and class info
    this.loadUserAndClassInfo(createContent(this.config.getConfigParam('getUserInfoUrl')));
    
    //start the classroom monitor
    this.startClassroomMonitor();
};

/**
 * Start the classroom monitor
 */
View.prototype.startClassroomMonitor = function() {
    var view = this,
        //get the run name
        runName = this.config.getConfigParam('runName'),
        //get the run id
        runId = this.config.getConfigParam('runId');
    //get startup view
    this.currentMonitorView = 'studentProgress', // TODO: modify default based on url querystring
    // initialize period, stepID, and workgroupId selected variables
    this.classroomMonitorPeriodSelected = 'all';
    this.classroomMonitorStepIdSelected = null;
    this.classroomMonitorWorkgroupIdSelected = null;
    
    this.fixedHeaders = [];
    
    //set the classroom monitor header text
    $('#runTitle').text(this.getI18NString('classroomMonitor_title') + ' - ' + runName).attr('title', runName);
    $('#runId').text(this.getI18NStringWithParams('classroomMonitor_run', [runId]));
    
    // insert translations
    this.insertTranslations("main", function(){ 
        // initialize tooltips on monitor mode buttons
        view.bsTooltip($('#monitorView > .btn'), {placement: 'bottom'});
    });
    
    // TODO: move to load completed event?
    $(window).on('resize.monitor', function(){
        view.resizeClassroomMonitor();
    });
    this.resizeClassroomMonitor();
    
    // redraw fixed headers whenever a Bootstrap modal is closed (as scrollbar toggling can cause misalignment)
    var _originalHide = $.fn.modal.Constructor.prototype.hide;
    $.extend($.fn.modal.Constructor.prototype, {
        hide: function (_relatedTarget) {
          view.redrawFixedHeaders(true);
          return _originalHide.call(this, _relatedTarget);
        }
    });
    
    // remove 'form-inline' class from DataTables wrappers
    $.extend( $.fn.dataTableExt.oStdClasses, {
        "sWrapper": "dataTables_wrapper"
    } );
    
    // menu option change and click events
    $('#monitorView .btn').button();
    $('#monitorView input').on('change', function(){
        view.setClassroomMonitorView($(this).val());
    });
    
    //set the click event for the show classroom menu item
    $('#showClassroomMenuItem').on('click', function() {
        //show the show classroom view
        view.setClassroomMonitorView('showClassroom');
    });
    
    //display a loading message; TODO: remove
    //$('#selectDisplayButtonsDiv').html('<p style="display:inline;margin-left:5px">Loading...</p>');
    
    //initialize the session
    this.initializeSession();
    
    /*
     * load the project. when the project loading is completed we will
     * get the student statuses, get the students online list, and then
     * start the websocket connection 
     */
    this.loadProject(this.config.getConfigParam('getContentUrl'), this.config.getConfigParam('getContentBaseUrl'), true);
};

/**
 * Default multiselect buttonText
 *
 * TODO: figure out how to properly set this in an $.extend
 */
View.prototype.multiselectButtonText = function(options, select){
    if (options.length === 0) {
        return '<span>' + this.nonSelectedText + '</span> <b class="caret"></b>';
    }
    else {
        if (options.length > this.numberDisplayed) {
            return '<span>' + options.length + ' ' + this.nSelectedText + '</span> <b class="caret"></b>';
        }
        else {
            var selected = '';
            options.each(function() {
                var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).html();

                selected += label + ', ';
            });
            return '<span>' + selected.substr(0, selected.length - 2) + '</span> <b class="caret"></b>';
        }
    }
};

/**
 * Make display adjustments upon window resize
 */
View.prototype.resizeClassroomMonitor = function(){
    this.repositionPopovers();
    
    // adjust run title max width
    $('#runTitle').css('max-width', function() {
        var extra = $('#monitorTopNav .navbar-toggle').is(':visible') ? 0 : 50;
        return $('#monitorTopNav').width() - $('#monitorTopNav .navbar-collapse').outerWidth() - 
            $('#monitorTopNav .navbar-toggle').outerWidth() - $('#runId').outerWidth() - extra;
    });
    
    this.redrawFixedHeaders();
};

/**
 * re-position all bootstrap popovers
 */
View.prototype.repositionPopovers = function(){
    $('[data-original-title]').each(function(){
        try {
            if($(this).data('bs.popover').$tip.is(':visible')){
                $(this).popover('hide').popover('show');
            }
        } catch(e) {}
    });
};

/**
 * Redraws DataTables fixed headers
 * 
 * @param noTimeout Boolean specifying whether a timeout of .5 seconds should be added or not
 */ 
View.prototype.redrawFixedHeaders = function(noTimeout) {
    var view = this,
        timeout = noTimeout ? 0 : 500;
    
    if(!noTimeout){ $('.fixedHeader table.dataTable').hide(); }
    
    setTimeout( function(){
        for (var i = 0; i < view.fixedHeaders.length; i++) {
            view.fixedHeaders[i]._fnUpdateClones(true); // force redraw
            view.fixedHeaders[i]._fnUpdatePositions();
        }
        
        // TODO: this is a hack; figure out why FixedHeaders are always calculated 2px too wide in Firefox
        if(navigator.userAgent.indexOf("Firefox")!=-1){
            $('.fixedHeader table.dataTable').each(function(){
                var w = $(this).width();
                $(this).width(w-2);
            });
        }
        
        if(!noTimeout){ $('.fixedHeader table.dataTable').show(); }
    }, timeout);
};


/**
 * Create all the UI elements for the classroom monitor
 */
View.prototype.createClassroomMonitorDisplays = function() {
    this.createClassroomMonitorButtons();
    this.createClassroomMonitorPeriods();
    this.createPauseScreensDisplay();
    this.createStudentProgressDisplay();
    this.createStepProgressDisplay();
    this.createGradeByStudentDisplay();
    this.createGradeByStepDisplay();
    this.createExportStudentWorkDisplay();
    
    //check if the idea basket is enabled for the run
    if(this.isIdeaBasketEnabled()) {
        //create the idea basket list and item displays
        this.createIdeaBasketListDisplay();
        this.createIdeaBasketItemDisplay();     
    }
    
    this.createPremadeCommentsDiv();
    this.createShowClassroomDisplay();
    // set the default view
    this.setClassroomMonitorView(this.currentMonitorView);
};

/**
 * Displays the specified classroom monitor view and hides all other views
 * 
 * @param monitorView String view mode
 */
View.prototype.setClassroomMonitorView = function(monitorView){
    switch(monitorView) {
        case 'stepProgress':
            // student progress is the default view
            this.showStepProgressDisplay();
            break;
        case 'exportWork':
        case 'manageStudents':
        case 'gradebook':
        case 'announcements':
        case 'notes':
        case 'runSettings':
        case 'studentprogress':
        case 'ideaBasketList':
            //show the idea basket list view
            this.showIdeaBasketList();
            break;
        case 'showClassroom':
            //show the show classroom view
            this.showShowClassroomDisplay();
            break;
        default:
            // student progress is the default view
            this.showStudentProgressDisplay();
    }
};

/**
 * Clear the nodeIdClicked and workgroupIdClicked values
 */
View.prototype.clearNodeIdClickedAndWorkgroupIdClicked = function() {
    this.nodeIdClicked = null;
    this.workgroupIdClicked = null;
};

/**
 * Hide all the monitor displays
 */
View.prototype.hideAllDisplays = function() {
    /*$('#studentProgressDisplay').hide();
    $('#stepProgressDisplay').hide();
    $('#gradeByStudentDisplay').hide();
    $('#gradeByStepDisplay').hide();
    $('#pauseScreensDisplay').hide();
    $('#exportStudentWorkDisplay').hide();
    $('#ideaBasketDisplay').hide();
    $('#premadeCommentsDiv').hide();*/
    
    // hide all sections
    $('#pageContent > section').hide();
    
    // hide the new work notification
    $('#newWork').hide();
}

/**
 * Show the premade comments div
 * @param commentBoxId the comment textarea for a specific student work
 * @param studentWorkColumnId the div that contains the student work that we will
 * be giving a premade comment to
 */
View.prototype.showPremadeCommentsDiv = function(commentBoxId, studentWorkColumnId) {
    //show the div
    $('#premadeCommentsDiv').show();
    
    //remember the ids in the view so we can access it easily later
    this.commentBoxId = commentBoxId;
    this.studentWorkColumnId = studentWorkColumnId;
    
    //get the existing comment for the student work
    var commentBoxValue = $('#' + this.escapeIdForJquery(commentBoxId)).val();
    
    //populate the premade comments textarea with the existing comment
    $('#premadeCommentsTextArea').val(commentBoxValue);
    
    //retrieve the premade comments from the server
    this.retrievePremadeComments();
};

/**
 * Hide the premade comments div
 */
View.prototype.hidePremadeCommentsDiv = function() {
    $('#premadeCommentsDiv').hide();
};

/**
 * Show the student progress section
 */
View.prototype.showStudentProgressDisplay = function() {
    // hide all sections
    this.hideAllDisplays();
    
    // clear the nodeIdClicked and workgroupIdClicked values; TODO: remove/revise
    this.clearNodeIdClickedAndWorkgroupIdClicked();
    
    // filter for currently selected period
    if(this.classroomMonitorPeriodSelected !== null) {
        var period = (this.classroomMonitorPeriodSelected === 'all') ? '' : this.classroomMonitorPeriodSelected;
        $('#studentProgressTable_periodSelect').multiselect('select', period).multiselect('refresh');
        this.studentProgressTable
            .column( 4 )
            .search( period )
            .draw();
    }
    
    // show student progress
    $('#studentProgress').show();
    
    // hide loading message
    $('#loading').hide();
    
    // redraw DataTable fixed headers
    this.redrawFixedHeaders();
    this.studentProgressTable.columns.adjust();
};


/**
 * Show the step progress display
 */
View.prototype.showStepProgressDisplay = function() {
    // hide all sections
    this.hideAllDisplays();
    
    // clear the nodeIdClicked and workgroupIdClicked values; TODO: revise/remove
    this.clearNodeIdClickedAndWorkgroupIdClicked();
    
    // filter for currently selected period
    if(this.classroomMonitorPeriodSelected !== null) {
        var period = (this.classroomMonitorPeriodSelected === 'all') ? view.getI18NString('classroomMonitor_allPeriods') : this.classroomMonitorPeriodSelected;
        $('#stepProgressTable_periodSelect').multiselect('select', period).multiselect('refresh');
        this.stepProgressTable
            .column( 0 )
            .search( period )
            .draw();
    }
    
    // show step progress
    $('#stepProgress').show();
    
    // hide loading message
    $('#loading').hide();
    
    // redraw DataTable fixed headers
    this.redrawFixedHeaders();
    this.stepProgressTable.columns.adjust();
};

/**
 * Show the step progress display
 */
View.prototype.showGradeByStudentDisplay = function() {
    // show grade by student section
    $('#gradeByStudent').show();
    
    // redraw DataTable fixed headers
    this.redrawFixedHeaders();
    this.gradeByStudentTable.columns.adjust();
};

/**
 * Show the step progress display
 */
View.prototype.showGradeByStepDisplay = function() {
    // show the grade by step section
    $('#gradeByStep').show();
    
    // redraw DataTable fixed headers
    this.redrawFixedHeaders();
    this.gradeByStepTable.columns.adjust();
};

/**
 * Show the export student work display
 */
View.prototype.showExportStudentWorkDisplay = function() {
    //clear any existing buttons in the upper right
    this.clearDisplaySpecificButtonsDiv();
    this.clearSaveButtonDiv();
    this.clearNewWorkNotificationDiv();
    
    //hide all the other display divs
    this.hideAllDisplays();
    
    //hide the period buttons
    this.hidePeriodButtonsDiv();
    
    //clear the nodeIdClicked and workgroupIdClicked values
    this.clearNodeIdClickedAndWorkgroupIdClicked();
    
    //show the export student work div
    $('#exportStudentWorkDisplay').show();
    
    //fix the height so scrollbars display correctly
    this.fixClassroomMonitorDisplayHeight();
};

/**
 * Show the list of students and how many ideas each student has in their basket
 */
View.prototype.showIdeaBasketList = function() {
    //get the idea basket list table
    var ideaBasketListTable = $('#ideaBasketListTable');
    
    //get the data table object
    var ideaBasketListTableDataTable = ideaBasketListTable.DataTable();
    
    // hide all sections
    this.hideAllDisplays();
    
    // clear the nodeIdClicked and workgroupIdClicked values; TODO: remove/revise
    this.clearNodeIdClickedAndWorkgroupIdClicked();
    
    // filter for currently selected period
    if(this.classroomMonitorPeriodSelected !== null) {
        var period = (this.classroomMonitorPeriodSelected === 'all') ? '' : this.classroomMonitorPeriodSelected;
        $('#ideaBasketListTable_periodSelect').multiselect('select', period).multiselect('refresh');
        ideaBasketListTableDataTable
            .column( 5 )
            .search( period )
            .draw();
    }
    
    //show the idea basket list div
    $('#ideaBasketList').show();
    
    // hide loading message
    $('#loading').hide();
    
    // redraw DataTable fixed headers
    this.redrawFixedHeaders();
    ideaBasketListTableDataTable.columns.adjust();
};

/**
 * Show the show classroom display
 */
View.prototype.showShowClassroomDisplay = function() {
    //hide all the other display views
    this.hideAllDisplays();
    
    //hide the table headers
    $('.fixedHeader').hide();
    
    //clear the nodeIdClicked and workgroupIdClicked values; TODO: revise/remove
    this.clearNodeIdClickedAndWorkgroupIdClicked();
    
    //show the show classroom div
    $('#showClassroomDiv').show();
};

/**
 * Opens teacher's notes for this run
 */
View.prototype.openTeacherRunNotes = function (runId) {
    var path = this.config.getConfigParam('wiseBaseURL') + '/teacher/run/notes.html?runId=' + runId;
    var myNotesDiv = $('<div>').attr('id', 'myNotesDialog').html('<iframe id="myNotesIfrm" width="100%" height="95%" src="'+path+'"></iframe>');
    $("#classroomMonitorMainDiv").append(myNotesDiv);
    myNotesDiv.dialog({
        modal: true,
        width: '700',
        height: '450',
        title: 'My Notes',
        close: function(){ $(this).html(''); },
        buttons: {
            Close: function(){
                $(this).dialog('close');
            }
        }
    });
};

/**
 * Create the classroom monitor buttons
 * TODO: remove
 */
View.prototype.createClassroomMonitorButtons = function() {
    //make the period button class
    var chooseClassroomMonitorDisplayButtonClass = 'chooseClassroomMonitorDisplayButton';
    
    //create the student progress button
    var studentProgressButton = $('<input/>').attr({id:'studentProgressButton', type:'button', name:'studentProgressButton', value:'Student Progress'});
    studentProgressButton.addClass(chooseClassroomMonitorDisplayButtonClass);
    
    /*
     * make the button yellow since the pause screens display is 
     * the display we show when the classroom monitor starts up
     */
    this.setActiveButtonBackgroundColor(studentProgressButton);
    
    //create the step progress button
    var stepProgressButton = $('<input/>').attr({id:'stepProgressButton', type:'button', name:'stepProgressButton', value:'Step Progress'});
    stepProgressButton.addClass(chooseClassroomMonitorDisplayButtonClass);
    
    //create the pause all screens tool button
    var pauseScreensToolButton = $('<input/>').attr({id:'pauseScreensButton', type:'button', name:'pauseScreensButton', value:'Pause Screens Tool'});
    pauseScreensToolButton.addClass(chooseClassroomMonitorDisplayButtonClass);
    
    //create the my notes button
    var myNotesButton = $('<input/>').attr({id:'myNotesButton', type:'button', name:'myNotesButton', value:'My Notes'});
    myNotesButton.addClass(chooseClassroomMonitorDisplayButtonClass);

    //create the export student work button
    var exportStudentWorkButton = $('<input/>').attr({id:'exportStudentWorkButton', type:'button', name:'exportStudentWorkButton', value:'Export Student Work'});
    exportStudentWorkButton.addClass(chooseClassroomMonitorDisplayButtonClass);
    
    //set the click event for the student progress button
    studentProgressButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        //clear the background from the other display buttons and make this button background yellow
        thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
        
        //show the student progress display
        thisView.showStudentProgressDisplay();
    });
    
    //set the click event for the step progress button
    stepProgressButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        //clear the background from the other display buttons and make this button background yellow
        thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
        
        //show the step progress display
        thisView.showStepProgressDisplay();
    });
    
    //set the click event for the pause all screens tool button
    pauseScreensToolButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        //clear the background from the other display buttons and make this button background yellow
        thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
        
        //show the pause all screens display
        thisView.showPauseScreensDisplay();
    });
    
    //set the click event for the my notes button
    myNotesButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        var runId = thisView.config.getConfigParam("runId");
        if (runId != null) {
            //open teacher run notes dialog
            thisView.openTeacherRunNotes(runId);            
        }
    });
    
    //set the click event for the export student work button
    exportStudentWorkButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        //clear the background from the other display buttons and make this button background yellow
        thisView.setActiveButtonBackgroundColor(this, chooseClassroomMonitorDisplayButtonClass);
        
        //show the step progress display
        thisView.showExportStudentWorkDisplay();
    });
    
    //add the select display buttons
    $('#selectDisplayButtonsDiv').append(studentProgressButton);
    $('#selectDisplayButtonsDiv').append(stepProgressButton);
    $('#selectDisplayButtonsDiv').append(pauseScreensToolButton);
    $('#selectDisplayButtonsDiv').append(myNotesButton);
    $('#selectDisplayButtonsDiv').append(exportStudentWorkButton);
    
    //fix the height so scrollbars display correctly
    this.fixClassroomMonitorDisplayHeight();
};

/**
 * Set the background of the active button to yellow and remove
 * the background color from the other buttons that are in the
 * same class
 * @param button the button element to make yellow
 * @param classToRemoveBackgroundFrom the class that the button is
 * in so we can remove the yellow background from the other buttons
 */
View.prototype.setActiveButtonBackgroundColor = function(button, classToRemoveBackgroundFrom) {
    if(classToRemoveBackgroundFrom != null) {
        //remove the yellow background from the other buttons in the class
        $('.' + classToRemoveBackgroundFrom).css('background', '');
    }
    
    if(button != null) {
        //make this button yellow
        $(button).css('background', 'yellow');      
    }
};

/**
 * Remove the yellow background highlighting from all elements that have
 * the given class
 * @param classToRemoveBackgroundFrom the class to remove background highlighting from
 */
View.prototype.removeBackgroundColor = function(classToRemoveBackgroundFrom) {
    if(classToRemoveBackgroundFrom != null) {
        //remove the yellow background from the elements that have the class
        $('.' + classToRemoveBackgroundFrom).css('background', '');
    }
};

/**
 * Create the period buttons for the teacher to filter by period
 */
View.prototype.createClassroomMonitorPeriods = function() {
    //hide the period buttons div, we will show it when we need to
    this.hidePeriodButtonsDiv();
    
    //make the class to give to all period buttons
    var periodButtonClass = 'periodButton';
    
    //get all the periods
    var periods = this.getUserAndClassInfo().getPeriods();
    
    //create a button for all the periods
    var allPeriodsButton = $('<input/>').attr({id:'periodButton_all', type:'button', name:'periodButton_all', value:'All'});
    allPeriodsButton.addClass(periodButtonClass);
    
    /*
     * make the button yellow since all periods is selected 
     * when the classroom monitor starts up
     */
    this.setActiveButtonBackgroundColor(allPeriodsButton);
    
    //add the all periods button to the UI
    $('#selectPeriodButtonsDiv').append(allPeriodsButton);
    
    //set the click event for the all periods button
    allPeriodsButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        //get the id of the button
        var buttonId = this.id;
        
        //get the period id
        var periodId = buttonId.replace('periodButton_', '');
        
        //clear the background from the other period buttons and make this button background yellow
        thisView.setActiveButtonBackgroundColor(this, periodButtonClass);
        
        /*
         * a period button has been clicked so we will perform 
         * any necessary changes to the UI
         */
        thisView.periodButtonClicked(periodId);
    });
    
    if(periods != null) {
        //loop through all the periods
        for(var x=0; x<periods.length; x++) {
            //get a period
            var periodObject = periods[x];
            var periodId = periodObject.periodId;
            var periodName = periodObject.periodName;
            
            //make the id of the button
            var buttonId = 'periodButton_' + periodId;
            
            //make the label for the button
            var buttonLabel = 'Period ' + periodName;
            
            //create the button
            var periodButton = $('<input/>').attr({id:buttonId, type:'button', name:buttonId, value:buttonLabel});
            periodButton.addClass(periodButtonClass);
            
            //add the button to the UI
            $('#selectPeriodButtonsDiv').append(periodButton);
            
            //set the click event for the period button
            periodButton.click({thisView:this}, function(event) {
                var thisView = event.data.thisView;
                
                //get the id of the button
                var buttonId = this.id;
                
                //get the period id
                var periodId = buttonId.replace('periodButton_', '');
                
                //clear the background from the other period buttons and make this button background yellow
                thisView.setActiveButtonBackgroundColor(this, periodButtonClass);
                
                /*
                 * a period button has been clicked so we will perform 
                 * any necessary changes to the UI
                 */
                thisView.periodButtonClicked(periodId);
            });
        }
    }
    
    //when the classroom monitor first starts up it will be set to all periods
    this.classroomMonitorPeriodIdSelected = 'all';
};

/**
 * Show the period buttons div
 */
View.prototype.showPeriodButtonsDiv = function() {
    //get the user and class info
    var userAndClassInfo = this.getUserAndClassInfo();
    
    if(userAndClassInfo != null) {
        //get the periods
        var periods = userAndClassInfo.getPeriods();
        
        if(periods != null) {
            /*
             * show the period buttons div if there is more than one period.
             * if there is only one period we don't need to show the period
             * buttons div.
             */
            if(periods.length > 1) {
                $('#selectPeriodButtonsDiv').show();
            }
        } else {
            //if for some reason periods is null, we will show the period buttons div by default
            $('#selectPeriodButtonsDiv').show();
        }
    }
};

/**
 * Hide the period buttons div
 */
View.prototype.hidePeriodButtonsDiv = function() {
    $('#selectPeriodButtonsDiv').hide();
};

/**
 * A period button was clicked so we will perform any necessary
 * changes to the UI such as filtering only for that period
 * @param periodId the period id
 */
View.prototype.periodButtonClicked = function(periodId) {
    if(periodId == null) {
        //if no period id was provided we will set the selected period to all
        this.classroomMonitorPeriodIdSelected = 'all';
    } else {
        //remember the period id that was selected
        this.classroomMonitorPeriodIdSelected = periodId;
    }
    
    //update the student progress display to only show students in the period
    this.showPeriodInStudentProgressDisplay(periodId);
    
    //update the step progress display to only show data from the period
    this.showPeriodInStepProgressDisplay(periodId);
    
    //update the grade by step display to only show students in the period
    this.showPeriodInGradeByStepDisplay(periodId);
};

/**
 * Filter all the students to only show students in the period
 * @param periodId the period id
 */
View.prototype.showPeriodInStudentProgressDisplay = function(periodId) {
    if(periodId == null || periodId == 'all') {
        //show all the student rows for all the periods
        $('.studentProgressRow').show();
    } else if(periodId != null) {
        /*
         * period id is provided so we will hide all student rows except the
         * ones in the period
         */
        
        //hide all the student rows in the student progress display
        $('.studentProgressRow').hide();
        
        //get the period id class
        var periodIdClass = 'studentProgressPeriodId_' + periodId;
        
        /*
         * show all the student rows in the period within the
         * student progress display. if the student progress display
         * is not currently being displayed, the rows will
         * not be shown but they will be shown when the teacher 
         * switches to the student progress display.
         */ 
        $('.' + periodIdClass).show();
    }
};

/**
 * Filter the step progress information to only show information
 * in a period
 * @param periodId the period id
 */
View.prototype.showPeriodInStepProgressDisplay = function(periodId) {
    
    //get all the node ids. this includes activity and step node ids.
    var nodeIds = this.getProject().getNodeIds();
    
    //loop through all the node ids
    for(var x=0; x<nodeIds.length; x++) {
        //get a node id
        var nodeId = nodeIds[x];
        
        //get the node
        var node = this.getProject().getNodeById(nodeId);
        
        if(node != null) {
            //get the number of students in the period that are on this step
            var numberOfStudentsOnStep = this.getNumberOfStudentsOnStep(nodeId, periodId);

            //get the percentage of students in the period who have completed this step
            var completionPercentage = this.calculateStepCompletionForNodeId(nodeId, periodId);
            
            //check if there is a student that is online in this period that is on the step
            var isStudentOnStep = this.isStudentOnlineAndOnStep(nodeId, periodId);
            
            /*
             * update the number of students on the step and the 
             * number of students who have completed the step
             */
            this.updateStepProgress(nodeId, numberOfStudentsOnStep, completionPercentage, isStudentOnStep);
        }
    }
};

/**
 * Check if there are any students online that are on the step and in the period
 * @param nodeId the node id
 * @param periodId (optional) the period id. if this is not passed in we will use
 * the period id that is currently selected in the UI
 * @return whether there are any students online that are on the step and in the period
 */
View.prototype.isStudentOnlineAndOnStep = function(nodeId, periodId) {
    var result = false;
    
    if(periodId == null) {
        //get the period id that is currently selected in the UI
        periodId = this.classroomMonitorPeriodIdSelected;
    }
    
    var studentsOnline = this.studentsOnline;
    
    if(studentsOnline != null) {
        //loop through all the students that are online
        for(var x=0; x<studentsOnline.length; x++) {
            //get the workgroup id of a student that is online
            var workgroupId = studentsOnline[x];
            
            //get the student status
            var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
            
            if(studentStatus != null) {
                //get the period id the student is in and the current step the student is on
                var studentPeriodId = studentStatus.periodId;
                var currentNodeId = studentStatus.currentNodeId;
                
                /*
                 * check if we are looking for all periods or if we are looking
                 * for a specific period, we will check if the period id matches
                 */
                if(periodId == null || periodId == 'all' || periodId == studentPeriodId) {
                    //the student is in the period we want
                    
                    if(nodeId == currentNodeId) {
                        //the student is on the step
                        result = true;
                        break;
                    }
                }
            }
        }
    }
    
    return result;
};

/**
 * Filter the grade by step display by period
 * @param periodId only display students in this period
 */
View.prototype.showPeriodInGradeByStepDisplay = function(periodId) {
    if(periodId == null || periodId == 'all') {
        //show all the student rows for all the periods
        $('.gradeByStepRow').show();
    } else if(periodId != null) {
        /*
         * period id is provided so we will hide all student rows except the
         * ones in the period
         */
        
        //hide all the student rows in the student progress display
        $('.gradeByStepRow').hide();
        
        //get the period id class
        var periodIdClass = 'gradeByStepRowPeriodId_' + periodId;
        
        /*
         * show all the student rows in the period within the
         * grade by step display
         */ 
        $('.' + periodIdClass).show();
    }
};

/**
 * Fix the height of the classroomMonitorIfrm so no scrollbars are displayed
 * for the iframe
 */
View.prototype.fixClassroomMonitorDisplayHeight = function() {
    //get the height of the classroomMonitorIfrm
    var height = $('#classroomMonitorIfrm',window.parent.parent.document).height();
    if (height != null) {
        /*
         * resize the height of the topifrm that contains the classroomMonitorIfrm
         * so that there will be no scroll bars
         * 
         * this block is only applicable when classroom monitor is launched in a 
         * floating window, not when launched in a new tab/window.
         */
        $('#topifrm', parent.document).height(height);
    } else {
        $('#topifrm', parent.document).css("overflow-y", "auto");
    }
};

/**
 * Create the pause all screens display
 */
View.prototype.createPauseScreensDisplay = function() {
    //get the run status
    var runStatus = this.runStatus,
        allPeriodsPaused = false,
        view = this;
    
    if(runStatus !== null) {
        //get whether all periods are paused
        allPeriodsPaused = runStatus.allPeriodsPaused;
    }
    
    //get the periods
    var periods = this.getUserAndClassInfo().getPeriods(),
        selectAll = false;
    
    if(periods !== null) {
        //if there is more than one period we will display the 'All Periods' select option
        if(periods.length > 1) {
            selectAll = true;       
        }

        //loop through all the periods and create a row for each period
        for(var x=0; x<periods.length; x++) {
            var period = periods[x];
            
            if(period !== null) {
                var periodId = 'pause_' + period.periodId;
                var periodName = period.periodName;
                var periodPaused = period.paused;
                var periodLabel = view.getI18NStringWithParams('classroomMonitor_periodLabel', [periodName]);
                
                $('#pauseSelectPeriods').append('<option id="' + periodId + '" value="' + periodId + '">' + periodLabel + '</option>');
            }
        }
    }
    
    $('#pauseSelectPeriods').multiselect({
        buttonText: view.multiselectButtonText,
        nonSelectedText: view.getI18NString('classroomMonitor_pause_noneSelected'),
        nSelectedText: view.getI18NString('classroomMonitor_pause_periods'),
        numberDisplayed: 2,
        includeSelectAllOption: selectAll,
        selectAllText: view.getI18NString('classroomMonitor_allPeriods'),
        selectAllValue: 'pause_all',
        //dropRight: true,
        maxHeight: 250,
        onChange: function(){
            view.updatePauseScreens();
        }
    });
    
    $('#pauseMsg').on('blur', function(){
        view.updatePauseScreens();
    });
    
    // initialize pause screens UI
    $('#pauseControls').popover({
        animation: false,
        html: true,
        placement: 'bottom',
        //container: 'body',
        content: $('#pauseScreensContent'),
        viewport: {
            selector: 'body',
            padding: 5
        }
    }).on('show.bs.popover', function () {
        
    }).on('hide.bs.popover', function () {
        //$('#pauseSelectPeriods').multiselect('destroy');
        $('#pauseScreensWrap').append($('#pauseScreensContent'));
    });
};

/**
 * Inserts period select dropdown, title, etc. to a classroom monitor section
 * 
 * @param $table jQuery DOM object of target table
 * @param $wrapper jQuery DOM element of target table's wrapper
 * @param headerText String for section header title
 * @param options Object header settings (optional)
 */
View.prototype.addSectionHeader = function($table, $wrapper, headerText, options){
    var settings = {
        'view': 'progress', // progress monitor view ('progress', 'studentGrading', 'stepGrading', 'manageStudents', 'gradebook', 'announcements')
        'allSelector': '', // value for the 'all periods' option in the period select element
        'periodCol': 0 // column of the given DataTable to filter on for the period select (ignored if view is not set to 'progress', 'manageStudents', or 'announcements')
    };
    
    if(options !== null && typeof options === 'object'){
        // options have been sent in as a parameter, so merge with defaults
        $.extend(settings,options);
    }
    
    var $header = $('<div class="pull-left">'),
        // initiate class period select
        $periodFilter = $('<select id="' + $table.attr('id') + '_periodSelect"></select>'),
        //get the periods
        periods = this.getUserAndClassInfo().getPeriods();
    
    if(periods !== null) {
        //if there is more than one period we will display the 'All Periods' select option
        if(periods.length > 1) {
            $periodFilter.append('<option value="' + settings.allSelector + '" selected>' + view.getI18NString('classroomMonitor_allPeriods') + '</option>');   
        } else {
            view.classroomMonitorPeriodSelected = periods[0].periodName;
        }

        //loop through all the periods and create an option for each period
        for(var x=0; x<periods.length; x++) {
            var period = periods[x];
            
            if(period !== null) {
                var periodName = period.periodName;
                $periodFilter.append('<option value="' + periodName + '">' + view.getI18NStringWithParams('classroomMonitor_periodLabel', [periodName]) + '</option>');
            }
        }
    }
    
    // insert period select into header tools
    $header.prepend($periodFilter);
    
    var changePeriod = function(period){};
    
    switch(settings.view) {
        case 'studentGrading':
            // initiate workgroup select
            var $workgroupFilter = $('<select id="' + $table.attr('id') + '_workgroupSelect"></select>');
            // insert workgroup select into DOM
            $header.prepend($workgroupFilter);
            // initialize Bootstrap Multiselect
            $workgroupFilter
                .multiselect({
                    buttonText: view.multiselectButtonText,
                    buttonClass: 'btn btn-default btn-sm',
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 250,
                    onChange: function(){
                        var id = $workgroupFilter.val();
                        view.studentRowClickedHandler(id);
                    }
                });
            
            changePeriod = function(period){
                if(period !== view.classroomMonitorPeriodSelected){
                    if(period === settings.allSelector){
                        // only need to rebuild workgroup select
                        view.populateWorkgroupSelect('all', $table.attr('id'), $workgroupFilter.val());
                        view.classroomMonitorPeriodSelected = 'all';
                    } else {
                        // need to rebuild workgroup select and switch grading view to first workgroup from chosen period
                        var id = '',
                            table = view.studentProgressTable;
                        table.rows().eq( 0 ).each( function (rowIdx) {
                            if (table.cell( rowIdx, 9 ).data() === period && id === '') { // TODO: figure out why return false isn't breaking out of $.each
                                id = table.row( rowIdx ).data().workgroup_id;
                                return false;
                            }
                        } );
                        view.classroomMonitorPeriodSelected = (period === settings.allSelector) ? 'all' : period;
                        view.studentRowClickedHandler(id);
                    }
                    
                }
            }
            
            break;
        case 'stepGrading':
            // initiate workgroup select
            var $stepFilter = $('<select id="' + $table.attr('id') + '_stepSelect"></select>'),
                
                //get all the node ids for steps that have a grading view
                nodeIds = this.getProject().getNodeIds(true);
            
            //loop through all the node ids
            for(var x=0; x<nodeIds.length; x++) {
                //get a node id
                var tempNodeId = nodeIds[x],
                    //get the node
                    node = this.getProject().getNodeById(tempNodeId),
                    nodeType = '';
                
                if(node != null) {
                    //get the node type
                    nodeType = node.type;
                }
                
                //get the step number and title
                var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(tempNodeId);
                
                if(nodeType != null) {
                    // add step type
                    var nodeTypeReadable = ' (' + NodeFactory.nodeConstructors[nodeType].authoringToolName + ')';
                    stepNumberAndTitle += nodeTypeReadable;
                }
                
                //create the option for the step
                var stepOption = $('<option>');
                stepOption.text(stepNumberAndTitle);
                stepOption.val(tempNodeId);
                
                //add the option to step select
                $stepFilter.append(stepOption);
            }
            
            // insert step select into DOM
            $header.prepend($stepFilter);
            // initialize Bootstrap Multiselect
            $stepFilter
                .multiselect({
                    buttonText: view.multiselectButtonText,
                    buttonClass: 'btn btn-default btn-sm',
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 250,
                    onChange: function(){
                        var id = $stepFilter.val();
                        view.stepRowClickedHandler(id);
                    }
                });
            
            changePeriod = function(period){
                if(period !== view.classroomMonitorPeriodSelected){
                    if(period === settings.allSelector){
                        // only need to rebuild step select
                        view.classroomMonitorPeriodSelected = 'all';
                        view.stepRowClickedHandler(view.classroomMonitorStepIdSelected);
                    } else {
                        view.classroomMonitorPeriodSelected = period;
                        view.stepRowClickedHandler(view.classroomMonitorStepIdSelected);
                    }
                    
                }
            }
            
            break;
        case 'ideaBasketItem':
            // initiate workgroup select
            var $workgroupFilter = $('<select id="' + $table.attr('id') + '_workgroupSelect"></select>');
            // insert workgroup select into DOM
            $header.prepend($workgroupFilter);
            // initialize Bootstrap Multiselect
            $workgroupFilter
                .multiselect({
                    buttonText: view.multiselectButtonText,
                    buttonClass: 'btn btn-default btn-sm',
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 250,
                    onChange: function(){
                        var id = $workgroupFilter.val();
                        view.ideaBasketClickedHandler(id);
                    }
                });
            
            //called when the period is changed in the drop down
            changePeriod = function(period){
                if(period !== view.classroomMonitorPeriodSelected){
                    if(period === settings.allSelector){
                        // only need to rebuild workgroup select
                        view.populateWorkgroupSelect('all', $table.attr('id'), $workgroupFilter.val());
                        view.classroomMonitorPeriodSelected = 'all';
                    } else {
                        // need to rebuild workgroup select and switch grading view to first workgroup from chosen period
                        var id = '',
                            table = view.ideaBasketListTable;
                        table.rows().eq( 0 ).each( function (rowIdx) {
                            if (table.cell( rowIdx, 5 ).data() === period && id === '') { // TODO: figure out why return false isn't breaking out of $.each
                                id = table.row( rowIdx ).data().workgroup_id;
                                return false;
                            }
                        } );
                        view.classroomMonitorPeriodSelected = (period === settings.allSelector) ? 'all' : period;
                        view.ideaBasketClickedHandler(id);
                    }
                }
            }
            break;
        case 'progress':
        default:
            changePeriod = function(period){
                view.classroomMonitorPeriodSelected = (period === settings.allSelector) ? 'all' : period;
                // update DataTable filter
                $table.DataTable()
                    .column( settings.periodCol )
                    .search( period )
                    .draw();
            };
    }
    
    // initialize Bootstrap Multiselect
    $periodFilter
        .multiselect({
            buttonText: view.multiselectButtonText,
            buttonClass: 'btn btn-default btn-sm',
            onChange: function(){
                var period = $periodFilter.val();
                changePeriod(period);
            }
        });
    
    // insert section title
    $header.prepend('<span class="panel-header">' + headerText + '</span>');
    
    // insert header tools into DOM
    $('.dataTables_top', $wrapper).prepend($header);
}

/**
 * Create the student progress display
 */
View.prototype.createStudentProgressDisplay = function() {
    var view = this,
        table = $('#studentProgressTable');
    this.studentProgressData = [];
    
    //get all the workgroup ids in the class
    var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder();
    
    if(workgroupIds != null) {
        //loop through all the workgroup ids
        for(var x=0; x<workgroupIds.length; x++) {
            //get a workgroup id
            var workgroupId = workgroupIds[x],
            
                //check if the student is online
                online = this.isStudentOnline(workgroupId),
                rowClass = online ? 'online' : 'offline',
                onlineHtml = view.getStudentOnlineHtml(online),
                
                //get the project completion for the student
                studentCompletion = this.calculateStudentCompletionForWorkgroupId(workgroupId),
                // TODO: generalize to function
                completionHtml = '<div class="progress" data-sort="' + studentCompletion + '">\
                    <div class="progress-bar"  role="progressbar" aria-valuenow="' + studentCompletion + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + studentCompletion + '%">\
                    <span class="sr-only">' + studentCompletion + '%</span></div></div>';
                
                //get the student names for this workgroup
                students = this.userAndClassInfo.getStudentNamesByWorkgroupId(workgroupId),
                studentNames = '';
            
            for(var i=0; i<students.length; i++){
                if(i>0){
                    studentNames += ', ';
                }
                studentNames += students[i];
            }
                
            //get the period name the workgroup is in
            var periodName = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId),
                
                //get the period id the workgroup is in
                periodId = this.userAndClassInfo.getClassmatePeriodIdByWorkgroupId(workgroupId),
                
                //get the current step the workgroup is on
                currentStep = this.getStudentCurrentStepByWorkgroupId(workgroupId),
            
                // set the time spent to be blank because it will be updated later when updateStudentProgressTimeSpentInterval() is called
                timeSpent = '';
            
            studentNames = '<a href="javascript:void(0);" class="grade-by-student" title="' + view.getI18NString('classroomMonitor_studentProgress_viewStudentWork') + '" data-workgroupid="' + workgroupId + '">' + studentNames + '<span class="fa fa-search-plus fa-flip-horizontal"></span> <span class="label label-default">' + view.getI18NStringWithParams('classroomMonitor_periodLabel', [periodName]) + '</span></a>';
            
            var scoreHtml = '';
            
            //create the row for the student
            view.studentProgressData.push(
                {
                    "DT_RowId": 'studentProgress_' + workgroupId,
                    "DT_RowClass": rowClass,
                    "online": online,
                    "online_html": onlineHtml, 
                    "workgroup_id": workgroupId,
                    "period_id": periodId,
                    "period_name": periodName,
                    "student_names": studentNames,
                    "current_step": currentStep,
                    "time_spent": timeSpent,
                    "complete": studentCompletion,
                    "complete_html": completionHtml,
                    "score": scoreHtml
                });
        }       
    }
    //var dataSet = $.map(view.studentProgressData, function(value, index) {
        //return [value];
    //});
    var dataSet = view.studentProgressData;
    
    // initialize dataTable
    table.dataTable( {
        'data': dataSet,
        'paging': false,
        'dom': '<"dataTables_top"lf><"clearfix">rt<"dataTables_bottom"ip><"clear">',
        'language': {
            'search': '',
            'info': view.getI18NStringWithParams('classroomMonitor_tableInfoText', ['_TOTAL_'])
        },
        'columns': [
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_online'), 'data': 'online_html', 'class': 'center', 'sort': 'online', 'width': '5%' },
            //{ 'title': 'Status' }, TODO: enable once we are tracking workgroup statuses & alerts
            { 'title': 'Workgroup ID', 'data': 'workgroup_id' },
            { 'title': 'Period ID', 'data': 'period_id' },
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_workgroup'), 'data': 'student_names', 'class': 'gradable viewStudentWork' },
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_period'), 'data': 'period_name', 'class': 'center', 'width': '5%', 'orderData': [4, 3] },
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_currentStep'), 'data': 'current_step', 'orderData': [5, 3] },
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_timeSpent'), 'data': 'time_spent', 'class': 'center', 'orderData': [6, 3] },
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_score'), 'data': 'score', 'class': 'center', 'orderData': [7, 3] },
            { 'title': 'Completion', 'data': 'complete' },
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_projectCompletion'), 'data': 'complete_html', 'class': 'center', 'orderData': [8, 3] },
            { 'title': 'Period Name', 'data': 'period_name' }
        ],
        'order': [[ 3, 'asc' ]],
        'columnDefs': [
            {
                'targets': [ 1, 2, 4, 8, 10 ],
                'visible': false
            },
            {
                'targets': [ 1, 2, 8, 10 ],
                'searchable': false
            }
        ],
        'footerCallback': function ( row, data, start, end, display ) {
            var api = this.api(),
                pageTotal = 0,
    
                // Get total completion over current page
                data = api
                    .column( 8, { page: 'current'} )
                    .data();
            
            if(data.length){
                pageTotal = data.reduce( function (pVal, cVal) {
                    return pVal*1 + cVal*1;
                } )
            }
            var numVals = api.column( 8, { page: 'current'} ).data().length;
            pageTotal = numVals ? pageTotal/numVals : 0;
            
            // Update footer
            $( api.column( 9 ).footer() ).html(
                '<div class="progress">\
                <div class="progress-bar"  role="progressbar" aria-valuenow="' + pageTotal + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + pageTotal + '%">\
                <span class="sr-only">' + pageTotal + '% Complete</span></div></div>'
            );
        },
        'initComplete': function( settings, json ) {
            $('.dataTables_filter input[type="search"]', $('#studentProgress')).attr('placeholder', view.getI18NString('classroomMonitor_search'));
        },
        'drawCallback': function( settings ) {
            view.redrawFixedHeaders(true);
            
            // bind click actions to workgroup links
            $('.grade-by-student', table).each(function(){
                $(this).off('click').on('click', {thisView:view, workgroupId:$(this).data('workgroupid')}, view.studentRowClicked);
            });
        }
    } );
    
    table.dataTable().fnFilterOnReturn();
    
    this.fixedHeaders.push(new $.fn.dataTable.FixedHeader( table.dataTable() , {
        'offsetTop': 90
    }));
    view.redrawFixedHeaders();
    
    // create view object for future api access
    this.studentProgressTable = table.DataTable();
    
    // add period filter and header text
    this.addSectionHeader(table, $('#studentProgressTable_wrapper'), view.getI18NString('classroomMonitor_studentProgress_title'), { 'periodCol': 4 });
    
    //set the interval to update the time spent values every 10 seconds for students that are online 
    setInterval(this.updateStudentProgressTimeSpentInterval, 10000);
    
    // get annotations and populate scores
    view.retrieveAnnotations('progress');
};

/**
 * Gets student online HTML string for student progress display
 * 
 * @param isOnline Boolean whether workgroup is online or not
 * @returns html online HTML string
 */
View.prototype.getStudentOnlineHtml = function(isOnline){
    var onlineClass = isOnline ? 'fa fa-circle text-success' : 'fa fa-circle',
        onlineText = isOnline ? view.getI18NString('classroomMonitor_studentProgress_workgroupOnline') : view.getI18NString('classroomMonitor_studentProgress_workgroupOffline'),
        onlineHtml = '<span class="' + onlineClass + '"></span><span class="sr-only">' + onlineText + '</span>';
    return onlineHtml;
};

/**
 * The function that is called when a student row is clicked
 * 
 * @param event the click event
 */
View.prototype.studentRowClicked = function(event) {
    var thisView = event.data.thisView;
    
    //get the workgroup id of the row that was clicked
    var workgroupId = event.data.workgroupId;
    
    //call the function to handle the click
    thisView.studentRowClickedHandler(workgroupId);
};

/**
 * Called when a student row is clicked in the classroom monitor
 * 
 * @param workgroupId the workgroup id of the row that was clicked
 */
View.prototype.studentRowClickedHandler = function(workgroupId) {
    // clear monitor view selection
    $('#monitorView > label').removeClass('active');
    
    //hide all the other displays
    this.hideAllDisplays();
    
    //clear the nodeIdClicked and workgroupIdClicked values
    this.clearNodeIdClickedAndWorkgroupIdClicked(); // TODO: remove?
    
    // display a loading message
    $('#loading').show();
    
    //get the url for retrieving student data
    var getStudentDataUrl = this.getConfig().getConfigParam('getStudentDataUrl'),
        runId = this.getConfig().getConfigParam('runId'),
        grading = true,
        getRevisions = true,
    
        //get all the step node ids that are used in the project
        nodeIds = this.getProject().getNodeIds().join(':');
    
    var getStudentDataParams = {
        userId:workgroupId,
        grading:true,
        runId:runId,
        nodeIds:nodeIds,
        getRevisions:true,
        useCachedWork:false
    };
    
    //make the request to retrieve the student data
    this.connectionManager.request('GET', 1, getStudentDataUrl, getStudentDataParams, this.getGradeByStudentWorkInClassroomMonitorCallback, [this, workgroupId], this.getGradeByStudentWorkInClassroomMonitorCallbackFail);
};

/**
 * The success callback when retrieving student work
 * 
 * @param text the student work as text
 * @param xml 
 * @param args 
 */
View.prototype.getGradeByStudentWorkInClassroomMonitorCallback = function(text, xml, args) {
    var thisView = args[0];
    var workgroupId = args[1];
    
    //get the student work and do whatever we need to do with it
    thisView.getGradeByStudentWorkInClassroomMonitorCallbackHandler(workgroupId, text);
};

/**
 * Called when we successfully retrieve the student work
 * 
 * @param text the student work vle state as a JSON string
 */
View.prototype.getGradeByStudentWorkInClassroomMonitorCallbackHandler = function(workgroupId, text) {
    if(text != null) {
        //parse the vle state
        var vleState = VLE_STATE.prototype.parseDataJSONString(text);
        
        if(vleState != null) {
            //add the vle state to our model
            this.model.addWorkByStudent(workgroupId, vleState);
            
            //retrieve the annotations
            this.retrieveAnnotations('student', workgroupId);
        }
    }
};

/**
 * The failure callback when trying to retrieve student work
 */
View.prototype.getGradeByStudentWorkInClassroomMonitorCallbackFail = function(text, xml, args) {
    // TODO: display error message
};

/**
 * An idea basket cell was clicked so we will display the idea basket
 * for the given student
 */
View.prototype.ideaBasketClicked = function(event) {
    var thisView = event.data.thisView;
    var workgroupId = event.data.workgroupId;
    
    //display the idea basket for the student
    thisView.ideaBasketClickedHandler(workgroupId);
};

/**
 * Display the idea basket for the student
 * @param workgroupId the workgroup id for the student
 */
View.prototype.ideaBasketClickedHandler = function(workgroupId) {
    var runId = this.getConfig().getConfigParam('runId');
    
    //get the url for requesting idea baskets
    var getIdeaBasketUrl = this.getConfig().getConfigParam('getIdeaBasketUrl');
    
    //remove any GET parameters from the url since we will be using our own parameters
    getIdeaBasketUrl = getIdeaBasketUrl.substring(0, getIdeaBasketUrl.indexOf('?'));
    
    var getIdeaBasketParams = {
        action:'getIdeaBasket',
        runId:runId,
        workgroupId:workgroupId
    }
    
    //retrieve the student idea basket
    this.connectionManager.request('GET', 1, getIdeaBasketUrl, getIdeaBasketParams, this.getIdeaBasketCallback, [this, workgroupId], this.getIdeaBasketFailCallback);
};

/**
 * Callback for retrieving an idea basket for a student
 */
View.prototype.getIdeaBasketCallback = function(text, xml, args) {
    var thisView = args[0];
    var workgroupId = args[1];
    
    //display the idea basket
    thisView.getIdeaBasketCallbackHandler(workgroupId, text);
};

/**
 * Save the idea basket and then display it
 * @param the workgroup id this idea basket is for
 * @param text the idea basket as a JSON string
 */
View.prototype.getIdeaBasketCallbackHandler = function(workgroupId, text) {
    //parse the JSON string
    var ideaBasketJSONObj = $.parseJSON(text); 
    
    //create an IdeaBasket object
    var ideaBasket = new IdeaBasket(ideaBasketJSONObj);
    
    //save the idea basket
    this.model.setIdeaBasket(workgroupId, ideaBasket);
    
    //display the idea basket for a specific workgroup
    this.showIdeaBasketItem(workgroupId);
};

/**
 * The failure callback for retrieving an idea basket
 */
View.prototype.getIdeaBasketFailCallback = function() {
    
};

/**
 * Display the idea basket for a specific workgroup
 * @param workgroupId the workgroup id of the student to show the idea basket for
 */
View.prototype.showIdeaBasketItem = function(workgroupId) {
    $('#monitorView > label').removeClass('active');
    
    //retrieve the idea basket for the workgroup id
    var ideaBasket = this.model.getIdeaBasket(workgroupId);
    
    //get the idea basket item table
    var ideaBasketItemTable = $('#ideaBasketItemTable');
    
    //get the data table object
    var ideaBasketItemTableDataTable = ideaBasketItemTable.DataTable();
    
    if(ideaBasketItemTableDataTable != null) {
        /*
         * clear the data table in case there is existing data from
         * a previous time we displayed an idea basket item
         */
        ideaBasketItemTableDataTable.clear();
    }
    
    // hide all sections
    this.hideAllDisplays();
    
    // clear the nodeIdClicked and workgroupIdClicked values; TODO: remove/revise
    this.clearNodeIdClickedAndWorkgroupIdClicked();
    
    // filter for currently selected period
    if(this.classroomMonitorPeriodSelected !== null) {
        var period = (this.classroomMonitorPeriodSelected === 'all') ? '' : this.classroomMonitorPeriodSelected;
        $('#ideaBasketItemTable_periodSelect').multiselect('select', period).multiselect('refresh');
        ideaBasketItemTableDataTable
            .column( 1 )
            .search( period )
            .draw();
    }
    
    // show the idea basket item div
    $('#ideaBasketItem').show();
    
    // hide loading message
    $('#loading').hide();
    
    // redraw DataTable fixed headers
    this.redrawFixedHeaders();
    ideaBasketItemTableDataTable.columns.adjust();
    
    if(ideaBasket != null) {
        //the student has an idea basket
        
        //get the student names for this workgroup
        var studentNames = this.userAndClassInfo.getStudentNamesByWorkgroupId(workgroupId);
        
        //get the period name
        var periodName = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId);
        
        var showStudentWorkLink = true;
        var showIdeaBasketLink = false;
        
        //get the project meta data
        var projectMetaData = this.getProjectMetadata();
        
        var ideaAttributes = null;
        
        //get the idea basket attributes
        if(projectMetaData != null) {
            if(projectMetaData.hasOwnProperty('tools')) {
                var tools = projectMetaData.tools;
                
                if(tools.hasOwnProperty('ideaManagerSettings')) {
                    var ideaManagerSettings = tools.ideaManagerSettings;
                    
                    if(ideaManagerSettings.hasOwnProperty('ideaAttributes')) {
                        ideaAttributes = ideaManagerSettings.ideaAttributes;
                    }
                }
            }
        }
        
        //get the student ideas
        var ideas = ideaBasket.ideas;
        
        if(ideas != null) {
            //loop through the ideas newest to oldest
            for(var x=ideas.length - 1; x>=0; x--) {
                //get an idea
                var idea = ideas[x];
                
                if(idea != null) {
                    //get the values of the idea
                    var ideaText = idea.text;
                    var attributes = idea.attributes;
                    var nodeName = idea.nodeName;
                    var timeCreated = idea.timeCreated;
                    var timeLastEdited = idea.timeLastEdited;
                    
                    //get the created on timestamp
                    var timeCreatedFormatted = this.formatTimestamp(timeCreated);
                    
                    //create the object that will be turned into a DataTable row
                    var ideaObject = {
                        "ideaText": ideaText,
                        "stepName": nodeName,
                        "timeCreated": timeCreatedFormatted,
                        "period_name": periodName
                    };
                    
                    if(ideaAttributes == null) {
                        /*
                         * there are no idea basket attributes which means the default
                         * attributes were used in the project
                         */
                        
                        var source = '';
                        var tags = '';
                        var flag = '';

                        //get the source from the idea
                        if(idea.source != null) {
                            source = idea.source;
                        }
                        
                        //get the tags from the idea
                        if(idea.tags != null) {
                            tags = idea.tags;
                        }
                        
                        //get the flag from the idea
                        if(idea.flag != null) {
                            flag = idea.flag;
                        }
                        
                        //set the source, tags, and flag into the object
                        ideaObject.attribute_0 = source;
                        ideaObject.attribute_1 = tags;
                        ideaObject.attribute_2 = flag;
                    } else {
                        //loop through all the idea attributes that are available in the basket
                        for(var y=0; y<ideaAttributes.length; y++) {
                            //get an idea attribute
                            var ideaAttribute = ideaAttributes[y];
                            
                            if(ideaAttribute != null) {
                                //get an attribute id
                                var ideaAttributeId = ideaAttribute.id;
                                
                                //get the attribute value from the idea
                                var ideaAttributeValue = this.getIdeaAttributeValue(idea, ideaAttributeId);
                                
                                if(ideaAttributeValue == null) {
                                    ideaAttributeValue = '';
                                }

                                //set the attribute value into the object
                                ideaObject['attribute_' + y] = ideaAttributeValue;
                            }
                        }
                    }
                    
                    //add the idea object to the DataTable so it will create a row for it
                    ideaBasketItemTableDataTable.row.add(ideaObject);
                }
            }           
        }
        
        //draw the DataTable
        ideaBasketItemTableDataTable.draw();
        
        var periodSelected = this.classroomMonitorPeriodSelected;
        
        // update workgroup select element with workgroups in selected period
        this.populateWorkgroupSelect(periodSelected, 'ideaBasketItemTable', workgroupId);
    }
};

/**
 * Get the attribute value from the idea
 * @param idea the idea to get the attribute value from
 * @param attributeId the attribute id
 * @return the attribute value
 */
View.prototype.getIdeaAttributeValue = function(idea, attributeId) {
    var value = null;
    
    if(idea != null && attributeId != null) {
        //get the attributes from the idea
        var attributes = idea.attributes;
        
        //loop through all the attributes
        for(var x=0; x<attributes.length; x++) {
            //get an attribute
            var attribute = attributes[x];
            
            if(attribute != null) {
                //get an attribute id
                var tempAttributeId = attribute.id;
                
                //check if this is the attribute id we want
                if(attributeId == tempAttributeId) {
                    /*
                     * we have found the attribute id we want so we will obtain the
                     * attribute value
                     */
                    value = attribute.value;
                    break;
                }
            }
        }
    }
    
    return value;
};

/**
 * Display the grade by student display
 * @param workgroupId the workgroup id to display the grade by student display for
 */
View.prototype.displayGradeByStudent = function(workgroupId) {
    var view = this;
    
    // remember the workgroup id the teacher is currently viewing
    this.classroomMonitorWorkgroupIdSelected = workgroupId;
    
    // clear out selected step id
    this.classroomMonitorStepIdSelected = null;
    
    // clear the grade by step table
    this.gradeByStepTable.clear();
    
    // clear the grade by student table
    this.gradeByStudentTable.clear();
    
    //clear the number of items to review because we will count them again for this workgroup
    this.numberOfItemsToReview = 0;
    
    //get the student names for this workgroup
    var studentNames = this.userAndClassInfo.getStudentNamesByWorkgroupId(workgroupId),
    
        //get the period name
        periodName = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId),
        
        //get the period id
        periodId = this.userAndClassInfo.getClassmatePeriodIdByWorkgroupId(workgroupId),
        
        // get the selected period
        periodSelected = this.classroomMonitorPeriodSelected;
    
    // update selected period in grade by student section
    if(periodSelected === 'all'){
        $('#gradeByStudentTable_periodSelect').multiselect('select', '').multiselect('refresh');
    } else {
        $('#gradeByStudentTable_periodSelect').multiselect('select', periodName).multiselect('refresh');
    }
    
    // update workgroup select element with workgroups in selected period
    this.populateWorkgroupSelect(periodSelected, 'gradeByStudentTable', workgroupId);

    var showStudentWorkLink = false,
        showIdeaBasketLink = true;
    
    // get all the node ids. this includes activity and step node ids.
    var nodeIds = this.getProject().getAllNodeIds(),
        position = 0;
    
    // loop through all the node ids
    for(var x=0; x<nodeIds.length; x++) {
        //get a node id
        var nodeId = nodeIds[x];
        
        //skip the master node
        if(nodeId !== 'master') {
            if(nodeId !== null) {
                // add the student work revisions for the current step to the dataset
                view.insertNodeRevisions(nodeId, workgroupId, position, 'studentGrading');
            }           
        }
        position++;
    }
    this.gradeByStudentTable.draw();
    
    // insert the workgroup names and id into grading header
    $('#gradeByStudentNames').text(studentNames.join(', '));
    $('#gradeByStudentWorkgroupId').text(' (' + workgroupId + ')');
    
    // set the number of items to review value
    $('#gradeByStudentItemsToReview').text(view.getI18NStringWithParams('classroomMonitor_grading_itemsToReview',[this.numberOfItemsToReview]));
    this.numberOfItemsToReview > 0 ? $('#gradeByStudentItemsToReview').fadeIn() : $('#gradeByStudentItemsToReview').fadeOut();
    
    // hide loading message
    $('#loading').hide();
    
    // show grade by student section
    this.showGradeByStudentDisplay();
};

/**
 * Creates data entries (rows) for the given node ID and workgroup ID in the grade by student table.
 * One entry for each work revision is created.
 * 
 * @param nodeId String the node id
 * @param workgroupId String the workgroup id
 * @param position Number node or step position (depending on mode)
 * @param mode String specifying grading mode ('studentGrading' or 'stepGrading')
 */
View.prototype.insertNodeRevisions = function(nodeId, workgroupId, position, mode){
    var view = this;
    
    if(nodeId !== null && workgroupId !== null) {
        // get the node
        var node = this.getProject().getNodeById(nodeId);
        
        if(node !== null && node.isLeafNode() && node.hasGradingView()) {
            // get the node type
            var nodeType = node.type,
                // get the step number and title
                nodeTitle = view.getI18NString('stepTerm') + ' ' + this.getProject().getStepNumberAndTitle(nodeId),
                vleState = null,
                nodeVisits = [];
            
            if(mode === 'studentGrading'){
                // get all the work for the student
                vleState = this.model.getWorkByStudent(workgroupId);
            } else if(mode === 'stepGrading'){
                // get all the work for this step for this student
                vleState = this.model.getWorkByStepAndWorkgroupId(nodeId, workgroupId);
            }
            
            // get the student names for this workgroup
            var studentNames = this.userAndClassInfo.getStudentNamesByWorkgroupId(workgroupId);
            studentNames = studentNames.join(', ');
            studentNames += ' (' + workgroupId + ')';

            if(vleState != null) {
                // get all the node visits for this student for this step
                var nodeVisits = vleState.getNodeVisitsWithWorkByNodeId(nodeId),
                    i = nodeVisits.length,
                    isLatest = true;
                
                // create feedback cell and form
                var $feedbackCell = $('<td>'),
                    $feedbackForm = $('<form role="form" class="feedback-form">');
                $feedbackCell.append($feedbackForm);
                
                // create score group
                var score = null,
                    // get the max score for the node
                    maxScore = view.getMaxScoreValueByNodeId(nodeId),
                    $scoreGroup = $('<div class="form-group">'),
                    $scoreLabel = $('<label>' + view.getI18NString('classroomMonitor_grading_teacherScore') + ' </label>'),
                    // create score input
                    $scoreInput = $('<input>').attr('type', 'text').attr('maxlength', 6).addClass('score form-control');
                $scoreLabel.append($scoreInput);
                $scoreLabel.append('<span class="max-score"> / ' + maxScore + '</span>');
                $scoreGroup.append($('<div class="form-inline">').append($scoreLabel));
                $feedbackForm.append($scoreGroup);
                
                // create the comment textarea
                var $commentTextArea = $('<textarea>').addClass('form-control comment');
                $commentTextArea.attr('rows', 3);
                
                // insert comment form group
                var $commentGroup = $('<div class="form-group">'),
                    $commentLabel = $('<label>' + view.getI18NString('classroomMonitor_grading_teacherComment') + '</label>');
                $commentGroup.append($commentLabel);
                // insert premade comments link
                //var $premadeCommentsLink = $('<a class="open-comments pull-right" href="javascript:void(0);">' + view.getI18NString('classroomMonitor_grading_addPremadeComments') + ' <span class="fa fa-comments"></span></a>');
                //$commentGroup.append($premadeCommentsLink);
                $commentGroup.append($commentTextArea);
                $feedbackForm.append($commentGroup);
                
                // insert comment footer (timestamp)
                var $feedbackTimestamp = $('<div class="timestamp"><span class="fa fa-clock-o"></span>&nbsp;</div>'),
                    $feedbackText = $('<span class="feedback-date">');
                $feedbackText.text(view.getI18NString('classroomMonitor_grading_lastAnnotation_none'));
                $feedbackTimestamp.append($feedbackText);
                $feedbackCell.append($feedbackTimestamp);
                
                if(i===0){
                    // student has no submitted work for this step, so create a row with empty response
                    var $stepWork = $('<tr>').addClass('no-work');
                    
                    var rowId = '';
                    
                    if(mode === 'studentGrading') {
                        rowId = 'noStudentWorkStudentGradingRow_' + nodeId + '_' + workgroupId;
                    } else if(mode === 'stepGrading') {
                        rowId = 'noStudentWorkStepGradingRow_' + nodeId + '_' + workgroupId;
                    }
                    
                    $stepWork.attr('id', rowId);
                    $stepWork.append($('<td>').text(position));
                    if(mode === 'studentGrading'){
                        $stepWork.append($('<td>').text(nodeId));
                        $stepWork.append($('<td>').text(nodeTitle));
                    } else if(mode === 'stepGrading') {
                        $stepWork.append($('<td>').text(workgroupId));
                        $stepWork.append($('<td>').text(studentNames));
                    }
                    $stepWork.append('<td>');
                    $stepWork.append('<td>');
                    $stepWork.append('<td>');
                    $stepWork.append('<td>');
                    $stepWork.append('<td>');
                    $stepWork.append($('<td>').html('<div class="stepwork-empty">' + view.getI18NString('classroomMonitor_grading_noResponse') + '</div>'));
                    $stepWork.append($feedbackCell);
                    $stepWork.append($('<td>').text('false'));
                    $stepWork.append($('<td>').text('false'));
                    $stepWork.append($('<td>').text('false'));
                    
                    $thisFeedbackCell = $feedbackCell;
                    
                    //get the latest score annotation if any
                    var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
                    var latestScore = null;
                    var scorePostTime = null;
                    
                    if(latestScoreAnnotation !== null) {
                        // get the latest score
                        latestScore = latestScoreAnnotation.value;
                        
                        // get the post time for the score
                        scorePostTime = latestScoreAnnotation.postTime;
                        
                        // set the latest score into the score input
                        $('input[type=text]', $thisFeedbackCell).val(latestScore);
                    }
                    
                    var scoreInputId = '';
                    
                    if(mode === 'studentGrading') {
                        scoreInputId = 'noStudentWorkStudentGradingScoreInput_' + nodeId + '_' + workgroupId;
                    } else if(mode === 'stepGrading') {
                        scoreInputId = 'noStudentWorkStepGradingScoreInput_' + nodeId + '_' + workgroupId;
                    }
                    
                    // set the events for when the score input value is updated
                    $('input[type=text]', $thisFeedbackCell).attr('id', scoreInputId);
                    $('input[type=text]', $thisFeedbackCell).on('input', {thisView:view, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId, mode:mode}, view.scoreChanged);
                    $('input[type=text]', $thisFeedbackCell).on('change', {thisView:view, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId, mode:mode}, view.saveScore);
                    $('input[type=text]', $thisFeedbackCell).on('keypress', function(e){
                        if(e.keyCode === 13){
                            e.preventDefault();
                            $(this).blur();
                        }
                    });
                    
                    //get the latest comment annotation if any
                    var latestCommentAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'comment');
                    var latestComment = null;
                    var commentPostTime = null;
                    
                    if(latestCommentAnnotation !== null) {
                        // get the latest comment
                        latestComment = latestCommentAnnotation.value;
                        
                        // get the post time for the comment
                        commentPostTime = latestCommentAnnotation.postTime;

                        // set the latest comment into the comment text area
                        if(latestComment !== null){
                            $('textarea', $thisFeedbackCell).val(latestComment);
                        }
                    }
                    
                    var commentTextAreaId = '';
                    
                    if(mode === 'studentGrading') {
                        commentTextAreaId = 'noStudentWorkStudentGradingCommentTextArea_' + nodeId + '_' + workgroupId;
                    } else if(mode === 'stepGrading') {
                        commentTextAreaId = 'noStudentWorkStepGradingCommentTextArea_' + nodeId + '_' + workgroupId;
                    }
                    
                    //set the event for when anything is changed in the comment textarea
                    $('textarea', $thisFeedbackCell).attr('id', commentTextAreaId);
                    $('textarea', $thisFeedbackCell).on('input', {thisView:view, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId, mode:mode}, view.commentChanged);
                    $('textarea', $thisFeedbackCell).on('change', {thisView:view, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId, mode:mode}, view.saveComment);
                    
                    // get the latest timestamp between the score and comment
                    var annotationPostTime = Math.max(scorePostTime, commentPostTime);
                    
                    if(annotationPostTime !== 0) {
                        // create the annotation post time
                        var annotationPostTimeFormatted = this.formatTimestamp(annotationPostTime);
                        $('.feedback-date', $thisFeedbackCell).text(view.getI18NStringWithParams('classroomMonitor_grading_lastAnnotation', [annotationPostTimeFormatted]));
                    }
                    
                    //show the premade comments link
                    //$premadeCommentsLink.show();
                    
                    // bind premade comments link click
                    /*$premadeCommentsLink.on('click', {thisView:this, nodeId:nodeId, workgroupId:workgroupId}, function(event) {
                        var thisView = event.data.thisView;
                        var nodeId = event.data.nodeId;
                        var workgroupId = event.data.workgroupId;
                        var commentBoxId = 'noStudentWorkScoreInput_' + nodeId + '_' + workgroupId;
                        var studentWorkColumnId = 'noStudentWorkRow_' + nodeId + '_' + workgroupId;
                        
                        // the open premade comments link was clicked so we will open up the premade comments window
                        thisView.openPremadeCommentsLinkClicked(commentBoxId, studentWorkColumnId);
                    });*/
                    
                    // add row to DataTable
                    if(mode === 'studentGrading'){
                        this.gradeByStudentTable.row.add($stepWork[0]);
                    } else if(mode === 'stepGrading'){
                        this.gradeByStepTable.row.add($stepWork[0]);
                    }
                }
                
                //loop through all the node visits from newest to oldest
                while(i--){
                    var nodeVisit = nodeVisits[i];
                    if(nodeVisit) {
                        // create row element
                        var $stepWork = $('<tr>'),
                            $thisFeedbackCell = $feedbackCell.clone();
                        
                        if(mode === 'studentGrading'){
                            $stepWork.attr('data-stepname', nodeTitle);
                        } else if(mode === 'stepGrading'){
                            $stepWork.attr('data-workgroup', studentNames);
                        }
                        
                        // get the step work id
                        var stepWorkId = nodeVisit.id;
                        var rowId = '';
                        
                        if(mode === 'studentGrading'){
                            rowId = 'studentGradingStepWork_' + stepWorkId;
                        } else if(mode === 'stepGrading'){
                            rowId = 'stepGradingStepWork_' + stepWorkId;
                        }
                        
                        $stepWork.attr('id', rowId)
                        // get the post time
                        visitPostTime = nodeVisit.visitPostTime,
                        isNew = false,
                        isFlagged = false;
                        
                        if(mode === 'studentGrading'){
                            $stepWork.append('<td>' + position + '</td><td>' + nodeId + '</td><td>' + nodeTitle + '</td>\
                                    <td>' + stepWorkId + '</td><td>' + visitPostTime + '</td>');
                        } else if(mode === 'stepGrading'){
                            $stepWork.append('<td>' + position + '</td><td>' + workgroupId + '</td><td>' + studentNames + '</td>\
                                    <td>' + stepWorkId + '</td><td>' + visitPostTime + '</td>');
                        }
                        
                        //get the auto graded annotation that has an autoScore for the step work id
                        var autoGradedAutoScoreAnnotation = this.model.annotations.getAnnotationByStepWorkIdTypeField(stepWorkId, 'autoGraded', 'autoScore');

                        // get the score annotation for the step work
                        var scoreAnnotation = this.model.annotations.getAnnotationByStepWorkIdType(stepWorkId, 'score'),
                            needsReview = isLatest ? true : false,
                            latestScore = null,
                            scorePostTime = null;
                        
                        if(scoreAnnotation !== null){
                            //there is a teacher score annotation for the student work
                            
                            // get the score
                            score = scoreAnnotation.value;
                            // get the post time for the score
                            scorePostTime = scoreAnnotation.postTime;
                            if(score !== null){
                                // set the score into the score input
                                $('input[type=text]', $thisFeedbackCell).val(score);
                                needsReview = false;
                            }
                        } else if(autoGradedAutoScoreAnnotation != null) {
                            //there is an auto graded score for the student work

                            //get the annotation value from the auto graded annotation
                            var autoGradedAutoScoreAnnotationValue = this.getLatestAnnotationValueFromValueArray(autoGradedAutoScoreAnnotation, 'autoScore');
                            
                            if(autoGradedAutoScoreAnnotationValue != null) {
                                //get the auto score
                                score = autoGradedAutoScoreAnnotationValue.autoScore;
                                
                                //get the auto graded timestamp
                                scorePostTime = autoGradedAutoScoreAnnotation.postTime;
                                
                                //set the score
                                $('input[type=text]', $thisFeedbackCell).val(score);                                
                            }
                        } else if (isLatest) {
                            /*
                             * this is the latest work for this step and the teacher has
                             * not scored this specific work and the student work was not
                             * auto graded so we will display the latest teacher score or
                             * latest auto graded score from the latest previous work 
                             * for this step that does have a score
                             */
                            
                            //get the latest teacher score from any of the previous student work for this step
                            var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
                            
                            //get the latest auto graded annotation that has an autoScore from any of the previous student work for this step
                            var latestAutoGradedAutoScoreAnnotation = this.getLatestAnnotationWithField(nodeId, workgroupId, [-1], 'autoGraded', 'autoScore');
                            
                            if(latestScoreAnnotation == null && latestAutoGradedAutoScoreAnnotation == null) {
                                /*
                                 * there is no previous teacher score annotation or autoGraded annotation with an autoScore
                                 * so we won't do anything
                                 */
                            } else if(latestScoreAnnotation != null && latestAutoGradedAutoScoreAnnotation == null) {
                                //we have a previous teacher score but no previous auto graded score

                                //get the score from the latest teacher score annotation
                                latestScore = latestScoreAnnotation.value;
                                
                                //get the post time from the latest teacher score annotation
                                scorePostTime = latestScoreAnnotation.postTime;
                            } else if(latestScoreAnnotation == null && latestAutoGradedAutoScoreAnnotation != null) {
                                //we have a previous auto graded score but no previous teacher score
                                
                                //get the latest value that has an autoScore from the latest auto graded annotation
                                var autoGradedAnnotationValue = this.getLatestAnnotationValueFromValueArray(latestAutoGradedAutoScoreAnnotation, 'autoScore');
                                
                                if(autoGradedAnnotationValue != null) {
                                    //get the auto score from the latest autoGraded annotation
                                    latestScore = autoGradedAnnotationValue.autoScore;
                                    
                                    //get the post time from the latest autoGraded annotation
                                    scorePostTime = latestAutoGradedAutoScoreAnnotation.postTime;                                   
                                }
                            } else if(latestScoreAnnotation != null && latestAutoGradedAutoScoreAnnotation != null) {
                                //we have a previous auto graded score and a previous teacher score
                                
                                //get the post times for the latest teacher score annotation and the latest autoGraded annotation that has an autoScore
                                var latestScoreAnnotationPostTime = latestScoreAnnotation.postTime;
                                var latestAutoGradedAnnotationPostTime = latestAutoGradedAutoScoreAnnotation.postTime;
                                
                                if(latestScoreAnnotationPostTime > latestAutoGradedAnnotationPostTime) {
                                    //the teacher score is newer so we will use that
                                    
                                    //get the score from the latest teacher score annotation
                                    latestScore = latestScoreAnnotation.value;
                                    
                                    //get the post time from the latest teacher score annotation
                                    scorePostTime = latestScoreAnnotation.postTime;
                                } else {
                                    //the auto graded score is newer so we will use that
                                    
                                    //get the autoScore value from the latest auto graded annotation
                                    var autoGradedAnnotationValue = this.getLatestAnnotationValueFromValueArray(latestAutoGradedAutoScoreAnnotation, 'autoScore');
                                    
                                    if(autoGradedAnnotationValue != null) {
                                        //get the auto score from the latest autoGraded annotation
                                        latestScore = autoGradedAnnotationValue.autoScore;
                                        
                                        //get the post time from the latest autoGraded annotation
                                        scorePostTime = latestAutoGradedAutoScoreAnnotation.postTime;                                   
                                    }
                                }
                            }
                            
                            if(latestScore !== null) {
                                //set the latest score into the score input
                                $('input[type=text]', $thisFeedbackCell).val(latestScore);
                            }
                        }
                        
                        var scoreInputId = '';
                        
                        if(mode === 'studentGrading') {
                            scoreInputId = 'studentGradingScoreInput_' + stepWorkId;
                        } else if(mode === 'stepGrading') {
                            scoreInputId = 'stepGradingScoreInput_' + stepWorkId;
                        }
                        
                        // set the events for when the score input value is updated
                        $('input[type=text]', $thisFeedbackCell).attr('id', scoreInputId);
                        $('input[type=text]', $thisFeedbackCell).on('input', {thisView:view, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId, mode:mode}, view.scoreChanged);
                        $('input[type=text]', $thisFeedbackCell).on('change', {thisView:view, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId, mode:mode}, view.saveScore);
                        $('input[type=text]', $thisFeedbackCell).on('keypress', function(e){
                            if(e.keyCode === 13){
                                e.preventDefault();
                                $(this).blur();
                            }
                        });
                        
                        // add max score, and step work score, and latest score to table
                        $stepWork.append('<td>' + score + '</td>');
                        $stepWork.append('<td>' + maxScore + '</td>');
                        $stepWork.append('<td>' + latestScore + '</td>');
                        
                        // create student work cell
                        var $studentWorkCell = $('<td class="container">'),
                            headerText = isLatest ? view.getI18NString('classroomMonitor_grading_latestWork') : view.getI18NStringWithParams('classroomMonitor_grading_workRevision', [i+1]);
                        
                        // add student work cell header
                        $studentWorkHeader = $('<div class="stepwork-header"><b class="text-danger">' + headerText + '</b></div>');
                        // create the flag check box
                        var $flagCheckBox = $('<input>').addClass('flag');
                        $flagCheckBox.attr('type', 'checkbox');
                        
                        // insert flag form group
                        var $flagGroup = $('<div class="pull-right text-info">'),
                            $flagLabel = $('<label for=""><span class="fa fa-flag"></span> ' + view.getI18NString('classroomMonitor_grading_flag') + '&nbsp;</label> ');
                        $flagGroup.append($flagLabel);
                        $flagGroup.append($flagCheckBox);
                        $studentWorkHeader.append($flagGroup);
                        
                        var flagInputId = '';
                        
                        if(mode === 'studentGrading') {
                            flagInputId = 'studentGradingFlagInput_' + stepWorkId;
                        } else if(mode === 'stepGrading') {
                            flagInputId = 'stepGradingFlagInput_' + stepWorkId;
                        }
                        
                        $flagCheckBox.attr('id', flagInputId);
                        $flagCheckBox.on('click', {thisView:view, nodeId:nodeId, workgroupId:workgroupId, stepWorkId:stepWorkId}, function(event) {
                            var thisView = event.data.thisView,
                                stepWorkId = event.data.stepWorkId,
                                nodeId = event.data.nodeId,
                                workgroupId = event.data.workgroupId;
                            
                            // the flag check box was clicked so we will save the flag annotation
                            thisView.flagCheckBoxClicked(nodeId, workgroupId, stepWorkId, mode);
                        });
                        
                        // get the flag annotation for this step work
                        var flagAnnotation = this.model.annotations.getAnnotationByStepWorkIdType(stepWorkId, 'flag');
                        
                        if(flagAnnotation != null) {
                            // get the flag value
                            var flag = flagAnnotation.value;
                            
                            if(flag === 'flagged') {
                                isFlagged = true;
                                // check the check box
                                $flagCheckBox.prop('checked', true);
                            }
                        }
                        
                        // set flag label 'for' attribute
                        $flagLabel.attr('for', $flagCheckBox.attr('id'));
                        
                        $studentWorkCell.append($studentWorkHeader);
                        
                        if(nodeType != 'FlashNode') {
                            // create student response container
                            var $studentWorkContainer = $('<div id="stepWork_' + stepWorkId + '" class="stepwork">');
                            try {
                                // render the student work into the response container
                                node.renderGradingView($studentWorkContainer, nodeVisit, null, workgroupId);
                            } catch(e) {
                                console.log(e);
                            }
                            $studentWorkCell.append($studentWorkContainer);
                        }
                        
                        // create student response cell footer (timestamp)
                        $workTimestamp = $('<div class="timestamp">').append('<span class="fa fa-clock-o"></span>');
                        
                        if(visitPostTime != null) {
                            // format the timestamp for the student work
                            var visitPostTimeFormatted = this.formatTimestamp(visitPostTime);
                            $workTimestamp.append(' ' + view.getI18NStringWithParams('classroomMonitor_grading_revisionDate', [visitPostTimeFormatted]));
                        }
                        $studentWorkCell.append($workTimestamp);
                        
                        // insert student response into table
                        $stepWork.append($studentWorkCell);
                        
                        // insert feedback cell into table
                        $stepWork.append($thisFeedbackCell);
                        
                        var commentTextAreaId = '';
                        
                        if(mode === 'studentGrading') {
                            commentTextAreaId = 'studentGradingCommentTextArea_' + stepWorkId;
                        } else if(mode === 'stepGrading') {
                            commentTextAreaId = 'stepGradingCommentTextArea_' + stepWorkId;
                        }
                        
                        // set comment textarea id
                        $('textarea', $thisFeedbackCell).attr('id', commentTextAreaId);
                        
                        // get the comment annotation for this student work
                        var commentAnnotation = this.model.annotations.getAnnotationByStepWorkIdType(stepWorkId, 'comment');
                            comment = null,
                            commentPostTime = null;
                            
                        //get the auto graded annotation that has an autoFeedback for the step work id
                        var autoGradedAutoFeedbackAnnotation = this.model.annotations.getAnnotationByStepWorkIdTypeField(stepWorkId, 'autoGraded', 'autoFeedback');
                        
                        if(commentAnnotation !== null) {
                            //get the comment
                            comment = commentAnnotation.value;
                            // get the post time for the comment
                            commentPostTime = commentAnnotation.postTime;
                            if(comment !== null){
                                needsReview = false;
                            }
                        } else if(autoGradedAutoFeedbackAnnotation != null) {
                            //there is an auto graded feedback for the student work

                            //get the annotation value from the auto graded annotation
                            var autoGradedAutoFeedbackAnnotationValue = this.getLatestAnnotationValueFromValueArray(autoGradedAutoFeedbackAnnotation, 'autoFeedback');
                            
                            if(autoGradedAutoFeedbackAnnotationValue != null) {
                                //get the auto feedback
                                comment = autoGradedAutoFeedbackAnnotationValue.autoFeedback;
                                
                                //get the auto graded timestamp
                                commentPostTime = autoGradedAutoFeedbackAnnotation.postTime;
                            }
                        } else {
                            if(isLatest){
                                /*
                                 * this is the latest work for this step and the teacher has
                                 * not commented on this specific work and the student work was not
                                 * auto graded so we will display the latest teacher comment or
                                 * latest auto graded feedback from the latest previous work 
                                 * for this step that does have a comment/feedback
                                 */

                                //get the latest teacher comment from any of the previous student work for this step
                                var latestCommentAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'comment');
                                
                                //get the latest auto graded annotation that has autoFeedback from any of the previous student work for this step
                                var latestAutoGradedAutoFeedbackAnnotation = this.getLatestAnnotationWithField(nodeId, workgroupId, [-1], 'autoGraded', 'autoFeedback');
                                
                                if(latestCommentAnnotation == null && latestAutoGradedAutoFeedbackAnnotation == null) {
                                    /*
                                     * there is no teacher feedback annotation or autoGraded annotation
                                     * so we won't do anything
                                     */
                                } else if(latestCommentAnnotation != null && latestAutoGradedAutoFeedbackAnnotation == null) {
                                    //we have a previous teacher comment but no previous auto graded comment

                                    //get the comment from the latest teacher comment annotation
                                    comment = latestCommentAnnotation.value;
                                    
                                    //get the post time from the latest teacher comment annotation
                                    commentPostTime = latestCommentAnnotation.postTime;
                                } else if(latestCommentAnnotation == null && latestAutoGradedAutoFeedbackAnnotation != null) {
                                    //we have a previous auto graded feedback but no previous teacher comment
                                    
                                    //get the latest value from the latest auto graded annotation
                                    var autoGradedAnnotationValue = this.getLatestAnnotationValueFromValueArray(latestAutoGradedAutoFeedbackAnnotation, 'autoFeedback');
                                    
                                    if(autoGradedAnnotationValue != null) {
                                        //get the auto feedback from the latest autoGraded annotation
                                        comment = autoGradedAnnotationValue.autoFeedback;
                                        
                                        //get the post time from the latest autoGraded annotation
                                        commentPostTime = latestAutoGradedAutoFeedbackAnnotation.postTime;                                  
                                    }
                                } else if(latestCommentAnnotation != null && latestAutoGradedAutoFeedbackAnnotation != null) {
                                    //we have a previous auto graded feedback and a previous teacher comment
                                    
                                    //get the post times for the latest teacher comment annotation and the latest autoGraded annotation that has autoFeedback
                                    var latestCommentAnnotationPostTime = latestCommentAnnotation.postTime;
                                    var latestAutoGradedAnnotationPostTime = latestAutoGradedAutoFeedbackAnnotation.postTime;
                                    
                                    if(latestCommentAnnotationPostTime > latestAutoGradedAnnotationPostTime) {
                                        //the teacher comment is newer so we will use that
                                        
                                        //get the comment from the latest teacher comment annotation
                                        comment = latestCommentAnnotation.value;
                                        
                                        //get the post time from the latest teacher comment annotation
                                        commentPostTime = latestCommentAnnotation.postTime;
                                    } else {
                                        //the auto graded feedback is newer so we will use that
                                        
                                        //get the autoFeedback value from the latest auto graded annotation
                                        var autoGradedAnnotationValue = this.getLatestAnnotationValueFromValueArray(latestAutoGradedAutoFeedbackAnnotation, 'autoFeedback');
                                        
                                        if(autoGradedAnnotationValue != null) {
                                            //get the auto feedback from the latest autoGraded annotation
                                            comment = autoGradedAnnotationValue.autoFeedback;
                                            
                                            //get the post time from the latest autoGraded annotation
                                            commentPostTime = latestAutoGradedAutoFeedbackAnnotation.postTime;                                  
                                        }
                                    }
                                }
                            }
                        }
                        
                        // set the comment into the textarea
                        if(comment !== null){
                            $('textarea', $thisFeedbackCell).val(comment);
                        }
                        
                        // set the event for when the textarea value is updated
                        //set the event for when anything is changed in the comment textarea
                        $('textarea', $thisFeedbackCell).on('input', {thisView:view, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId, mode:mode}, view.commentChanged);
                        $('textarea', $thisFeedbackCell).on('change', {thisView:view, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId, mode:mode}, view.saveComment);
                        
                        // insert comment input 'for' attribute
                        $commentLabel.attr('for', $('textarea', $thisFeedbackCell).attr('id'));
                        
                        // bind premade comments link click
                        $('.open-comments', $thisFeedbackCell).on('click', {thisView:this, stepWorkId:stepWorkId}, function(event) {
                            var thisView = event.data.thisView;
                            var stepWorkId = event.data.stepWorkId;
                            var commentBoxId = 'commentTextArea_' + stepWorkId;
                            var studentWorkColumnId = 'stepWorkTD_' + stepWorkId;
                            
                            // the open premade comments link was clicked so we will open up the premade comments window
                            thisView.openPremadeCommentsLinkClicked(commentBoxId, studentWorkColumnId);
                        });
                        
                        // get the latest timestamp between the score and comment
                        var annotationPostTime = Math.max(scorePostTime, commentPostTime);
                        
                        if(annotationPostTime !== 0) {
                            // create the annotation post time
                            var annotationPostTimeFormatted = this.formatTimestamp(annotationPostTime);
                            $('.feedback-date', $thisFeedbackCell).text(view.getI18NStringWithParams('classroomMonitor_grading_lastAnnotation', [annotationPostTimeFormatted]));
                        }
                        
                        if(isLatest){
                            if(needsReview){
                                // add needs review class to row
                                $stepWork.addClass('new');
                                
                                // increment number of items to review
                                view.numberOfItemsToReview++;
                            }
                        } else {
                            // add revision class to row
                            $stepWork.addClass('revision');
                            
                            //disable the score input if this is not the latest revision
                            $('input[type=text]', $thisFeedbackCell).attr('disabled', 'disabled');
                            
                            //disable the comment textarea if this is not the latest revision
                            $('textarea', $thisFeedbackCell).attr('disabled', 'disabled');
                        }
                        
                        // insert flagged, latest and needs review cells
                        $stepWork.append('<td>' + isFlagged + '</td>');
                        $stepWork.append('<td>' + isLatest + '</td>');
                        $stepWork.append('<td>' + needsReview + '</td>');
                        
                        // add row to DataTable
                        if(mode === 'studentGrading'){
                            this.gradeByStudentTable.row.add($stepWork[0]);
                            
                            if(nodeType == 'FlashNode') {
                                this.gradeByStudentTable.draw();                                
                            }
                        } else if(mode === 'stepGrading'){
                            this.gradeByStepTable.row.add($stepWork[0]);
                            
                            if(nodeType == 'FlashNode') {
                                this.gradeByStepTable.draw();                               
                            }
                        }
                        
                        if(nodeType == 'FlashNode') {
                            // create student response container
                            var $studentWorkContainer = $('<div id="stepWork_' + stepWorkId + '" class="stepwork">');
                            $studentWorkCell.append($studentWorkContainer);
                            
                            try {
                                // render the student work into the response container
                                node.renderGradingView($studentWorkContainer, nodeVisit, null, workgroupId);
                            } catch(e) {
                                console.log(e);
                            }
                        }
                        
                        // set latest to false for all but first item
                        isLatest = false;
                    }
                }
            }
        }
    }
};

/**
 * Populates the workgroup select in the student grading view with workgroups in the specified period
 * 
 * @param period String period id
 * @param tableId String id of the target table
 * @param workgroupId String id of the workgroup to select (optional)
 */
View.prototype.populateWorkgroupSelect = function(period, tableId, workgroupId){
    var workgroups = [],
        periods = this.getUserAndClassInfo().getPeriods(),
        periodId = period;
    
    var i = periods.length;
    while(i--){
        if(periods[i].periodName === period){
            periodId = periods[i].periodId;
            break;
        }
    }
    
    // get all the workgroup ids in the period
    workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder(periodId);

    // loop through all the workgroup ids in the period
    for(var x=0; x<workgroupIds.length; x++) {
        //get a workgroup id
        var groupId = workgroupIds[x];
        
        //get the classmate names for the workroup id
        var groupNames = this.getUserAndClassInfo().getStudentNamesByWorkgroupId(groupId).join(', ');
        
        workgroups.push({ label: groupNames, value: groupId });
    }
    $('#' + tableId + '_workgroupSelect').multiselect('dataprovider', workgroups).multiselect('rebuild');
    
    if(workgroupId !== null){
        $('#' + tableId + '_workgroupSelect').multiselect('select', workgroupId).multiselect('rebuild');
    }
};

/**
 * Create a row for the grade by student table. Each row contains the row that
 * displays the step title, student work and teacher comment/score header and
 * all the student revisions for the step.
 * @param nodeId the node id
 * @param workgroup id the workgroup id
 * 
 * TODO: remove
 */
View.prototype.createGradeByStudentDisplayTableRow = function(nodeId, workgroupId) {
    var gradeByStudentDisplayTableRow = null;
    
    if(nodeId != null && workgroupId != null) {
        //create the row
        gradeByStudentDisplayTableRow = $('<tr>').attr('id', 'gradeByStudentDisplayTableRow_' + nodeId);

        //create a table to display all the student work revisions for this node
        var nodeTable = $('<table>');
        nodeTable.attr('id', 'nodeTable_' + nodeId);
        nodeTable.attr('border', '1px');
        nodeTable.attr('cellpadding', '3px');
        nodeTable.css('border-collapse', 'collapse');
        nodeTable.css('width', '100%');
        nodeTable.css('border-width', '2px');
        nodeTable.css('border-style', 'solid');
        nodeTable.css('border-color', 'black');
        
        //get the node
        var node = this.getProject().getNodeById(nodeId);
        
        if(node != null) {
            //get the node type
            var nodeType = node.type;
            
            //get all the work for the student
            var vleState = this.model.getWorkByStudent(workgroupId);
            
            //get the step number and title
            var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
            
            var stepTitle = '';
            
            //we will not display number of students on step or completion percentage for sequences 
            if(nodeType == 'sequence') {
                //the node is an activity
                var nodePrefix = 'Activity';
                
                //create the step title
                stepTitle = nodePrefix + ' ' + stepNumberAndTitle;
            } else {
                //the node is a step
                var nodePrefix = 'Step';
                
                //create the step title
                stepTitle = nodePrefix + ' ' + stepNumberAndTitle + ' (' + nodeType + ')';
                
            }
            
            //create the row that will display the step title
            var stepTitleTR = $('<tr>');
            
            //create the table data that will display the step title
            var stepTitleTD = $('<td>');
            stepTitleTD.attr('colspan', 2);
            
            //create the div to display the step title
            var stepTitleDiv = $('<div>');
            stepTitleDiv.css('float', 'left');
            stepTitleDiv.css('font-weight', 'bold');
            
            //create the p that will display the step title
            var stepTitleP = $('<p>');
            stepTitleP.css('display', 'inline');
            stepTitleP.text(stepTitle + ' ');
            stepTitleDiv.append(stepTitleP);
            
            if(nodeType != 'sequence') {
                //create a show prompt link for steps
                var showPromptLink = $('<a>');
                showPromptLink.text('Show Prompt');
                showPromptLink.attr('id', 'showPromptLink_' + nodeId);
                showPromptLink.css('text-decoration', 'underline');
                showPromptLink.css('color', 'blue');
                showPromptLink.css('cursor', 'pointer');
                showPromptLink.click({thisView:this, nodeId:nodeId}, this.showPromptClicked);
                stepTitleDiv.append(showPromptLink);
            }

            //add the step title div to the step title cell
            stepTitleTD.append(stepTitleDiv);
            
            //add the step title table data to the row
            stepTitleTR.append(stepTitleTD);
            
            //add the row to the table
            nodeTable.append(stepTitleTR);
            
            if(nodeType != 'sequence') {
                if(node != null && node.isLeafNode() && node.hasGradingView()) {
                    /*
                     * this is a gradable step so we will make it clickable. clicking on the
                     * step title will bring the use to the grade by step view for that step.
                     */
                    
                    stepTitleP.css('cursor', 'pointer');
                    
                    //highlight the step title yellow on mouse over
                    stepTitleP.mouseenter({thisView:this}, function(event) {
                        var thisView = event.data.thisView;
                        thisView.highlightYellow(this);
                    });
                    
                    //remove the highlight from the step title when mouse exits
                    stepTitleP.mouseleave({thisView:this}, function(event) {
                        var thisView = event.data.thisView;
                        thisView.removeHighlight(this);
                    });
                    
                    var stepRowClickedParams = {
                        thisView:this,
                        nodeId:nodeId
                    }

                    //display the grade by step view for the step that was clicked
                    stepTitleP.click(stepRowClickedParams, this.stepRowClicked);
                }
            }
            
            if(nodeType != 'sequence') {
                //the node is a step
                
                //create the row that will display the step prompt
                var gradeByStudentPromptTR = $('<tr>');
                gradeByStudentPromptTR.attr('id', 'stepPromptTR_' + nodeId);
                
                //get the step prompt
                var prompt = this.getProject().getNodeById(nodeId).getPrompt();
                
                //create the cell that will display the step prompt
                var gradeByStudentPromptTD = $('<td>');
                gradeByStudentPromptTD.attr('colspan', 2);
                gradeByStudentPromptTD.html(prompt);
                
                //add the cell to the row and hide it for now
                gradeByStudentPromptTR.append(gradeByStudentPromptTD);
                gradeByStudentPromptTR.css('display', 'none');
                
                //add the row to the node table
                nodeTable.append(gradeByStudentPromptTR);
                
                //create the grading header row which contains the "Student Work" and "Teacher Comment/Score" tds
                var stepHeaderTR = this.createGradingHeaderRow();
                
                //add the row to the table
                nodeTable.append(stepHeaderTR);
            }
            
            if(vleState != null) {
                //get all the node visits for this student for this step
                var nodeVisits = vleState.getNodeVisitsWithWorkByNodeId(nodeId);
                
                //create the rows that will display all the student work revisions for this step
                this.createRowsForNodeVisits(nodeId, workgroupId, nodeTable, nodeVisits);
            }
            
            //add the step table to the step row
            gradeByStudentDisplayTableRow.append(nodeTable);
        }
    }
    
    return gradeByStudentDisplayTableRow;
};

/**
 * Create the row that will display the "Student Work" and "Teacher Comment/Score" text
 */
View.prototype.createGradingHeaderRow = function() {
    //create the row
    var stepHeaderTR = $('<tr>');
    
    //create the td that will display "Student Work"
    studentWorkTD = $('<td>');
    studentWorkTD.html('Student Work');
    studentWorkTD.attr('width', '70%');
    
    //create the td that will display "Teacher Comment/Score"
    teacherCommentScoreTD = $('<td>');
    teacherCommentScoreTD.html('Teacher Comment/Score');
    teacherCommentScoreTD.attr('width', '30%');
    
    //add the tds to the row
    stepHeaderTR.append(studentWorkTD);
    stepHeaderTR.append(teacherCommentScoreTD);
    
    return stepHeaderTR;
};

/**
 * Create the rows to display the node visits
 * @param nodeId the step the work is for
 * @param workgroupId the workgroup id
 * @param parentTable the table the rows will be added to
 * @param nodeVisits the node visits
 */
View.prototype.createRowsForNodeVisits = function(nodeId, workgroupId, parentTable, nodeVisits) {
    /*
     * boolean to keep track of whether we are on the first revision or not.
     * we will only display the score and comment grading for the first revision
     * that we display.
     */
    var isFirstRevision = true;
    
    //get the node
    var node = this.getProject().getNodeById(nodeId);
    
    if(node != null && node.type != 'sequence' && node.hasGradingView() && nodeVisits.length == 0) {
        //this is a gradable step but there is no student work
        
        //create the DOM ids
        var stepWorkTRId = 'noStudentWorkStepWorkTR_' + nodeId + '_' + workgroupId;
        var stepWorkTDId = 'noStudentWorkStepWorkTD_' + nodeId + '_' + workgroupId;
        var stepWorkDivId = 'noStudentWorkStepWorkDiv_' + nodeId + '_' + workgroupId;
        
        //create the row
        var stepWorkTR = $('<tr>');
        stepWorkTR.attr('id', stepWorkTRId);
        
        //create the td that will contain the student work
        var stepWorkTD = $('<td>');
        stepWorkTD.attr('id', stepWorkTDId);
        stepWorkTD.css('height', '100%');
        
        //create the div that will contain the student work
        var stepWorkDiv = $('<div>');
        stepWorkDiv.attr('id', stepWorkDivId);
        stepWorkDiv.css('height', '100%');
        stepWorkDiv.text('Student has not submitted any work');
        
        //add the div to the td
        stepWorkTD.append(stepWorkDiv);
        
        //add the td to the row
        stepWorkTR.append(stepWorkTD);
        
        if(isFirstRevision) {
            //create the TD that contains the score and comment
            var stepCommentScoreTD = this.createGradingTD(nodeId, workgroupId, nodeVisit);
            
            //add the score and comment td to the row
            stepWorkTR.append(stepCommentScoreTD);
        }
        
        //add the row to the table that contains all the revisions
        parentTable.append(stepWorkTR);
    }
    
    //loop through all the node visits from newest to oldest
    for(var x=nodeVisits.length - 1; x>=0; x--) {
        //get a node visit
        var nodeVisit = nodeVisits[x];
        
        if(nodeVisit != null) {
            //get the step work id
            var stepWorkId = nodeVisit.id;
            
            //get the post time
            var visitPostTime = nodeVisit.visitPostTime;
            
            //create the row
            var stepWorkTR = $('<tr>');
            stepWorkTR.attr('id', 'stepWorkTR_' + stepWorkId);
            
            //create the td that will contain the student work
            var stepWorkTD = $('<td>');
            stepWorkTD.attr('id', 'stepWorkTD_' + stepWorkId);
            stepWorkTD.css('height', '100%');
            
            //create the div that will contain the student work
            var stepWorkDiv = $('<div>');
            stepWorkDiv.attr('id', 'stepWorkDiv_' + stepWorkId);
            stepWorkDiv.css('height', '100%');
            
            //add the div to the td
            stepWorkTD.append(stepWorkDiv);
            
            //add the td to the row
            stepWorkTR.append(stepWorkTD);
            
            if(isFirstRevision) {
                //create the TD that contains the score and comment
                var stepCommentScoreTD = this.createGradingTD(nodeId, workgroupId, nodeVisit);
                
                //add the score and comment td to the row
                stepWorkTR.append(stepCommentScoreTD);
                
                //check if we should highlight the row
                if(this.shouldWeHighlightRow(nodeId, workgroupId, nodeVisit)) {
                    //we will highlight the row since the student work is new
                    stepWorkTR.css('background', '#FFEFED');

                    //increment the number of items to review
                    this.numberOfItemsToReview++;
                }
            }
            
            //add the row to the table that contains all the revisions
            parentTable.append(stepWorkTR);
            
            try {
                //render the student work into the div
                node.renderGradingView(stepWorkDiv, nodeVisit, null, workgroupId);
            } catch(e) {
                console.log(e);
            }
            
            if(visitPostTime != null) {
                //set the timestamp for the student work
                var visitPostTimeFormatted = this.formatTimestamp(visitPostTime);
                stepWorkDiv.append('<br><hr width="50%" align="left">Timestamp: ' + visitPostTimeFormatted);
            }
            
            /*
             * set the boolean to false so that all subsequent revisions do
             * not have the score and comment inputs
             */
            isFirstRevision = false;
        }
    }
};

/**
 * Create the TD that will contain the grading input for score and comment
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @param nodeVisit the node visit
 */
View.prototype.createGradingTD = function(nodeId, workgroupId, nodeVisit) {
    //get the step work id
    var stepWorkId = null;
    
    //get the post time
    var visitPostTime = null;
    
    var stepCommentScoreTDId = '';
    var stepCommentScoreDivId = '';
    var scoreInputId = '';
    var flagInputId = '';
    var commentTextAreaId = '';
    var studentWorkColumnId = '';
    var annotationTimestampId = '';
    
    if(nodeVisit == null) {
        //there is no student work
        
        //create the DOM ids for the elements
        stepCommentScoreTDId = 'noStudentWorkStepCommentScoreTD_' + nodeId + '_' + workgroupId;
        stepCommentScoreDivId = 'noStudentWorkStepCommentScoreDiv_' + nodeId + '_' + workgroupId;
        scoreInputId = 'noStudentWorkScoreInput_' + nodeId + '_' + workgroupId;
        flagInputId = 'noStudentWorkFlagInput_' + nodeId + '_' + workgroupId;
        commentTextAreaId = 'noStudentWorkCommentTextArea_' + nodeId + '_' + workgroupId;
        studentWorkColumnId = 'noStudentWorkStepWorkTD_' + nodeId + '_' + workgroupId;
        annotationTimestampId = 'noStudentWorkAnnotationTimestamp_' + nodeId + '_' + workgroupId;
    } else {
        //there is student work
        stepWorkId = nodeVisit.id;
        visitPostTime = nodeVisit.visitPostTime;
        
        //create the DOM ids for the elements
        stepCommentScoreTDId = 'stepCommentScoreTD_' + stepWorkId;
        stepCommentScoreDivId = 'stepCommentScoreDiv_' + stepWorkId;
        scoreInputId = 'scoreInput_' + stepWorkId;
        flagInputId = 'flagInput_' + stepWorkId;
        commentTextAreaId = 'commentTextArea_' + stepWorkId;
        studentWorkColumnId = 'stepWorkTD_' + stepWorkId;
        annotationTimestampId = 'annotationTimestamp_' + stepWorkId;
    }
    
    var isWorkNewerThanScore = false;
    var isWorkNewerThanComment = false;
    var scorePostTime = null;
    var commentPostTime = null;
    var flagPostTime = null;
    
    //create the td that will contain everything
    var stepCommentScoreTD = $('<td>');
    stepCommentScoreTD.attr('id', stepCommentScoreTDId);
    stepCommentScoreTD.css('height', '100%');
    
    //create the div that will contain the score and comment inputs
    var stepCommentScoreDiv = $('<div>');
    stepCommentScoreDiv.attr('id', stepCommentScoreDivId);
    stepCommentScoreDiv.css('height', '100%');
    
    //create the score input
    var scoreInput = $('<input>');
    scoreInput.attr('id', scoreInputId);
    scoreInput.attr('maxlength', 10);
    scoreInput.attr('size', 4);
    
    //get the latest score annotation for this step and student
    var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
    
    if(latestScoreAnnotation != null) {
        //get the score
        var score = latestScoreAnnotation.value;
        
        //set the score into the input
        scoreInput.val(score);
        
        //get the post time for the score
        scorePostTime = latestScoreAnnotation.postTime;
        
        if(visitPostTime > scorePostTime) {
            //the student work is newer than the score annotation
            isWorkNewerThanScore = true;
        }
    } else {
        //the student work is new
        isWorkNewerThanScore = true;
    }
    
    //set the event for when anything is changed in the score input
    scoreInput.on('input', {thisView:this, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId}, this.scoreChanged);
    
    //set the event for when the input value is changed and then loses focus
    scoreInput.on('change', {thisView:this, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId}, this.saveScore);
    
    //create the flag check box
    var flagCheckBox = $('<input>');
    flagCheckBox.attr('id', flagInputId);
    flagCheckBox.attr('type', 'checkbox');
    flagCheckBox.click({thisView:this, nodeId:nodeId, workgroupId:workgroupId, stepWorkId:stepWorkId}, function(event) {
        var thisView = event.data.thisView;
        var stepWorkId = event.data.stepWorkId;
        var nodeId = event.data.nodeId;
        var workgroupId = event.data.workgroupId;
        
        //the flag check box was clicked so we will save the flag annotation
        thisView.flagCheckBoxClicked(nodeId, workgroupId, stepWorkId);
    });
    
    //get the latest flag annotation for this step and student
    var latestFlagAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'flag');
    
    if(latestFlagAnnotation != null) {
        //get the score
        var flag = latestFlagAnnotation.value;
        
        if(flag == 'flagged') {
            //check the check box
            flagCheckBox.attr('checked', true);
        }
        
        //get the post time for the score
        flagPostTime = latestFlagAnnotation.postTime;
        
        if(visitPostTime > flagPostTime) {
            //the student work is newer than the score annotation
            isWorkNewerThanFlag = true;
        }
    } else {
        //the student work is new
        isWorkNewerThanFlag = true;
    }
    
    //create the open premade comments link
    var premadeCommentsLink = $('<a>');
    premadeCommentsLink.css('display', 'inline');
    premadeCommentsLink.css('text-decoration', 'underline');
    premadeCommentsLink.css('color', 'blue');
    premadeCommentsLink.css('cursor', 'pointer');
    premadeCommentsLink.text('Open Premade Comments');
    premadeCommentsLink.click(
            {thisView:this, stepWorkId:stepWorkId, commentTextAreaId:commentTextAreaId, studentWorkColumnId:studentWorkColumnId}, function(event) {
        var thisView = event.data.thisView;
        var stepWorkId = event.data.stepWorkId;
        var commentBoxId = event.data.commentTextAreaId;
        var studentWorkColumnId = event.data.studentWorkColumnId;
        
        /*
         * the open premade comments link was clicked so we will open up the
         * premade comments window
         */
        thisView.openPremadeCommentsLinkClicked(commentBoxId, studentWorkColumnId);
    });
    
    //create the comment textarea
    var commentTextArea = $('<textarea>');
    commentTextArea.attr('id', commentTextAreaId);
    commentTextArea.attr('cols', 50);
    commentTextArea.attr('rows', 5);
    
    //get the latest comment annotation for this step and student
    var latestCommentAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'comment');
    
    if(latestCommentAnnotation != null) {
        //get the comment
        var comment = latestCommentAnnotation.value;
        
        //set the comment into the textarea
        commentTextArea.val(comment);
        
        //get the post time for the comment
        commentPostTime = latestCommentAnnotation.postTime;
        
        if(visitPostTime > commentPostTime) {
            //the student work is newer than the comment annotation
            isWorkNewerThanComment = true;
        }
    } else {
        //the student work is new
        isWorkNewerThanComment = true;
    }
    
    //set the event for when anything is changed in the comment textarea
    commentTextArea.on('input', {thisView:this, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId}, this.commentChanged);
    
    //set the event for when the textarea value is changed and then loses focus
    commentTextArea.on('change', {thisView:this, stepWorkId:stepWorkId, nodeId:nodeId, workgroupId:workgroupId}, this.saveComment);
    
    //create the table that will contain the score, flag, and comment input
    var stepCommentScoreTable = $('<table>');
    
    //create the row that will contain the score and flag
    var scoreAndFlagRow = $('<tr>');
    
    //create the score cell
    var scoreCell = $('<td>');
    scoreCell.attr('width', '50%');
    var scoreP = $('<p>');
    scoreP.css('display', 'inline');
    scoreP.text('Score: ');
    
    scoreCell.append(scoreP);
    scoreCell.append(scoreInput);

    //create the flag cell
    var flagCell = $('<td>');
    flagCell.attr('width', '50%');
    var flagP = $('<p>');
    flagP.css('display', 'inline');
    flagP.text('Flag: ');
    
    //show the flag checkbox if there is student work
    if(nodeVisit != null) {
        flagCell.append(flagP);
        flagCell.append(flagCheckBox);
    }
    
    scoreAndFlagRow.append(scoreCell);
    scoreAndFlagRow.append(flagCell);
    
    //create the row that will contain the comment
    var commentRow = $('<tr>');
    var commentCell = $('<td>');
    commentCell.attr('colspan', 2);
    
    var commentP = $('<p>');
    commentP.text('Comment: ');
    commentP.css('display', 'inline');
    
    commentCell.append(commentP);
    commentCell.append(premadeCommentsLink);
    commentCell.append('<br/>');
    commentCell.append(commentTextArea);
    
    commentRow.append(commentCell);
    
    //create the row that will contain the timestamp
    var timestampRow = $('<tr>');
    var timestampCell = $('<td>');
    timestampCell.attr('colspan', 2);
    
    //create the div to display the annotation timestamp
    var annotationTimestampDiv = $('<div>');
    annotationTimestampDiv.attr('id', annotationTimestampId);
    annotationTimestampDiv.css('font-size', '0.75em');
    
    //get the latest timestamp between the score and comment
    var annotationPostTime = Math.max(scorePostTime, commentPostTime, flagPostTime);
    
    if(annotationPostTime != 0) {
        //create the annotation post time date
        var annotationPostTimeFormatted = this.formatTimestamp(annotationPostTime);
        
        //set the last annotation timestamp
        annotationTimestampDiv.html('Last Annotation: ' + annotationPostTimeFormatted);
    } else {
        //there has been no annotations
        annotationTimestampDiv.html('Last Annotation: not available');
    }
    
    timestampCell.append(annotationTimestampDiv);
    
    timestampRow.append(timestampCell);
    
    //add the rows to the table
    stepCommentScoreTable.append(scoreAndFlagRow);
    stepCommentScoreTable.append(commentRow);
    stepCommentScoreTable.append(timestampRow);
    
    //add the table to the div
    stepCommentScoreDiv.append(stepCommentScoreTable);
    
    //add the div to the td
    stepCommentScoreTD.append(stepCommentScoreDiv);

    return stepCommentScoreTD;
};

/**
 * The flag check box was clicked so we will save the flag annotation to the server
 * @param nodeId the node id for the step
 * @param workgroupId the student workgroup id
 * @param stepWorkId the student work id
 */
View.prototype.flagCheckBoxClicked = function(nodeId, workgroupId, stepWorkId, mode) {
    var flagInputId = '';
    
    if(mode === 'studentGrading') {
        flagInputId = 'studentGradingFlagInput_' + stepWorkId;
    } else if(mode === 'stepGrading') {
        flagInputId = 'stepGradingFlagInput_' + stepWorkId;
    }
    
    //get the check box
    var flagCheckBox = $('#' + flagInputId);
    
    //get whether it was checked or not
    var checkBoxValue = flagCheckBox.attr('checked')
    var isChecked = false;
    
    if(checkBoxValue == 'checked') {
        //the check box was checked
        isChecked = true;
    }
    
    //get the url for saving the flag annotation
    var postFlagsUrl = this.getConfig().getConfigParam('postFlagsUrl');
    
    var value = '';
    
    //check if we are flagging or unflagging the flag
    if(isChecked) {
        //we are flagging the flag
        value = 'flagged';
    } else {
        //we are deleting/unflagging the flag
        value = 'unflagged';        
    }
    
    //get the parameters for posting the flag annotation
    var runId = this.getConfig().getConfigParam('runId');
    var toWorkgroup = workgroupId;
    var fromWorkgroup = this.getUserAndClassInfo().getWorkgroupId();
    var annotationType = 'flag';
    
    var postFlagArgs = {
        runId:runId,
        nodeId:nodeId,
        toWorkgroup:toWorkgroup,
        fromWorkgroup:fromWorkgroup,
        stepWorkId:stepWorkId,
        value:value,
        annotationType:annotationType
    };
    
    // Show saving message
    notificationManager.notify(view.getI18NString('classroomMonitor_saving'), 3);
    //make the call to post the annotation
    this.connectionManager.request('POST', 1, postFlagsUrl, postFlagArgs, this.postFlagCallbackSuccess, [this, stepWorkId, annotationType, isChecked, nodeId, toWorkgroup, mode], this.postFlagCallbackFail);
};

/**
 * The successcallback for posting flag annotations
 */
View.prototype.postFlagCallbackSuccess = function(text, xml, args) {
    var thisView = args[0];
    var stepWorkId = args[1];
    var type = args[2];
    var value = args[3];
    var nodeId = args[4];
    var workgroupId = args[5];
    var mode = args[6];
    
    thisView.postAnnotationCallbackSuccessHandler(stepWorkId, type, value, nodeId, workgroupId, mode, text);
};

/**
 * The failure callback for posting flag annotations
 */
View.prototype.postFlagCallbackFail = function() {
    // TODO: revert and notify of failure
};

/**
 * The open premade comments link was clicked so we will open the
 * premade comments window
 * @param commentBoxId the dom id of the comment textarea that we will
 * be inserting the premade comment into
 * @param studentWorkColumnid the dom id of the div that is displaying
 * the specific student work in the grading tool
 */
View.prototype.openPremadeCommentsLinkClicked = function(commentBoxId, studentWorkColumnId) {
    this.showPremadeCommentsDiv(commentBoxId, studentWorkColumnId);
};

/**
 * Check if we should highlight the row. We will highlight the row if the
 * student work is newer than the score and comment annotations
 * @param nodeId the node id
 * @param workgroup id the workgroup id
 * @param nodeVisit the node visit
 */
View.prototype.shouldWeHighlightRow = function(nodeId, workgroupId, nodeVisit) {
    var highlight = false;
    
    //get the step work id
    var stepWorkId = nodeVisit.id;
    
    //get the post time
    var visitPostTime = nodeVisit.visitPostTime;
    
    var isWorkNewerThanScore = false;
    var isWorkNewerThanComment = false;
    var scorePostTime = null;
    var commentPostTime = null;
    
    //get the latest score annotation for this step and student
    var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
    
    if(latestScoreAnnotation != null) {
        //get the post time for the score
        scorePostTime = latestScoreAnnotation.postTime;
        
        if(visitPostTime > scorePostTime) {
            //the student work is newer than the score annotation
            isWorkNewerThanScore = true;
        }
    } else {
        //the student work is new
        isWorkNewerThanScore = true;
    }
    
    //get the latest comment annotation for this step and student
    var latestCommentAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'comment');
    
    if(latestCommentAnnotation != null) {
        //get the post time for the comment
        commentPostTime = latestCommentAnnotation.postTime;
        
        if(visitPostTime > commentPostTime) {
            //the student work is newer than the comment annotation
            isWorkNewerThanComment = true;
        }
    } else {
        //the student work is new
        isWorkNewerThanComment = true;
    }
    
    //check if the work is newer than the score and comment
    if(isWorkNewerThanScore && isWorkNewerThanComment) {
        highlight = true;
    }
    
    return highlight;
};

/**
 * Save the score
 */
View.prototype.saveScore = function(event) {
    var thisView = event.data.thisView;
    var stepWorkId = event.data.stepWorkId;
    var nodeId = event.data.nodeId;
    var workgroupId = event.data.workgroupId;
    var mode = event.data.mode;
    
    thisView.saveScoreHandler(stepWorkId, nodeId, workgroupId, mode);
};

/**
 * Check if the score is valid and then save the score to the server.
 * If the score is invalid we will revert it back to the previous value.
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 */
View.prototype.saveScoreHandler = function(stepWorkId, nodeId, workgroupId, mode) {
    var fromWorkgroup = this.getUserAndClassInfo().getWorkgroupId();
    var runId = this.getConfig().getConfigParam('runId');
    
    //check if the score has changed from the previous value
    if(this.isScoreChanged(stepWorkId, nodeId, workgroupId, mode)) {
        //the score has changed so we will obtain the new value
        var scoreValue = this.getScoreInputValue(stepWorkId, nodeId, workgroupId, mode);
        
        if(this.isScoreValid(scoreValue)) {
            //the score is valid so we will save it to the server
            this.postAnnotation(nodeId, workgroupId, fromWorkgroup, 'score', scoreValue, runId, stepWorkId, mode);          
        } else {
            /*
             * the score is invalid so we will display a message and revert it back
             * to the previous value
             */
            alert(this.getI18NStringWithParams('classroomMonitor_grading_invalidScore', [scoreValue]));
            this.revertScore(stepWorkId, nodeId, workgroupId, mode);
        }
    }
};

/**
 * The teacher has changed a max score
 * event the jquery change event fired from the max score input
 */
View.prototype.maxScoreChanged = function(event) {
    var thisView = event.data.thisView;
    var nodeId = event.data.nodeId;
    var runId = thisView.getConfig().getConfigParam('runId');
    
    //get the max score input element
    var target = event.target;
    
    if(target == null) {
        /*
         * try to get the max score input element again
         * since we were unable to find it in event.target
         */
        target = event.srcElement;
    }
    
    //get the value in the max score input element
    var maxScore = target.value;
    
    //save the max score to the server
    thisView.saveMaxScore(nodeId, maxScore);
};

/**
 * Get the score input value
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @return the score input value
 */
View.prototype.getScoreInputValue = function(stepWorkId, nodeId, workgroupId, mode) {
    var scoreValue = null;
    
    //get the score input id
    var scoreInputId = null;
    
    if(stepWorkId == null) {
        //the student doesn't have any work for this step
        if(mode == 'studentGrading') {
            scoreInputId = this.escapeIdForJquery('noStudentWorkStudentGradingScoreInput_' + nodeId + '_' + workgroupId);
        } else if(mode == 'stepGrading') {
            scoreInputId = this.escapeIdForJquery('noStudentWorkStepGradingScoreInput_' + nodeId + '_' + workgroupId);          
        }
    } else {
        //the student has work for this step
        if(mode == 'studentGrading') {
            scoreInputId = 'studentGradingScoreInput_' + stepWorkId;
        } else if(mode == 'stepGrading') {
            scoreInputId = 'stepGradingScoreInput_' + stepWorkId;
        }
    }
    
    //get the new score input value
    scoreValue = $('#' + scoreInputId).val();
    
    return scoreValue;
};

/**
 * Save the comment
 */
View.prototype.saveComment = function(event) {
    var thisView = event.data.thisView;
    var stepWorkId = event.data.stepWorkId;
    var nodeId = event.data.nodeId;
    var workgroupId = event.data.workgroupId;
    var mode = event.data.mode;
    
    thisView.saveCommentHandler(stepWorkId, nodeId, workgroupId, mode);
};

/**
 * Save the comment to the server
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 */
View.prototype.saveCommentHandler = function(stepWorkId, nodeId, workgroupId, mode) {
    var fromWorkgroup = this.getUserAndClassInfo().getWorkgroupId();
    var runId = this.getConfig().getConfigParam('runId');
    
    //check if the comment has changed from the previous value
    if(this.isCommentChanged(stepWorkId, nodeId, workgroupId, mode)) {
        //the comment has changed so we will obtain the new value
        var commentValue = this.getCommentTextAreaValue(stepWorkId, nodeId, workgroupId, mode);
        
        //save the comment to the server
        this.postAnnotation(nodeId, workgroupId, fromWorkgroup, 'comment', commentValue, runId, stepWorkId, mode);
    }
};

/**
 * Get the comment text area value
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @return the comment text area value
 */
View.prototype.getCommentTextAreaValue = function(stepWorkId, nodeId, workgroupId, mode) {
    var commentTextAreaId = null;
    
    if(stepWorkId == null) {
        //the student does not have any work for the step
        if(mode == 'studentGrading') {
            commentTextAreaId = this.escapeIdForJquery('noStudentWorkStudentGradingCommentTextArea_' + nodeId + '_' + workgroupId);
        } else if(mode == 'stepGrading') {
            commentTextAreaId = this.escapeIdForJquery('noStudentWorkStepGradingCommentTextArea_' + nodeId + '_' + workgroupId);            
        }
    } else {
        //the student has work for the step
        if(mode == 'studentGrading') {
            commentTextAreaId = 'studentGradingCommentTextArea_' + stepWorkId;
        } else if(mode == 'stepGrading') {
            commentTextAreaId = 'stepGradingCommentTextArea_' + stepWorkId;         
        }
    }
    
    //get the comment text area value
    var commentValue = $('#' + commentTextAreaId).val();
    
    return commentValue;
};

/**
 * Post the annotation to the server
 * @param nodeId the node id
 * @param toWorkgroup the student workgroup id
 * @param fromWorkgroup the teacher workgroup id
 * @param type the type of annotation 'score' or 'comment'
 * @param value the annotation value
 * @param runId the run id
 * @param stepWorkId the step work id
 */
View.prototype.postAnnotation = function(nodeId, toWorkgroup, fromWorkgroup, type, value, runId, stepWorkId, mode) {
    var postAnnotationsURL = this.getConfig().getConfigParam('postAnnotationsUrl');
    
    //encode the value in case it contains special characters
    value = encodeURIComponent(value);
    
    var postAnnotationParams = {
        runId:runId,
        toWorkgroup:toWorkgroup,
        fromWorkgroup:fromWorkgroup,
        annotationType:type,
        value:value,
        nodeId:nodeId
    }
    
    if(stepWorkId != null) {
        postAnnotationParams.stepWorkId = stepWorkId;
    }
    
    // Show saving message
    notificationManager.notify(view.getI18NString('classroomMonitor_saving'), 3);
    this.connectionManager.request('POST', 1, postAnnotationsURL, postAnnotationParams, this.postAnnotationCallbackSuccess, [this, stepWorkId, type, value, nodeId, toWorkgroup, mode], this.postAnnotationCallbackFailure);
};

/**
 * Callback for posting annotations
 */
View.prototype.postAnnotationCallbackSuccess = function(text, xml, args) {
    var thisView = args[0];
    var stepWorkId = args[1];
    var type = args[2];
    var value = args[3];
    var nodeId = args[4];
    var workgroupId = args[5];
    var mode = args[6];
    
    thisView.postAnnotationCallbackSuccessHandler(stepWorkId, type, value, nodeId, workgroupId, mode, text);
};

/**
 * The function that actually handles the callback logic when posting annotations
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @param timestamp the post timestamp
 */
View.prototype.postAnnotationCallbackSuccessHandler = function(stepWorkId, type, value, nodeId, workgroupId, mode, timestamp) {
    var view = this;
    var timestampFormatted = null;
    
    if(stepWorkId != null) {
        //remove the background highlight color for the row
        $('#stepWorkTR_' + stepWorkId).css('background', '');
    }
    
    if(timestamp != null) {
        //get the timestamp
        timestampFormatted = this.formatTimestamp(parseInt(timestamp));
        
        var annotationTimestampId = null;
        
        if(stepWorkId == null) {
            //the student does not have any work for the step
            if(mode == 'studentGrading') {
                annotationTimestampId = this.escapeIdForJquery('noStudentWorkStudentGradingAnnotationTimestamp_' + nodeId + '_' + workgroupId);
            } else if(mode == 'stepGrading') {
                annotationTimestampId = this.escapeIdForJquery('noStudentWorkStepGradingAnnotationTimestamp_' + nodeId + '_' + workgroupId);                
            }
        } else {
            //the student has work for the step
            if(mode == 'studentGrading') {
                annotationTimestampId = 'studentGradingAnnotationTimestamp_' + stepWorkId;
            } else if(mode == 'stepGrading') {
                annotationTimestampId = 'stepGradingAnnotationTimestamp_' + stepWorkId;             
            }
        }
    }
    
    
    var rowId = '';
    
    //get the row id
    if(stepWorkId == null) {
        if(mode == 'studentGrading') {
            rowId = this.escapeIdForJquery('noStudentWorkStudentGradingRow_' + nodeId + '_' + workgroupId);
        } else if(mode == 'stepGrading') {
            rowId = this.escapeIdForJquery('noStudentWorkStepGradingRow_' + nodeId + '_' + workgroupId);            
        }
    } else {
        if(mode == 'studentGrading') {
            rowId = 'studentGradingStepWork_' + stepWorkId;
        } else if(mode == 'stepGrading') {
            rowId = 'stepGradingStepWork_' + stepWorkId;            
        }
    }
    
    var $row = $('#' + rowId);
    var table = null;
    var isNew = false;
    
    if(type !== 'flag'){
        if ($row.hasClass('new')){
            isNew = true;
            this.numberOfItemsToReview--;
            $row.removeClass('new');
        }
    }
    
    if (this.classroomMonitorWorkgroupIdSelected) {
        if(isNew){
            var stepname = $row.data('stepname');
            $('tr.new').each(function(){
                if($(this).data('stepname') === stepname){
                    $(this).removeClass('new');
                }
            });
        }
        table = this.gradeByStudentTable;
        // set the number of items to review value
        $('#gradeByStudentItemsToReview').text(view.getI18NStringWithParams('classroomMonitor_grading_itemsToReview',[this.numberOfItemsToReview]));
        this.numberOfItemsToReview > 0 ? $('#gradeByStudentItemsToReview').fadeIn() : $('#gradeByStudentItemsToReview').fadeOut();
    } else if(this.classroomMonitorStepIdSelected) {
        if(isNew){
            var workgroup = $row.data('workgroup');
            $('tr.new').each(function(){
                if($(this).data('workgroup') === workgroup){
                    $(this).removeClass('new');
                }
            });
        }
        table = this.gradeByStepTable;
        // set the number of items to review value
        $('#gradeByStepItemsToReview').text(view.getI18NStringWithParams('classroomMonitor_grading_itemsToReview',[this.numberOfItemsToReview]));
        this.numberOfItemsToReview > 0 ? $('#gradeByStepItemsToReview').fadeIn() : $('#gradeByStepItemsToReview').fadeOut();
    }
    
    if(table){
        var rIdx = table.row( $row ).index();
        switch(type) {
            // update data for row
            case 'score':
            case 'comment':
                //table.cell(rIdx, 5).data(value);
                //table.cell(rIdx, 7).data(value);
                //table.cell(rIdx, 12).data('false');
                if(timestampFormatted) { $('.feedback-date', $row).text(view.getI18NStringWithParams('classroomMonitor_grading_lastAnnotation',[timestampFormatted])); }
                break;
            case 'flag':
                //table.cell(rIdx, 10).data(value);
        }
        
        // TODO: figure out how to redraw table without breaking event bindings in cell content!!
    }
    
    // display save confirmation notification
    notificationManager.notify(view.getI18NString('classroomMonitor_saveConfirmation'), 3);
    
    // disable the save button
    //$('#saveButton').prop('disabled', true);
    
    // get annotations and update scores for workgroup
    view.retrieveAnnotations('progress', workgroupId);
};

/**
 * Callback failure function for posting annotations
 */
View.prototype.postAnnotationCallbackFailure = function(stepWorkId) {
    // TODO: revert to previous annotation state
};

/**
 * Check if the score is valid
 * @param scoreValue the score value
 * @return whether the score value is valid or not
 */
View.prototype.isScoreValid = function(scoreValue) {
    var result = false;
    
    //check if the score is a valid number
    if(!isNaN(scoreValue)) {
        //the score is a valid number
        result = true;
    }
    
    return result;
}

/**
 * Revert the score to the previous value
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 */
View.prototype.revertScore = function(stepWorkId, nodeId, workgroupId) {
    var previousScore = '';
    
    //get the previous score annotation
    var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
    
    if(latestScoreAnnotation != null) {
        //get the previous score value
        previousScore = latestScoreAnnotation.value;
    }
    
    var scoreInputId = '';
    
    if(stepWorkId == null) {
        //the student does not have any work
        scoreInputId = this.escapeIdForJquery('noStudentWorkScoreInput_' + nodeId + '_' + workgroupId);
    } else {
        //the student has work
        scoreInputId = 'scoreInput_' + stepWorkId;
    }
    
    //set the score input to the previous value
    $('#' + scoreInputId).val(previousScore);
}

/**
 * Check if the score has changed from the previous value
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @return whether the score has changed from the previous value
 */
View.prototype.isScoreChanged = function(stepWorkId, nodeId, workgroupId, mode) {
    var result = false;
    
    //get the previous score annotation
    var latestScoreAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'score');
    
    var previousScore = '';
    
    if(latestScoreAnnotation != null) {
        //get the previous score
        previousScore = latestScoreAnnotation.value;
    }
    
    //get the score input id
    var scoreInputId = null;
    
    if(stepWorkId == null) {
        //the student doesn't have any work for this step
        if(mode == 'studentGrading') {
            scoreInputId = this.escapeIdForJquery('noStudentWorkStudentGradingScoreInput_' + nodeId + '_' + workgroupId);           
        } else if(mode == 'stepGrading') {
            scoreInputId = this.escapeIdForJquery('noStudentWorkStepGradingScoreInput_' + nodeId + '_' + workgroupId);
        }
    } else {
        //the student has work for this step
        if(mode == 'studentGrading') {
            scoreInputId = 'studentGradingScoreInput_' + stepWorkId;
        } else if(mode == 'stepGrading') {
            scoreInputId = 'stepGradingScoreInput_' + stepWorkId;           
        }
    }
    
    //get the new score input value
    var scoreValue = $('#' + scoreInputId).val();
    
    if(previousScore !== scoreValue) {
        //the score has changed
        result = true;
    }
    
    return result;
};

/**
 * Check if the comment has changed from the previous value
 * @param stepWorkId the step work id
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @return whether the comment has changed from the previous value
 */
View.prototype.isCommentChanged = function(stepWorkId, nodeId, workgroupId, mode) {
    var result = false;
    
    //get the previous comment annotation
    var latestCommentAnnotation = this.getLatestAnnotation(nodeId, workgroupId, 'comment');
    
    var previousCommentValue = '';
    
    if(latestCommentAnnotation != null) {
        //get the previous comment
        previousCommentValue = latestCommentAnnotation.value;
    }
    
    var commentTextAreaId = null;
    
    if(stepWorkId == null) {
        //the student does not have any work for this step
        if(mode == 'studentGrading') {
            commentTextAreaId = this.escapeIdForJquery('noStudentWorkStudentGradingCommentTextArea_' + nodeId + '_' + workgroupId);
        } else if(mode == 'stepGrading') {
            commentTextAreaId = this.escapeIdForJquery('noStudentWorkStepGradingCommentTextArea_' + nodeId + '_' + workgroupId);            
        }
    } else {
        //the student has work for this step
        if(mode == 'studentGrading') {
            commentTextAreaId = 'studentGradingCommentTextArea_' + stepWorkId;
        } else if(mode == 'stepGrading') {
            commentTextAreaId = 'stepGradingCommentTextArea_' + stepWorkId;         
        }
    }
    
    //get the new comment value
    var newCommentValue = $('#' + commentTextAreaId).val();
    
    if(previousCommentValue !== newCommentValue) {
        //the comment has changed
        result = true;
    }
    
    return result;
};

/**
 * A score input has changed so we will enable the save button
 * @param event the jquery event object
 */
View.prototype.scoreChanged = function(event) {
    $('#save').fadeIn();
};

/**
 * A comment textarea has changed so we will enable the save button
 * @param event the jquery event object
 */
View.prototype.commentChanged = function(event) {
    $('#save').fadeIn();
};

/**
 * Get the latest annotation
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @param type the type of annotation
 */
View.prototype.getLatestAnnotation = function(nodeId, workgroupId, type) {
    var annotation = null;
    
    //get the annotations for the run
    var annotations = this.model.getAnnotations();
    
    //get the run id
    var runId = this.getConfig().getConfigParam('runId');
    
    //get the teacher workgroup ids
    var fromWorkgroups = this.getUserAndClassInfo().getAllTeacherWorkgroupIds();
    
    var stepWorkId = null;
    
    if(annotations != null) {
        //get the latest annotation with the given parameters
        annotation = annotations.getLatestAnnotation(runId, nodeId, workgroupId, fromWorkgroups, type, stepWorkId);
    }
    
    return annotation;
};

/**
 * Get the latest annotation that contains the given field in one of its objects
 * in its value array
 * @param nodeId the node id
 * @param workgroupId the workgroup id
 * @param fromWorkgroups the from workgroups
 * @param type the type of annotation
 * @param field the field to look for in the objects in the value array
 * @return the latest annotation that has an object in its value array that
 * contains the given field
 */
View.prototype.getLatestAnnotationWithField = function(nodeId, workgroupId, fromWorkgroups, type, field) {
    var annotation = null;
    
    //get the annotations for the run
    var annotations = this.model.getAnnotations();
    
    //get the run id
    var runId = this.getConfig().getConfigParam('runId');
    
    if(fromWorkgroups == null) {
        //get the teacher workgroup ids
        fromWorkgroups = this.getUserAndClassInfo().getAllTeacherWorkgroupIds();        
    }
    
    var stepWorkId = null;
    
    if(annotations != null) {
        //get the latest annotation with the given parameters
        annotation = annotations.getLatestAnnotation(runId, nodeId, workgroupId, fromWorkgroups, type, stepWorkId, field);
    }
    
    return annotation;
};

/**
 * Create the step progress display
 */
View.prototype.createStepProgressDisplay = function() {
    var view = this,
        table = $('#stepProgressTable'),
        allPeriodsLabel = view.getI18NString('classroomMonitor_allPeriods');
    this.stepProgressData = [];
    
    //get all the node ids and periods
    var nodeIds = this.getProject().getAllNodeIds(),
        periods = this.getUserAndClassInfo().getPeriods(),
        position = 0;
    
    if(periods.length > 1){
        // if more than one period, add "all periods" entry
        periods.push({'periodId': 'all', 'periodName': allPeriodsLabel});
    }
    
    //loop through all the node ids
    for(var x=0; x<nodeIds.length; x++) {
        //get a node id
        var nodeId = nodeIds[x];
        
        //skip the master node
        if(nodeId != 'master' && nodeId != 'startsequence') {
            //get the node
            var node = this.getProject().getNodeById(nodeId);
            
            if(node != null) {
                //get the node number and title
                var numberAndTitle = this.getProject().getStepNumberAndTitle(nodeId),
                    
                    // initialize completion html and value
                    completionHtml = '',
                    stepCompletion = null,
                
                    //get the node type
                    nodeType = node.type,
                    
                    //initiate the node title
                    nodeTitle = '',
                    
                    // initiate students on step display
                    studentsOnStepHtml = null,
                    
                    // initiate the row class
                    rowClass = '',
                    
                    // initiate gradable variable
                    gradable = false,
                    
                    //the div to display the max score input
                    maxScoreDiv = '';
                
                // loop through periods
                var i = periods.length;
                while (i--){
                    // get period id
                    var periodId = periods[i].periodId,
                        periodName = periods[i].periodName,
                        nodeTypeReadable = '';
                        
                    if(nodeType === 'sequence') {
                        nodeTitle = view.getI18NString('activityTerm') + ' ' + numberAndTitle;
                        rowClass = ' activity';
                        
                        //we will not display number of students on step or completion percentage for sequences 
                        studentsOnStepHtml = null;
                        stepCompletion = null;
                    } else {
                        //get the number of students on this step in this period
                        var studentsOnStep = this.getStudentsOnStep(nodeId, periodId),
                        numberOfStudentsOnStep = studentsOnStep.total;
                        studentsOnStepHtml = this.getStudentsOnStepHtml(numberOfStudentsOnStep, studentsOnStep.workgroups),
                        
                        rowClass = (numberOfStudentsOnStep > 0) ? 'stepProgress_' + nodeId + ' online' : 'stepProgress_' + nodeId + ' offline',
                        
                        //get the percentage completion for this step in this period
                        stepCompletion = this.calculateStepCompletionForNodeId(nodeId, periodId);
                        
                        nodeTitle = view.getI18NString('stepTerm') + ' ' + numberAndTitle;
                        nodeTypeReadable = '<span class="label label-default">' + NodeFactory.nodeConstructors[nodeType].authoringToolName + '</span>';
                        
                        //check if there are any student statuses in the array
                        if(!this.studentStatuses || this.studentStatuses.length < 1) {
                            /*
                             * there are no student status objects which can mean a
                             * student has never loaded the vle or the run occurred before
                             * we implemented student statuses
                             */ 
                            stepCompletion = -1;
                            
                            if(node.hasGradingView()) {
                                gradable = true;
                                
                                //this step is gradable
                                completionHtml = '<a href="javascript:void(0);" class="bs-popover" data-content="' + view.getI18NString('classroomMonitor_stepProgress_completionUnavaiable_gradable') + '"><span class="fa fa-question-circle"></span></a>';
                            } else {
                                //this step is not gradable
                                completionHtml = '<a href="javascript:void(0);" class="bs-popover" data-content="' + view.getI18NString('classroomMonitor_stepProgress_completionUnavaiable') + '"><span class="fa fa-question-circle"></span></a>';
                            }
                        } else {
                            // get step completion html
                            completionHtml = view.getStepCompletionHtml(stepCompletion);
                        }
                        
                        if(node.hasGradingView()) { 
                            gradable = true;
                            rowClass += ' gradable';
                            nodeTitle = '<a href="javascript:void(0);" class="grade-by-step" title="' + view.getI18NString('classroomMonitor_stepProgress_viewStepWork') + '" data-nodeid="' + nodeId + '">' + nodeTitle + '<span class="fa fa-search-plus fa-flip-horizontal"></span> ' + nodeTypeReadable + '</a>';
                        } else {
                            nodeTitle +=  ' ' + nodeTypeReadable;
                        }

                        //get the max score for the step
                        var maxScoreValue = view.getMaxScoreValueByNodeId(nodeId);
                        
                        //create the div that will display the max score input for the step
                        maxScoreDiv = '<div class="form-inline" style="text-align:center"><input id="maxScore_' + nodeId + '" type="text" size="6" class="score form-control max-score" value="' + maxScoreValue + '" data-nodeid="' + nodeId + '"></input></div>';
                    }
                    
                    var pId = (periodId === null) ? 'all' : periodId;
                    
                    //create the row for the step and period
                    view.stepProgressData.push(
                        {
                            "DT_RowId": 'stepProgress_' + nodeId + '_' + pId,
                            "DT_RowClass": rowClass,
                            "period_id": periodId,
                            "period_name": periodName,
                            "position": position,
                            "students_on_step": studentsOnStepHtml,
                            "node": numberAndTitle,
                            "node_id": nodeId,
                            "node_title": nodeTitle,
                            "complete": stepCompletion,
                            "complete_html": completionHtml,
                            "gradable": gradable,
                            "max_score": maxScoreDiv
                        });
                }
            }
        }
        
        ++position;
    }
    
    var initialPeriod = allPeriodsLabel;
    // if more than one period, remove entry we added above
    if(periods.length > 1){
        periods.pop();
    } else {
        initialPeriod = periods[0].periodName;
    }
    
    /*var dataSet = $.map(view.stepProgressData, function(value, index) {
        return [value];
    });*/
    var dataSet = view.stepProgressData;
    
    // initialize dataTable
    table.dataTable( {
        'data': dataSet,
        'paging': false,
        'dom': '<"dataTables_top"lf><"clearfix">rt<"dataTables_bottom"ip><"clear">',
        'language': {
            'search': '',
            'info': view.getI18NStringWithParams('classroomMonitor_tableInfoText', ['_TOTAL_']),
            'infoFiltered': ''
        },
        'columns': [
            { 'title': 'Period Name', 'data': 'period_name' },
            { 'title': 'Position', 'data': 'position' },
            { 'title': 'Node', 'data': 'node' },
            { 'title': view.getI18NString('classroomMonitor_stepProgress_headers_nodeTitle'), 'data': 'node_title', 'class': 'viewStepWork', 'orderData': [1] },
            //{ 'title': 'Average Score' }, TODO: enable (and make point value editable)
            //{ 'title': 'Average Score %' }, TODO: enable and sort Average Score column by this
            { 'title': view.getI18NString('classroomMonitor_stepProgress_headers_studentsOnStep'), 'data': 'students_on_step', 'class': 'center', 'orderData': [4, 1], 'width': '10%' },
            { 'title': 'Complete', 'data': 'complete' },
            { 'title': view.getI18NString('classroomMonitor_stepProgress_headers_stepCompletion'), 'data': 'complete_html', 'class': 'center', 'orderData': [5, 1] },
            { 'title': view.getI18NString('classroomMonitor_stepProgress_headers_maxScore'), 'data': 'max_score', 'class': 'center', 'width': '8%' }
        ],
        'order': [[ 3, 'asc' ]],
        'columnDefs': [
            {
                'targets': [ 1, 2, 5 ],
                'searchable': false
            },
            {
                'targets': [ 0, 1, 2, 5 ],
                'visible': false,
            },
            {
                "targets": [ 3 ],
                "createdCell": function (td, cellData, rowData, row, col) {
                    if(rowData.gradable){
                        $(td).addClass('gradable');
                    }
                }
            }
        ],
        "searchCols": [
            { "sSearch": initialPeriod }, null, null, null, null, null, null
        ],
        'footerCallback': function ( row, data, start, end, display ) {
            var api = this.api(),
                pageTotal = 0,
    
                // Get total completion over current page
                data = api
                    .column( 5, { page: 'current'} )
                    .data();
            
            if(data.length){
                pageTotal = data.reduce( function (pVal, cVal) {
                    return pVal*1 + cVal*1;
                } )
            }
            var numVals = api.column( 5, { page: 'current'} ).data().length;
            pageTotal = numVals ? pageTotal/numVals : 0;
            
            // Update footer
            $( api.column( 6 ).footer() ).html(
                '<div class="progress">\
                <div class="progress-bar"  role="progressbar" aria-valuenow="' + pageTotal + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + pageTotal + '%">\
                <span class="sr-only">' + pageTotal + '% Complete</span></div></div>'
            );
        },
        'initComplete': function( settings, json ) {
            $('.dataTables_filter input[type="search"]', $('#stepProgress')).attr('placeholder', view.getI18NString('classroomMonitor_search'));
        },
        'drawCallback': function( settings ) {
            view.redrawFixedHeaders(true);
            view.bsPopover($('.bs-popover', table), {trigger: 'hover click focus', html: true, placement: 'right auto'});
            view.bsTooltip($('.workgroups-online', table), { html: true, placement: 'left' });
            
            // bind click actions to workgroup links
            $('.grade-by-step', table).each(function(){
                $(this).off('click').on('click', {thisView:view, nodeId:$(this).data('nodeid')}, view.stepRowClicked);
            });
            
            $('.max-score', table).each(function() {
                /*
                 * get the max score value for the step and set it into the max score input.
                 * this is for handling multiple periods since each period has an input box
                 * for an individual step. this means if there are 3 periods, each step
                 * will have 3 max score input boxes associated with it but only one will
                 * be shown to the teacher at any given time. therefore if the teacher
                 * switches periods, we need to update the max scores in the input box.
                 */
                var maxScoreValue = view.getMaxScoreValueByNodeId($(this).data('nodeid'));
                $(this).val(maxScoreValue);
                
                /*
                 * unbind the change event from any previous times drawCallback was called
                 * so that maxScoreChanged() isn't called multiple times
                 */
                $(this).unbind('change');
                
                //set a change event on the max score
                $(this).on('change', {thisView:view, nodeId:$(this).data('nodeid')}, view.maxScoreChanged);
            });
        }
    } );
    
    table.dataTable().fnFilterOnReturn();
    
    this.fixedHeaders.push(new $.fn.dataTable.FixedHeader( table.dataTable() , {
        'offsetTop': 90
    }));
    view.redrawFixedHeaders();
    
    // create view object for future api access
    this.stepProgressTable = table.DataTable();
    
    // add period filter and header text
    this.addSectionHeader(table, $('#stepProgressTable_wrapper'), view.getI18NString('classroomMonitor_stepProgress_title'), { 'periodCol': 0, 'allSelector': allPeriodsLabel });
};

/**
 * Gets step completion HTML string for step progress display
 * 
 * @param stepCompletion Number step completion percentage
 * @returns html step comletion HTML string
 */
View.prototype.getStepCompletionHtml = function(stepCompletion){
    var html = '<div class="progress" data-sort="' + stepCompletion + '">\
        <div class="progress-bar"  role="progressbar" aria-valuenow="' + stepCompletion + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + stepCompletion + '%">\
        <span class="sr-only">' + stepCompletion + '%</span></div></div>';
    return html;
};

/**
 * Gets students on step HTML string for step progress display
 * 
 * @param studentsOnStep Number of students on the step
 * @param workgroups Array of Strings of workgroups on the step
 * @returns html step comletion HTML string
 */
View.prototype.getStudentsOnStepHtml = function(studentsOnStep, workgroups){
    if(studentsOnStep > 0){
        var workgroupsText = '';
        if(workgroups && workgroups.length){
            workgroupsText = ' title="<ul class=\'no-margin\' style=\'padding-left: 10px;\'><li>' + workgroups.join('</li><li>') + '</li></ul>"';
        }
        return '<b class="text-success workgroups-online"' + workgroupsText + '>' + studentsOnStep + ' <span class="fa fa-users"></span></b>';
    } else {
        return studentsOnStep;
    }
};

/**
 * Create the step progress TR for a step
 * @param nodeId the node id for the step
 * @param stepTitle the step title
 * @param numberOfStudentsOnStep the number of students on the step
 * @param completionPercentage the percentage of students who have completed 
 * the step. this should be a number since we will append the % sign to it.
 * @return a TR element containing the step progress values
 */
View.prototype.createStepProgressDisplayRow = function(nodeId, stepTitle, numberOfStudentsOnStep, completionPercentage) {
    var stepTR = null;
    
    if(nodeId != null) {
        var node = this.getProject().getNodeById(nodeId);
        
        //get the period that is currently selected
        var periodId = this.classroomMonitorPeriodIdSelected;
        
        //create the row
        var stepTR = $('<tr>').attr({id:'stepProgressTableRow_' + nodeId});
        
        //create the step title cell
        var stepTitleTD = $('<td>').attr({id:'stepProgressTableDataStepTitle_' + nodeId});
        stepTitleTD.text(stepTitle);
        
        //create the number of students on step cell
        var numberStudentsOnStepTD = $('<td>').attr({id:'stepProgressTableDataNumberOfStudentsOnStep_' + nodeId});

        if(numberOfStudentsOnStep == null) {
            numberOfStudentsOnStep = '';
        }
        
        //get the text that displays which students are on the step
        var studentsOnStepText = this.getStudentsOnStepText(nodeId, periodId);
        
        numberStudentsOnStepTD.text(numberOfStudentsOnStep);
        
        if(studentsOnStepText != null && studentsOnStepText != '') {
            //set the mouse over text to display the students that are on the step
            numberStudentsOnStepTD.attr('title', studentsOnStepText);
        }
        
        //create the completion percentage cell
        var completionPercentageTD = $('<td>').attr({id:'stepProgressTableDataCompletionPercentage_' + nodeId});
        
        //create the div that will contain the HR completion percentage bar
        var percentageBarDiv = $('<div>');
        percentageBarDiv.attr('id', 'stepProgressPercentageBarDiv_' + nodeId);
        percentageBarDiv.css('display', 'inline');
        percentageBarDiv.css('width', '75%');
        percentageBarDiv.css('float', 'left');
        
        //create the HR completion percentage bar
        var percentageBarHR = $('<hr>');
        percentageBarHR.attr('id', 'stepProgressPercentageBarHR_' + nodeId);
        percentageBarHR.attr('width', '0%');
        percentageBarHR.attr('size', 5);
        percentageBarHR.attr('color', 'black');
        percentageBarHR.attr('align', 'left');
        
        percentageBarDiv.append(percentageBarHR);
        
        //create the div that will contain the completion percentage number
        var percentageNumberDiv = $('<div>');
        percentageNumberDiv.attr('id', 'stepProgressPercentageNumberDiv_' + nodeId);
        percentageNumberDiv.css('display', 'inline');
        percentageNumberDiv.css('width', '25%');
        percentageNumberDiv.css('float', 'right');
        percentageNumberDiv.css('text-align', 'right');
        
        completionPercentageTD.append(percentageBarDiv);
        completionPercentageTD.append(percentageNumberDiv);

        //only show percentage completion for steps
        if(node != null && node.getType() != 'sequence') {
            //get the student statuses
            var studentStatuses = this.studentStatuses;
            
            //check if there are any student statuses in the array
            if(studentStatuses != null && studentStatuses.length > 0) {
                //there are student status objects so we will display the percentage
                percentageBarHR.attr('width', completionPercentage + '%');
                percentageNumberDiv.text(completionPercentage + '%');
                
                if(completionPercentage > 0) {
                    //show the percentage HR
                    percentageBarHR.css('display', '');
                } else {
                    /*
                     * the percentage is 0 so we will not display the HR. we need to hide
                     * the HR because even if the width is set to 0% it will still have a
                     * visible width which is misleading.
                     */
                    percentageBarHR.css('display', 'none');
                }
            } else {
                /*
                 * there are no student status objects which can mean a
                 * student has never loaded the vle or the run occurred before
                 * we implemented student statuses
                 */ 
                percentageBarHR.css('display', 'none');
                percentageNumberDiv.text('?');
                
                if(node.hasGradingView()) {
                    //this step is gradable
                    completionPercentageTD.attr('title', "This value is ? because of one of these reasons:\n1. Students have never loaded the project.\n2. This is an old run and we can't display the student completion percentage here due to technical reasons. You may still view student work if you click on this step row.");                   
                } else {
                    //this step is not gradable
                    completionPercentageTD.attr('title', "This value is ? because of one of these reasons:\n1. Students have never loaded the project.\n2. This is an old run and we can't display the student completion percentage here due to technical reasons.");
                }
            }           
        } else {
            //the node is an activity so we will not show the percentage bar HR
            percentageBarHR.css('display', 'none');
        }
        
        //add the cells to the row
        stepTR.append(stepTitleTD);
        stepTR.append(numberStudentsOnStepTD);
        stepTR.append(completionPercentageTD);
        
        var node = this.getProject().getNodeById(nodeId);
        
        //make gradable steps clickable
        if(node != null && node.isLeafNode() && node.hasGradingView()) {
            //create the params to be used when this the teacher clicks this row
            var stepRowClickedParams = {
                thisView:this,
                nodeId:nodeId
            }
            
            //set the function to be called when the row is clicked
            stepTR.click(stepRowClickedParams, this.stepRowClicked);
            
            //make the cursor turn into a hand when the user mouseovers the row
            stepTR.css('cursor', 'pointer');
            
            //set the mouse enter event to highlight the row on mouse over
            stepTR.mouseenter({thisView:this}, this.mouseEnterStepTR);
            
            //set the mouse leave event to remove the highlight when the mouse exits the row
            stepTR.mouseleave({thisView:this, nodeId:nodeId}, this.mouseLeaveStepTR);
        }
        
        //check if there are any students on the step
        var isStudentOnStep = this.isStudentOnlineAndOnStep(nodeId, periodId);
        
        if(isStudentOnStep) {
            //there is a student on the step so we will highlight the row green
            stepTR.css('background', 'limegreen');
        }
    }
    
    return stepTR;
};

/**
 * Get the text that will display the students that are on the step
 * and which of those are online and offline
 * @param nodeId the node id of the step
 * @param periodId (optional) the period id
 */
View.prototype.getStudentsOnStepText = function(nodeId, periodId) {
    var studentsOnStepText = '';
    
    if(periodId === null || periodId === 'all'){
        
    }
    
    if(periodId == null) {
        /*
         * the period id was not passed in so we will use the period id
         * that is currently selected in the UI
         */
        periodId = this.classroomMonitorPeriodIdSelected;
    }
    
    //get the students that are on the step
    var studentsOnStep = this.getStudentsOnStep(nodeId, periodId);
    
    if(studentsOnStep != null) {
        //get the students that are on the step and online
        var studentsOnline = studentsOnStep.studentsOnline;
        
        //get the students that are on the step and offline
        var studentsOffline = studentsOnStep.studentsOffline;
        
        if(studentsOnline != null) {
            
            if(studentsOnline.length > 0) {
                //there are students on the step and online
                studentsOnStepText += '[Online]\n';
            }
            
            //loop through all the students on the step and online
            for(var x=0; x<studentsOnline.length; x++) {
                var studentOnlineWorkgroupId = studentsOnline[x];
                
                //get the student names
                var studentNames = this.getUserAndClassInfo().getStudentNamesByWorkgroupId(studentOnlineWorkgroupId);
                
                if(studentNames != null) {
                    //add the student names to the online section
                    studentsOnStepText += studentNames.join(', ') + '\n';                       
                }
            }
        }
        
        if(studentsOffline != null) {
            
            if(studentsOffline.length > 0) {
                //add a line break if there is already text
                if(studentsOnStepText != '') {
                    studentsOnStepText += '\n';
                }
                
                //there are students on the step and offline
                studentsOnStepText += '[Offline]\n';
            }
            
            //loop through all the students on the step and offline
            for(var x=0; x<studentsOffline.length; x++) {
                var studentOfflineWorkgroupId = studentsOffline[x];
                
                //get the student names
                var studentNames = this.getUserAndClassInfo().getStudentNamesByWorkgroupId(studentOfflineWorkgroupId);
                
                if(studentNames != null) {
                    //add the student names to the offline section
                    studentsOnStepText += studentNames.join(', ') + '\n';                       
                }
            }
        }
    }
    
    return studentsOnStepText;
};

/**
 * The event that is fired when the mouse enters a student row
 */
View.prototype.mouseEnterStudentTR = function(event) {
    //highlight the row yellow
    $(this).css('background', 'yellow');
};

/**
 * The event that is fired when the mouse leaves a student row
 */
View.prototype.mouseLeaveStudentTR = function(event) {
    var thisView = event.data.thisView;
    var workgroupId = event.data.workgroupId;
    thisView.mouseLeaveStudentTRHandler($(this), workgroupId);
};

/**
 * The function that handles the logic when the mouse leaves a student row
 * @param trElement the row dom element
 * @param workgroupId the workgroup id
 */
View.prototype.mouseLeaveStudentTRHandler = function(trElement, workgroupId) {
    var studentOnline = false;
    
    if(workgroupId != null) {
        //check if the student is online
        if(this.isStudentOnline(workgroupId)) {
            studentOnline = true;
        }
    }
    
    if(studentOnline) {
        //the student is online so we will highlight the row green
        trElement.css('background', 'limegreen');
    } else {
        //the student is not online so we will not highlight the row
        trElement.css('background', '');        
    }
};

/**
 * The event that is fired when the mouse enters a step row
 */
View.prototype.mouseEnterStepTR = function(event) {
    //highlight the row yellow
    $(this).css('background', 'yellow');
};

/**
 * The event that is fired when the mouse leaves a step row
 */
View.prototype.mouseLeaveStepTR = function(event) {
    var thisView = event.data.thisView;
    var nodeId = event.data.nodeId;
    thisView.mouseLeaveStepTRHandler($(this), nodeId);
};

/**
 * The function that handles the logic when the mouse leaves a step row
 * @param trElement the row dom element
 * @param nodeId the step
 */
View.prototype.mouseLeaveStepTRHandler = function(trElement, nodeId) {
    //get the period that is currently selected
    var periodId = this.classroomMonitorPeriodIdSelected;
    
    //check if there are any students on the step
    var isStudentOnStep = this.isStudentOnlineAndOnStep(nodeId, periodId);
    
    if(isStudentOnStep) {
        //a student is on the step so we will highlight the row green
        trElement.css('background', 'limegreen');
    } else {
        //a student is not on the step so we will not highlight the row
        trElement.css('background', '');        
    }
};


/**
 * The function that is called when a student row is clicked
 * 
 * @param event the click event
 */
View.prototype.stepRowClicked = function(event) {
    var thisView = event.data.thisView;
    
    //the node id of the row that was clicked
    var nodeId = event.data.nodeId;
    
    //call the function to handle the click
    thisView.stepRowClickedHandler(nodeId);
};

/**
 * Called when a step row is clicked in the classroom monitor
 * 
 * @param nodeId the node id of the row that was clicked
 */
View.prototype.stepRowClickedHandler = function(nodeId) {
    // clear monitor view selection
    $('#monitorView > label').removeClass('active');
    
    //hide all the other displays
    this.hideAllDisplays();
    
    // show loading message
    $('#loading').show();
    
    //clear the nodeIdClicked and workgroupIdClicked values
    this.clearNodeIdClickedAndWorkgroupIdClicked();
    
    //remember the workgroup id the teacher is currently viewing
    this.nodeIdClicked = nodeId;
    
    //get the url for retrieving student data
    var getStudentDataUrl = this.getConfig().getConfigParam('getStudentDataUrl');
    
    var runId = this.getConfig().getConfigParam('runId'),
        grading = true,
        getRevisions = true,
        //get the workgroup ids in the run
        workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIds(),
        //join the workgroup ids into a single string delimited by ':'
        userIds = workgroupIds.join(':');
    
    var getStudentDataParams = {
        nodeIds:nodeId,
        userId:userIds,
        grading:true,
        runId:runId,
        getRevisions:true,
        useCachedWork:false
    }
    
    //make the request to retrieve the student data
    this.connectionManager.request('GET', 1, getStudentDataUrl, getStudentDataParams, this.getGradeByStepWorkInClassroomMonitorCallback, [this, nodeId], this.getStepWorkInClassroomMonitorCallbackFail);
};

/**
 * The success callback when retrieving student work
 * 
 * @param text the student work as text
 * @param xml 
 * @param args 
 */
View.prototype.getGradeByStepWorkInClassroomMonitorCallback = function(text, xml, args) {
    var thisView = args[0];
    var nodeId = args[1];

    //get the student work and do whatever we need to do with it
    thisView.getGradeByStepWorkInClassroomMonitorCallbackHandler(nodeId, text);
};

/**
 * Called when we successfully retrieve the student work
 * 
 * @param text the student work for the step
 */
View.prototype.getGradeByStepWorkInClassroomMonitorCallbackHandler = function(nodeId, text) {
    //get the student work as an array of node visits
    var vleStates = VLE_STATE.prototype.parseDataJSONString(text, true);
    
    //add the student work to the model
    this.model.addWorkByStep(nodeId, vleStates);
    
    //retrieve the annotations
    this.retrieveAnnotations('step', nodeId);
};

/**
 * The failure callback when trying to retrieve student work
 */
View.prototype.getGradeByStepWorkInClassroomMonitorCallbackFail = function(text, xml, args) {
    var thisView = args;
};

/**
 * Display the grade by step display
 * @param nodeId the node id
 */
View.prototype.displayGradeByStep = function(nodeId) {
    var view = this;
    
    // remember the step id the teacher is currently viewing
    this.classroomMonitorStepIdSelected = nodeId;
    
    // clear out selected workgroup id
    this.classroomMonitorWorkgroupIdSelected = null;
    
    // clear the grade by step table
    this.gradeByStepTable.clear();
    
    // clear the grade by student table
    this.gradeByStudentTable.clear();
    
    // clear the number of items to review because we will count them again for this workgroup
    this.numberOfItemsToReview = 0;
    
    // get the selected period
    periodSelected = this.classroomMonitorPeriodSelected;

    // update selected period in grade by step section
    if(periodSelected === 'all'){
        $('#gradeByStepTable_periodSelect').multiselect('select', '').multiselect('refresh');
    } else {
        $('#gradeByStepTable_periodSelect').multiselect('select', periodSelected).multiselect('refresh');
    }
    
    // update selected step
    $('#gradeByStepTable_stepSelect').multiselect('select', nodeId).multiselect('refresh');
    
    var stepTitle = '';
    if(nodeId != null) {
        // get the node
        var node = this.getProject().getNodeById(nodeId);
        
        if(node != null) {
            // get the node type
            var nodeType = node.type,
                // get the work for the step
                workForStep = this.model.getWorkByStep(nodeId),
                // get the step number and title
                stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId),
                stepTitle = view.getI18NString('stepTerm') + ' ' + stepNumberAndTitle,
                stepType = NodeFactory.nodeConstructors[nodeType].authoringToolName;
        }
    }
    
    //get the step prompt
    var prompt = this.getProject().getNodeById(nodeId).getPrompt();
    
    //clear the number of items to review because we will count them again for this step
    this.numberOfItemsToReview = 0;
    
    //get the workgroup ids in alphabetical order
    var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder(),
        position = 0;
    
    // loop through all the workgroup ids
    for(var x=0; x<workgroupIds.length; x++) {
        // get a workgroup id
        var workgroupId = workgroupIds[x],
            // get the period id
            periodName = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId);
        
        // check if workgroup is in selected period
        if(periodSelected === 'all' || periodSelected === periodName){
            // add the student work revisions for the current workgroup to the dataset
            view.insertNodeRevisions(nodeId, workgroupId, position, 'stepGrading');
        }
        ++position;
    }
    this.gradeByStepTable.draw();
    
    // insert the step name into grading header
    $('#gradeByStepName').text(stepTitle);
    $('#gradeByStepType').text('(' + stepType + ')');
    
    // set the number of items to review value
    $('#gradeByStepItemsToReview').text(view.getI18NStringWithParams('classroomMonitor_grading_itemsToReview',[this.numberOfItemsToReview]));
    this.numberOfItemsToReview > 0 ? $('#gradeByStepItemsToReview').fadeIn() : $('#gradeByStepItemsToReview').fadeOut();
    
    // insert prompt
    $('#promptContent').html(prompt);
    if(prompt && view.utils.isNonWSString(prompt)){
        $('#gradeByStepPromptWrap, #gradeByStepPromptToggle').show();
    } else {
        $('#gradeByStepPromptWrap, #gradeByStepPromptToggle').hide();
    }
    
    // hide loading message
    $('#loading').hide();
    
    //make the grade by step display visible
    this.showGradeByStepDisplay();
};

/**
 * The step drop down was changed
 * @param event the jquery event
 */
View.prototype.stepDropDownChanged = function(event) {
    var thisView = event.data.thisView;
    thisView.stepDropDownChangedHandler();
};

/**
 * Handles the step drop down changing
 */
View.prototype.stepDropDownChangedHandler = function() {
    //get the selected value of the drop down
    var nodeId = $('#stepDropDown').val();
    
    //display the step that was clicked
    this.stepRowClickedHandler(nodeId);
};

/**
 * The show prompt link was clicked
 * @param event the jquery event
 */
View.prototype.showPromptClicked = function(event) {
    var thisView = event.data.thisView;
    var nodeId = event.data.nodeId;
    thisView.showPromptClickedHandler(nodeId);
};

/**
 * Handles the show prompt link being clicked
 * @param nodeId the node id for the step prompt
 */
View.prototype.showPromptClickedHandler = function(nodeId) {
    //get the dom element ids
    var stepPromptTRId = this.escapeIdForJquery('stepPromptTR_' + nodeId);
    var showPromptLinkId = this.escapeIdForJquery('showPromptLink_' + nodeId);
    
    //check whether the prompt row is currently displayed or not
    var display = $('#' + stepPromptTRId).css('display');
    
    if(display == 'none') {
        /*
         * the prompt row is not displayed so we will display it and 
         * change the link text
         */
        $('#' + stepPromptTRId).show();
        $('#' + showPromptLinkId).text('Hide Prompt');
    } else {
        /*
         * the prompt row is being displayed so we will hide it and
         * change the link text
         */
        $('#' + stepPromptTRId).hide();
        $('#' + showPromptLinkId).text('Show Prompt');
    }
};


/**
 * Create the row to display work for a student
 * @param nodeId the node id
 * @param workgrouopId the workgroup id
 */
View.prototype.createGradeByStepDisplayTableRow = function(nodeId, workgroupId) {
    var gradeByStepDisplayTableRow = null;
    
    if(nodeId != null && workgroupId != null) {
        //get the student names
        var studentNames = this.userAndClassInfo.getStudentNamesByWorkgroupId(workgroupId);
        
        //get the period
        var period = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId);
        
        //get the period id
        var periodId = this.userAndClassInfo.getClassmatePeriodIdByWorkgroupId(workgroupId);

        //create the row
        gradeByStepDisplayTableRow = $('<tr>').attr('id', 'gradeByStepDisplayTableRow_' + nodeId);
        gradeByStepDisplayTableRow.addClass('gradeByStepRow');
        gradeByStepDisplayTableRow.addClass('gradeByStepRowPeriodId_' + periodId);
        
        if(this.classroomMonitorPeriodIdSelected != null && this.classroomMonitorPeriodIdSelected != 'all') {
            //we are filtering for a period
            
            if(this.classroomMonitorPeriodIdSelected != periodId) {
                //the period does not match the one that we want to show so we will hide this row
                gradeByStepDisplayTableRow.hide();              
            }
        }
        
        //create a table that will contain the grading rows
        var stepTable = $('<table>');
        stepTable.attr('id', 'stepTable_' + nodeId);
        stepTable.attr('border', '1px');
        stepTable.attr('cellpadding', '3px');
        stepTable.css('border-collapse', 'collapse');
        stepTable.css('width', '100%');
        stepTable.css('border-width', '2px');
        stepTable.css('border-style', 'solid');
        stepTable.css('border-color', 'black');
        
        //create the row and td for the student names
        var studentNamesTR = $('<tr>');

        /*
         * create the div that will show the green or red dot to show whether
         * the student is online
         */
        var isOnlineDiv = $('<div>');
        isOnlineDiv.attr('id', 'isOnlineDiv_' + workgroupId);
        isOnlineDiv.css('float', 'left');
        isOnlineDiv.css('width', '20px');
        isOnlineDiv.css('margin', '1px');
        isOnlineDiv.css('text-align', 'center');
        
        var isOnline = this.isStudentOnline(workgroupId);
        
        if(isOnline) {
            //the student is online
            isOnlineDiv.html(this.getIsOnlineHTML());
        } else {
            //the student is offline
            isOnlineDiv.html(this.getIsOfflineHTML());
        }
        
        //create the div to show the student names
        var studentNamesDiv = $('<div>');
        studentNamesDiv.css('float', 'left');
        studentNamesDiv.css('font-weight', 'bold');
        studentNamesDiv.html(studentNames.join(', '));
        studentNamesDiv.css('cursor', 'pointer');
        
        //highlight the user name yellow on mouse over
        studentNamesDiv.mouseenter({thisView:this}, function(event) {
            var thisView = event.data.thisView;
            thisView.highlightYellow(this);
        });
        
        //remove the highlight from the user name when mouse exits
        studentNamesDiv.mouseleave({thisView:this}, function(event) {
            var thisView = event.data.thisView;
            thisView.removeHighlight(this);
        });
        
        //create the params to be used when this the teacher clicks the student name
        var studentRowClickedParams = {
            thisView:this,
            workgroupId:workgroupId
        }
        
        //load the student grade by step view for the student
        studentNamesDiv.click(studentRowClickedParams, this.studentRowClicked);
        
        var studentNamesTD = $('<td>');
        studentNamesTD.append(isOnlineDiv);
        studentNamesTD.append(studentNamesDiv);
        
        studentNamesTR.append(studentNamesTD);
        
        //add the row to the table
        stepTable.append(studentNamesTR);
        
        //create the grading header row that contains the text "Student Work" and "Teacher Comment/Score"
        var headerTR = this.createGradingHeaderRow();
        
        //add the row to the table
        stepTable.append(headerTR);
        
        //get the work for this step for this student
        var vleStateForStepAndWorkgroupId = this.model.getWorkByStepAndWorkgroupId(nodeId, workgroupId);
        
        if(vleStateForStepAndWorkgroupId != null) {
            //get the node visits
            var nodeVisits = vleStateForStepAndWorkgroupId.getNodeVisitsWithWorkByNodeId(nodeId);
            
            //create the node visit rows
            this.createRowsForNodeVisits(nodeId, workgroupId, stepTable, nodeVisits);
        }
        
        //add the table to the row
        gradeByStepDisplayTableRow.append(stepTable);
    }

    return gradeByStepDisplayTableRow;
};

/**
 * Make a request to the server for all the student statuses for the run
 */
View.prototype.getStudentStatuses = function() {
    //get the student status url we will use to make the request
    var studentStatusUrl = this.getConfig().getConfigParam('studentStatusUrl');
    
    //get the run id
    var runId = this.getConfig().getConfigParam('runId');
    
    //get the project id and set preview link
    var projectId = this.getConfig().getConfigParam('projectId'),
        baseUrl = this.getConfig().getConfigParam('wiseBaseURL'),
        previewUrl = baseUrl + '/previewproject.html?projectId=' + projectId;
    $('#openProject').attr('href', previewUrl);
    
    $('#loading').css('z-index', '109');
    
    //create the params for the request
    var studentStatusParams = {
        runId:runId
    }
    
    if(studentStatusUrl != null) {
        //make the request to the server for the student statuses
        this.connectionManager.request('GET', 3, studentStatusUrl, studentStatusParams, this.getStudentStatusesCallback, this, this.getStudentStatusesFail, false, null);
    }
};

/**
 * The callback for getting the student statuses
 * @param responseText the student response JSONArray string
 * @param responseXML
 * @param view the view
 */
View.prototype.getStudentStatusesCallback = function(responseText, responseXML, view) {
    if(responseText != null) {
        //create the JSONArray from the response text
        var studentStatuses = JSON.parse(responseText);
        
        //loop through all the student statuses
        for(var x=0; x<studentStatuses.length; x++) {
            //get a student status
            var studentStatus = studentStatuses[x];
            
            /*
             * insert the current timestamp so we can calculate how long
             * the student has been on the current step they are on
             */
            view.insertTimestamp(studentStatus);
        }
        
        //set the student statuses into the view so we can access it later
        view.studentStatuses = studentStatuses;

        //create the array to keep track of the students that are online
        view.studentsOnline = [];
        
        //get the run status which will tell us which periods are paused
        view.getRunStatus();
    }
};

/**
 * The failure callback for getting the student statuses
 */
View.prototype.getStudentStatusesFail = function(responseText, responseXML, view) {
    
};

/**
 * Get the run status from the server
 */
View.prototype.getRunStatus = function() {
    //get the run status url we will use to make the request
    var runStatusUrl = this.getConfig().getConfigParam('runStatusUrl');
    
    //get the run id
    var runId = this.getConfig().getConfigParam('runId');
    
    //create the params for the request
    var runStatusParams = {
        runId:runId
    }
    
    if(runStatusUrl != null) {
        //make the request to the server for the student statuses
        this.connectionManager.request('GET', 3, runStatusUrl, runStatusParams, this.getRunStatusCallback, this, this.getRunStatusFail, false, null);
    }
};

/**
 * Create a local run status object to keep track of the run status
 */
View.prototype.createRunStatus = function() {
    var runStatus = {};
    
    //get the run id
    runStatus.runId = this.getConfig().getConfigParam('runId');
    
    //set this to default to not paused
    runStatus.allPeriodsPaused = false;
    
    //get all the periods objects
    var periods = this.getUserAndClassInfo().getPeriods();
    
    //loop through all the periods
    for(var x=0; x<periods.length; x++) {
        //get a period
        var period = periods[x];
        
        //set this to default to not paused
        period.paused = false;
    }
    
    //set the periods into the run status
    runStatus.periods = periods;
    
    //set the run status into the view so we can access it later
    this.runStatus = runStatus;
    
    return this.runStatus;
};

/**
 * Update our local run status with the new run status values
 * @param newRunStatus the new run status to update our values to
 */
View.prototype.updateRunStatus = function(newRunStatus) {
    //get our local copy of the run status
    var runStatus = this.runStatus;
    
    //get our periods
    var periods = runStatus.periods;
    
    if(newRunStatus != null) {
        //see if the new run status has all periods paused
        var newRunStatusAllPeriodsPaused = newRunStatus.allPeriodsPaused;
        
        if(newRunStatusAllPeriodsPaused != null) {
            //update the all periods paused in our local run status
            runStatus.allPeriodsPaused = newRunStatus.allPeriodsPaused;         
        }
        
        //get the periods from the new run status
        var newRunStatusPeriods = newRunStatus.periods;
        
        if(newRunStatusPeriods != null) {
            /*
             * loop through all the periods from the new run status and
             * update our local periods
             */
            for(var x=0; x<newRunStatusPeriods.length; x++) {
                //get a period from the new run status
                var newRunStatusPeriod = newRunStatusPeriods[x];
                
                //get the period id, period name, and whether the period is paused
                var newRunStatusPeriodPeriodId = newRunStatusPeriod.periodId;
                var newRunStatusPeriodPeriodName = newRunStatusPeriod.periodName;
                var newRunStatusPeriodPaused = newRunStatusPeriod.paused;
                
                //loop through all of our periods in our local run status
                for(var y=0; y<periods.length; y++) {
                    //get a period from our local run status
                    var period = periods[y];
                    
                    //get the period id
                    var periodId = period.periodId;
                    
                    //check if we have found the period that we need to update
                    if(periodId == newRunStatusPeriodPeriodId) {
                        //we have found the period we need to update
                        
                        //update the paused value
                        period.paused = newRunStatusPeriodPaused;
                    }
                }
            }
        }
    }
};

/**
 * Called when we have received the run status from the server
 * @param responseText
 * @param responseXML
 * @param view
 */
View.prototype.getRunStatusCallback = function(responseText, responseXML, view) {
    //get the run status from the server
    var newRunStatus = JSON.parse(responseText);
    
    if(newRunStatus != null) {
        //create a local run status object
        view.createRunStatus();
        
        //update our local run status object with the values from the new run status
        view.updateRunStatus(newRunStatus);
    }
    
    //start the web socket connection
    view.startWebSocketConnection();
    
    /*
     * create all of the UI for the classroom monitor now that we have
     * all the information we need
     */
    view.createClassroomMonitorDisplays();
};

/**
 * The failure callback for getting the student statuses
 */
View.prototype.getRunStatusFail = function(responseText, responseXML, view) {
    
};


/**
 * Get the student status object for a workgroup id
 * @param workgroup id the workgroup id
 * @return the student status with the given workgroup id
 */
View.prototype.getStudentStatusByWorkgroupId = function(workgroupId) {
    var studentStatus = null;
    
    //get the student statuses
    var studentStatuses = this.studentStatuses;
    
    if(studentStatuses != null) {
        //loop through all the student statuses
        for(var x=0; x<studentStatuses.length; x++) {
            //get a student status
            var tempStudentStatus = studentStatuses[x];
            
            if(tempStudentStatus != null) {
                //get the workgroup id for the student status
                var tempWorkgroupId = tempStudentStatus.workgroupId;
                
                //check if the workgroup id is the one we want
                if(workgroupId == tempWorkgroupId) {
                    //the workgroup id matches so we have found the student status we want
                    studentStatus = tempStudentStatus;
                    break;
                }
            }
        }
    }
    
    return studentStatus;
};

/**
 * Get the current step the given workgroup id is on
 * @param workgroupId the workgroup id
 * @return the current step the workgroup is on in the 
 * step number and title format e.g. '1.1: Introduction'
 */
View.prototype.getStudentCurrentStepByWorkgroupId = function(workgroupId) {
    var currentStep = '';
    
    //get the student statuses
    var studentStatuses = this.studentStatuses;

    if(studentStatuses != null) {
        //loop through all the student statuses
        for(var x=0; x<studentStatuses.length; x++) {
            //get a student status
            var tempStudentStatus = studentStatuses[x];
            
            if(tempStudentStatus != null) {
                //get the workgroup id
                var tempWorkgroupId = tempStudentStatus.workgroupId;
                
                //check if the workgroup matches the one we want
                if(workgroupId == tempWorkgroupId) {
                    //the workgroup id matches the one we want
                    var currentNodeId = tempStudentStatus.currentNodeId;
                    
                    if(currentNodeId != null) {
                        //get the step number and title
                        var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(currentNodeId);
                        
                        //remember the step number and title and break out of the loop
                        currentStep = stepNumberAndTitle;
                        break;                      
                    }
                }
            }
        }
    }
    
    return currentStep;
};

/**
 * This function is called when the teacher receives a websocket message
 * with messageType 'studentsOnlineList'.
 * Parses the list of students online and updates the UI accordingly
 * @param data the list of students that are online. this will be
 * an array of workgroup ids
 */
View.prototype.studentsOnlineListReceived = function(data) {
    //remove the loading message
    $('#selectDisplayButtonsDiv').text("");
    
    //get the list of workgroup ids that are online
    var studentsOnlineList = data.studentsOnlineList;
    
    /*
     * show the student progress display as the default screen to show
     * when the classroom monitor initially loads
     */
    //this.showStudentProgressDisplay();
    
    if(studentsOnlineList != null) {
        //loop through all the students online
        for(var x=0; x<studentsOnlineList.length; x++) {
            //get a workgroup id that is online
            var workgroupId = studentsOnlineList[x];
            
            //add the workgroup id to our list of online students
            this.addStudentOnline(workgroupId);
            
            //update the UI to show that the student is online
            this.updateStudentOnline(workgroupId, true);
            
            /*
             * update the timestamp for the student so we can start
             * calculating how long they have been on the current step
             */
            this.updateStudentProgressTimeSpent(workgroupId);
        }
    }
};

/**
 * This function is called when the teacher receives a websocket message
 * with messageType 'studentStatus'.
 * Parses the student status and updates the UI accordingly
 * @param data the student status object
 */
View.prototype.studentStatusReceived = function(data) {
    var runId = data.runId,
        periodId = data.periodId,
        workgroupId = data.workgroupId,
        currentNodeId = data.currentNodeId,
        previousNodeVisit = data.previousNodeVisit,
        nodeStatuses = data.nodeStatuses,
    
        //we will reset the time spent value to 0 since the student has just moved to a new step
        timeSpent = '0:00',
    
        //update our local copy of the student status object for the workgroup id
        studentStatusObject = this.updateStudentStatusObject(data);

    //get the annotation if any
    var annotation = data.annotation;
    
    //update the student progress row for the workgroup id
    this.updateStudentProgress(runId, periodId, workgroupId, currentNodeId, previousNodeVisit, nodeStatuses, timeSpent);
    
    //update the step progress for all steps and periods
    this.updateStepProgress();
    
    //check if we need to notify the teacher that there's new work for the screen they are viewing
    this.checkIfNeedToDisplayNewWorkNotification(data);
    
    if(annotation != null) {
        //analyze the annotation to see if we need to do anything special
        this.analyzeAnnotation(annotation, previousNodeVisit, workgroupId);
    }
};

/**
 * Analyze the annotation to see if we need to do anything special such
 * as notify the teacher that the student may need help
 * @param annotation the auto graded annotation
 * @param nodeVisit the student work
 * @param workgroupId the workgroup id
 */
View.prototype.analyzeAnnotation = function(annotation, nodeVisit, workgroupId) {
    if(annotation != null && nodeVisit != null) {
        //get the annotation value which is an array
        var value = annotation.value;
        
        if(value != null && value.length > 0) {
            //get the latest value
            var latestValue = value[value.length - 1];
            
            if(latestValue != null) {
                // get annotations and update scores for workgroup
                view.retrieveAnnotations('progress', workgroupId);
                
                //get the auto score
                var autoScore = latestValue.autoScore;
                
                //get the node id for the student work
                var nodeId = nodeVisit.nodeId;
                
                if(nodeId != null) {
                    //get the step node
                    var node = this.getProject().getNodeById(nodeId);
                    
                    if(node != null) {
                        //get the step content
                        var nodeContent = node.content.getContentJSON();
                        
                        //get the score at which we will alert the teacher
                        var alertTeacherScore = nodeContent.alertTeacherScore;
                        
                        if(alertTeacherScore != null) {
                            
                            /*
                             * check if the student has received a score less than or equal
                             * to the value for which we will alert the teacher
                             */
                            if(autoScore <= alertTeacherScore) {
                                //get the step number and title
                                var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
                                
                                //alert the teacher that the student may need attention
                                //alert("Student scored " + autoScore + " on step " + stepNumberAndTitle);
                            }                           
                        }
                    }
                }
            }
        }
    }
};

/**
 * Check if we need to notify the teacher if there's new work for the
 * screen they are viewing
 * @param studentStatus a student status object
 */
View.prototype.checkIfNeedToDisplayNewWorkNotification = function(studentStatus) {
    //get the workgroup id
    var workgroupId = studentStatus.workgroupId,
        // get the previous node visit
        previousNodeVisit = studentStatus.previousNodeVisit,
        view = this,
        $refreshButton = $('#newWork');
    
    if(previousNodeVisit != null) {
        //check if the student submitted any new work
        if(previousNodeVisit.nodeStates.length > 0) {
            // get the node id the work is for
            var nodeId = previousNodeVisit.nodeId,
                // get the period id
                periodId = studentStatus.periodId,
                periodName = '';
            
            //create the local run status object if necessary
            if(this.runStatus == null) {
                this.createRunStatus();
            }
            
            //get the local run status object
            var runStatus = this.runStatus,
                // get all the periods
                periods = runStatus.periods,
                i = periods.length;
            while(i--){
                if(periods[i].periodId === periodId){
                    periodName = periods[i].periodName;
                    break;
                }
            }

            //check if the workgroup id or node id matches the screen the teacher is viewing
            if(this.classroomMonitorPeriodSelected === 'all' || periodName === this.classroomMonitorPeriodSelected){
                if(this.classroomMonitorWorkgroupIdSelected !== null && this.classroomMonitorWorkgroupIdSelected === workgroupId) {
                    $refreshButton.show();
                    // reload grade by student display on refresh button press
                    $refreshButton.off('click').on('click', function(){
                        view.studentRowClickedHandler(view.classroomMonitorWorkgroupIdSelected);
                        $(this).fadeOut();
                    });
                } else if(this.classroomMonitorStepIdSelected !== null && this.classroomMonitorStepIdSelected === nodeId) {
                    $refreshButton.show();
                    // reload grade by step display on refresh button press
                    $refreshButton.off('click').on('click', function(){
                        view.stepRowClickedHandler(view.classroomMonitorStepIdSelected);
                        $(this).fadeOut();
                    });
                }
            }
        }
    }
};

/**
 * Update our local copy of the student status object for the given workgroup id
 * @param studentStatusObject the student status object to replace our
 * old copy. if we do not already have a student status object for the workgroup id,
 * we will add this new student status object.
 */
View.prototype.updateStudentStatusObject = function(studentStatusObject) {
    //get the student statuses
    var studentStatuses = this.studentStatuses;
    
    if(studentStatusObject != null) {
        //get the workgroup id
        var workgroupId = studentStatusObject.workgroupId;
        
        if(studentStatuses != null) {
            var foundWorkgroupId = false;
            
            //loop through all the student status objects
            for(var x=0; x<studentStatuses.length; x++) {
                //get a student status object
                var tempStudentStatus = studentStatuses[x];
                
                //get the workgroup id
                var tempWorkgroupId = tempStudentStatus.workgroupId;
                
                //check if the workgroup id matches the one we want
                if(workgroupId == tempWorkgroupId) {
                    //the workgroup id matches the one we want
                    
                    //insert the current timestamp into the object
                    this.insertTimestamp(studentStatusObject);
                    
                    //replace the old student status object with this new one
                    studentStatuses.splice(x, 1, studentStatusObject);
                    
                    foundWorkgroupId = true;
                }
            }
            
            if(!foundWorkgroupId) {
                /*
                 * we do not already have the student status object for the workgroup id
                 * so we will add this new student status object to the array
                 */
                
                //insert the current timestamp into the object
                this.insertTimestamp(studentStatusObject);
                
                //add the student status object to the array
                studentStatuses.push(studentStatusObject);
            }
        }       
    }
    
    return studentStatusObject;
};

/**
 * Insert the current timestamp into the student status object so we
 * can calculate how long the student has been on the current step
 * @param studentStatusObject the student status object
 */
View.prototype.insertTimestamp = function(studentStatusObject) {
    if(studentStatusObject != null) {
        //get the current timestamp
        var date = new Date(),
            timestamp = date.getTime();
        
        //set the timestamp into the object
        studentStatusObject.timestamp = timestamp;
    }
};

/**
 * Update the student progress values in the UI for a workgroup
 * @param runId the run id
 * @param periodId the period id
 * @param workgroupId the workgroup id
 * @param currentNodeId the current node id
 * @param previousNodeVisit the previous node visit
 * @param nodeStatuses the node statuses
 * @param timeSpent the amount of time the student has spent on the current step
 */
View.prototype.updateStudentProgress = function(runId, periodId, workgroupId, currentNodeId, previousNodeVisit, nodeStatuses, timeSpent) {
    //set the student to be online
    this.updateStudentOnline(workgroupId, true);
    
    //get and update the current step
    var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(currentNodeId);
    this.updateStudentCurrentStep(workgroupId, stepNumberAndTitle);
    this.updateStudentProgressTimeSpent(workgroupId);

    //get and update the student completion percentage
    var completionPercentage = this.calculateStudentCompletionForWorkgroupId(workgroupId);
    this.updateStudentCompletionPercentage(workgroupId, completionPercentage);
    
    //get and update the score
    var score = this.calculateStudentScoreForWorkgroupId(workgroupId);
    this.updateStudentScore(workgroupId, score);
    
    //update the idea basket count
    this.updateStudentIdeaBasketCount(workgroupId);
    
    // refresh DataTable
    this.studentProgressTable.draw();
};

/**
 * Retrieves and inserts workgroup scores into student progress view
 * @param workgroupId id of the workgroup to update (optional; default updates all)
 */ 
View.prototype.insertStudentScores = function(workgroupId){
    if(workgroupId != null){
        //get and update the score
        var score = this.calculateStudentScoreForWorkgroupId(workgroupId);
        this.updateStudentScore(workgroupId, score);
    } else {
        //get all the workgroup ids in the class
        var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder();
        
        if(workgroupIds != null) {
            //loop through all the workgroup ids
            for(var x=0; x<workgroupIds.length; x++) {
                //get a workgroup id
                var workgroupId = workgroupIds[x];
                
                //get and update the score
                var score = this.calculateStudentScoreForWorkgroupId(workgroupId);
                this.updateStudentScore(workgroupId, score);
            }
        }
    }
};

/**
 * Update the idea basket count for a student
 * @param workgroupId the workgroup id of the student
 */
View.prototype.updateStudentIdeaBasketCount = function(workgroupId) {
    if(workgroupId != null) {
        //get the student status object
        var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
        
        if(studentStatus != null) {
            //get the idea basket count from the student status
            var ideaBasketIdeaCount = studentStatus.ideaBasketIdeaCount;
            
            if(ideaBasketIdeaCount == null) {
                //there is no idea basket count in the student status
                $('#ideaBasketCount_' + workgroupId).text('?');
                $('#ideaBasketCount_' + workgroupId).attr('title', "This value is ? because of one of these reasons:\n1. The student has never loaded the project.\n2. This is an old run and we can't display the Idea Basket Count here due to technical reasons. You may still view this student's Idea Basket by clicking on this cell.");
            } else {
                //update the idea basket count
                $('#ideaBasketCount_' + workgroupId).text(ideaBasketIdeaCount);             
            }
        }       
    }
};

/**
 * Get the number of ideas in a student's basket
 * @param workgroupId the workgroup id we want the idea count from
 * @return the number of ideas the workgroup has in their basket
 */
View.prototype.getStudentIdeaBasketIdeaCount = function(workgroupId) {
    var ideaCount = null;
    
    if(workgroupId != null) {
        //get the student status object
        var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
        
        if(studentStatus != null) {
            //get the idea basket count from the student status
            ideaCount = studentStatus.ideaBasketIdeaCount;
        }       
    }
    
    return ideaCount;
}

/**
 * Update the percentage completion bar and number for a student
 * @param workgroupId the workgroup id
 * @param completionPercentage the completion percentage
 */
View.prototype.updateStudentCompletionPercentage = function(workgroupId, completionPercentage) {
    if(workgroupId != null && completionPercentage != null) {
        //get the project completion for the student
        var completionHtml = '<div class="progress" data-sort="' + completionPercentage + '">\
                <div class="progress-bar"  role="progressbar" aria-valuenow="' + completionPercentage + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + completionPercentage + '%">\
                <span class="sr-only">' + completionPercentage + '%</span></div></div>';
        
        // get DataTable, row, row data for workgroup
        var table = this.studentProgressTable,
            row = $('#studentProgress_' + workgroupId),
            data = table.row(row).data();
        // update time spent
        data.complete = completionPercentage;
        data.complete_html = completionHtml;
        // update DataTable
        table
            .row( row )
            .data( data );
    }
};

/**
 * Update the score for a student
 * @param workgroupId the workgroup id
 * @param score the student's score object
 */
View.prototype.updateStudentScore = function(workgroupId, score) {
    if(workgroupId != null && score != null) {
        var table = this.studentProgressTable,
            row = $('#studentProgress_' + workgroupId),
            data = table.row(row).data();
        // update score
        data.score = score.total + ' / ' + score.projectTotal;
        // update DataTable
        table
            .row( row )
            .data( data );
    }
};

/**
 * Update the current step workgroup is on
 * @param workgroupId the workgroup id
 * @param stepNumberAndTitle the step number and title
 */
View.prototype.updateStudentCurrentStep = function(workgroupId, stepNumberAndTitle) {
    if(workgroupId != null && this.utils.isNonWSString(stepNumberAndTitle)) {
        // get DataTable, row, row data for workgroup
        var table = this.studentProgressTable,
            row = $('#studentProgress_' + workgroupId),
            data = table.row(row).data();
        // update time spent
        data.current_step = stepNumberAndTitle;
        // update DataTable
        table
            .row( row )
            .data( data );
    }
};

/**
 * The function that will get called every once in a while 
 * to update the time spent values for students
 */
View.prototype.updateStudentProgressTimeSpentInterval = function() {
    //update all the student progress time spent values
    view.updateAllStudentProgressTimeSpent();
};

/**
 * Update all the student progress time spent values for all
 * students that are online
 */
View.prototype.updateAllStudentProgressTimeSpent = function() {
    //get the student statuses
    var studentStatuses = this.studentStatuses;
    
    if(studentStatuses != null) {
        //loop through all the student statuses
        for(var x=0; x<studentStatuses.length; x++) {
            //get a student status
            var tempStudentStatus = studentStatuses[x];
            
            //get the workgroup id
            var tempWorkgroupId = tempStudentStatus.workgroupId;
            
            //update the student progress time spent value if the student is online
            this.updateStudentProgressTimeSpent(tempWorkgroupId);
        }
    }
    
    // refresh DataTable
    this.studentProgressTable.draw();
};

/**
 * Update the student progress time spent value if the student is online
 * @param workgroupId the workgroup id to update the time spent
 */
View.prototype.updateStudentProgressTimeSpent = function(workgroupId) {
    
    if(workgroupId != null) {
        var timeSpentDisplay = '';
        
        //check if the student is online
        if(this.isStudentOnline(workgroupId)) {
            //the student is online
            
            //get the student status object
            var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
            
            if(studentStatus != null) {
                //get the timestamp for when the student posted the student status to the server (server time)
                var postTimestamp = studentStatus.postTimestamp;
                
                //get the timestamp for when the teacher requested the student status from the server (server time)
                var retrievalTimestamp = studentStatus.retrievalTimestamp;
                
                //get the timestamp for when the teacher received the student status (client time)
                var studentTimestamp = studentStatus.timestamp;
                
                //get the current timestamp (client time)
                var date = new Date();
                var timestamp = date.getTime();
                
                var postRetrievalTimeDifference = 0;
                
                if(postTimestamp != null && retrievalTimestamp != null) {
                    /*
                     * get the amount of time that passed between when the student
                     * posted the student status and when the teacher requested the
                     * student status using the server timestamps
                     */
                    postRetrievalTimeDifference = retrievalTimestamp - postTimestamp;
                    postRetrievalTimeDifference = parseInt(postRetrievalTimeDifference / 1000);
                }
                
                if(studentTimestamp != null) {
                    /*
                     * get the time difference between when the student status was received and
                     * the current time using client timestamps
                     */
                    var timeSpentMilliseconds = timestamp - studentTimestamp;
                    
                    //convert the time to seconds
                    var timeSpentSeconds = parseInt(timeSpentMilliseconds / 1000);
                    
                    /*
                     * add the time difference between when the student posted the student 
                     * status and when the teacher retrieved the student status. this value 
                     * will usually be 0 except when the teacher opens the classroom monitor
                     * after the student logs in.
                     * 
                     * case 1: student logs in while the teacher does not have the classroom monitor open.
                     * for example, if the student posts a student status, and then the teacher opens the
                     * classroom monitor 1 minute later, there will be a 60 second time difference
                     * between when the student posted the student status and when the teacher retrieved
                     * the student status. we will then add 60 seconds to the time spent because
                     * the timestamp - studentTimestamp value only takes into consideration the time
                     * the student has spent on the step after the teacher has opened the classroom monitor.
                     * we need to use these two time differences (server side difference and client side
                     * difference) because we can't assume server and client timestamps are synced.
                     * 
                     * case 2: student logs in while the teacher has the classroom monitor open.
                     * in this case the student will post the student status and the teacher
                     * will receive it immediately so there is essentially 0 time difference
                     */
                    timeSpentSeconds += postRetrievalTimeDifference;
                    
                    //get the number of hours, minutes, and seconds
                    var seconds = timeSpentSeconds % 60,
                        minutes = Math.floor(timeSpentSeconds / 60) % 60,
                        hours = Math.floor(minutes / 60);

                    //prepent '0's if necessary
                    if(seconds < 10) { seconds = '0' + seconds }
                    if (minutes < 10) { minutes = '0' + minutes}
                    if(hours > 0) {
                        if (hours < 10) { hours = '0' + hours}
                    } else {
                        hours  = '';
                    }
                
                    //create the time e.g. '1:32'
                    timeSpentDisplay = '<span class="fa fa-clock-o"></span> ' + minutes + ':' + seconds;
                }
            }
        }
        
        // get DataTable, row, row data for workgroup
        var table = this.studentProgressTable,
            row = $('#studentProgress_' + workgroupId),
            data = table.row(row).data();
        // update time spent
        data.time_spent = timeSpentDisplay;
        // update DataTable
        table
            .row( row )
            .data( data );
        table.draw();
    }
};

/**
 * Update all the step progress rows
 */
View.prototype.updateAllStepProgress = function() {
    
    //get the period that is currently selected
    //var periodId = this.classroomMonitorPeriodIdSelected;
    
    //recalculate the step progress for the period
    //this.showPeriodInStepProgressDisplay(periodId);
};

/**
 * Updates the step progress displays
 * @param nodes Array of node ids to update (optional)
 * @param periods Array of node ids to update (optional)
 */
View.prototype.updateStepProgress = function(nodes, periods){
    var view = this,
        // if no ids were passed in, update all nodes
        nodeIds = (nodes && nodes.length) ? nodes : this.getProject().getNodeIds(),
        i = nodeIds.length,
        table = this.stepProgressTable;
    
    while(i--){
        var nodeId = nodeIds[i],
            rows = $('.stepProgress_' + view.escapeIdForJquery(nodeId));
        rows.each(function(){
            var row = this,
                data = table.row(row).data(),
                periodId = data.period_id;
            
            if(!periods || !periods.length || periods.indexOf(periodId) > -1){
                // update students on step
                //get the number of students on this step in this period
                var studentsOnStep = view.getStudentsOnStep(nodeId, periodId),
                    numberOfStudentsOnStep = studentsOnStep.total,
                    studentsOnStepHtml = view.getStudentsOnStepHtml(numberOfStudentsOnStep, studentsOnStep.workgroups);
                data.students_on_step  = studentsOnStepHtml;
                if(numberOfStudentsOnStep > 0){
                    $(row).removeClass('offline').addClass('online');
                    data.DT_RowClass = $(row).attr('class');
                } else {
                    $(row).removeClass('online').addClass('offline');
                    data.DT_RowClass = $(row).attr('class');
                }
                
                // update step completion
                var complete = view.calculateStepCompletionForNodeId(nodeId, periodId);
                data.complete = complete;
                data.complete_html = view.getStepCompletionHtml(complete);
                
                // update DataTable
                table
                    .row( row )
                    .data( data );
            }
        });
    }
    
    // redraw DataTable
    table.draw();
};

/**
 * Update the number of students on step text
 * @param nodeId the node id for the step
 */
View.prototype.updateStudentsOnStepText = function(nodeId) {
    //get the currently selected period
    var periodId = this.classroomMonitorPeriodIdSelected;
    
    //get the text that will display which students are on this step and which are online and offline
    var studentsOnStepText = this.getStudentsOnStepText(nodeId, periodId);
    
    if(studentsOnStepText == null) {
        studentsOnStepText = '';
    }
    
    //get the id for the td we will update
    var numberStudentsOnStepTDId = this.escapeIdForJquery('stepProgressTableDataNumberOfStudentsOnStep_' + nodeId);
    
    //get the TD element
    var numberStudentsOnStepTD = $('#' + numberStudentsOnStepTDId);
    
    //update the title text that will display which students are on this step
    numberStudentsOnStepTD.attr('title', studentsOnStepText);
};

/**
 * Update all the step rows with necessary highlighting. We will highlight
 * a step row green if there are any students on that step.
 */
View.prototype.updateAllStepProgressHighlights = function() {
    //get all the step node ids in the project
    var nodeIds = this.getProject().getNodeIds();
    
    if(nodeIds != null) {
        //loop through all the steps
        for(var x=0; x<nodeIds.length; x++) {
            var nodeId = nodeIds[x];
            
            //highlight the row if necessary
            this.updateStepProgressHighlight(nodeId);
        }
    }
};

/**
 * Highlight the row if there are any students on the step
 * @param nodeId the node id for the step
 * @param periodId (optional) the period id that is currently selected
 */
View.prototype.updateStepProgressHighlight = function(nodeId, periodId) {
    if(periodId == null) {
        //get the currently selected period
        periodId = this.classroomMonitorPeriodIdSelected;
    }
    
    //check if there is a student that is online in this period that is on the step
    var isStudentOnStep = this.isStudentOnlineAndOnStep(nodeId, periodId);
    
    //get the id of the step progress row
    var stepProgressTableRowId = this.escapeIdForJquery('stepProgressTableRow_' + nodeId);
    
    //if there is a student online and on the step, we will highlight the row green
    if(isStudentOnStep) {
        //there is a student on the step
        $('#' + stepProgressTableRowId).css('background', 'limegreen');
    } else {
        //there are no students on the step
        $('#' + stepProgressTableRowId).css('background', '');
    }
};

/**
 * Update the percentage completion bar and number for a step
 * @param nodeId the node id
 * @param completionPercentage the completion percentage
 */
View.prototype.updateStepCompletionPercentage = function(nodeId, completionPercentage) {
    if(nodeId != null && completionPercentage != null) {
        /*
         * get the ids for the elements we are going to modify. we need to escape
         * the id because the node id has a . in it
         */
        var stepProgressPercentageBarHRId = this.escapeIdForJquery('stepProgressPercentageBarHR_' + nodeId);
        var stepProgressPercentageNumberId = this.escapeIdForJquery('stepProgressPercentageNumberDiv_' + nodeId);
        
        //update the percentage completion bar
        $('#' + stepProgressPercentageBarHRId).css('display', '');
        $('#' + stepProgressPercentageBarHRId).attr('width', completionPercentage + '%');
        
        if(completionPercentage > 0) {
            //show the percentage HR
            $('#' + stepProgressPercentageBarHRId).css('display', '');
        } else {
            /*
             * the percentage is 0 so we will not display the HR. we need to hide
             * the HR because even if the width is set to 0% it will still have a
             * visible width which is misleading.
             */
            $('#' + stepProgressPercentageBarHRId).css('display', 'none');
        }
        
        //update the percentage number value
        $('#' + stepProgressPercentageNumberId).text(completionPercentage + '%');
    }
};

/**
 * Calculate the project completion percentage for a student
 * @param workgroup id the workgroup id
 * @return the project completion percentage as an integer
 */
View.prototype.calculateStudentCompletionForWorkgroupId = function(workgroupId) {
    var result = 0;
    
    //get the student status for the workgroup id
    var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
    
    if(studentStatus != null) {
        //get the project completion percentage
        result = this.calculateStudentCompletionForStudentStatus(studentStatus);
    }
    
    return result;
};

/**
 * Calculate the total score for a student
 * @param workgroup id the workgroup id
 * @return the score as an object containing workgroup total score, total possible of graded
 * steps, total possible for project 
 */
View.prototype.calculateStudentScoreForWorkgroupId = function(workgroupId) {
    var result = {};
    
    //get all the ids for teacher and shared teachers
    var teacherIds = this.getUserAndClassInfo().getAllTeacherWorkgroupIds();

    //get the scores given to the student by the teachers
    var totalScoreAndTotalPossible = this.model.annotations.getTotalScoreAndTotalPossibleByToWorkgroupAndFromWorkgroups(workgroupId, teacherIds, view.maxScores);

    //get the total score for the workgroup
    var totalScoreForWorkgroup = totalScoreAndTotalPossible.totalScore;

    //get the max total score for the steps that were graded for this workgroup
    var totalPossibleForWorkgroup = totalScoreAndTotalPossible.totalPossible;

    //get the max total score for this project
    var totalPossibleForProject = view.getMaxScoreForProject();

    result.total = totalScoreForWorkgroup;
    result.gradedTotal = totalPossibleForWorkgroup;
    result.projectTotal = totalPossibleForProject;
    
    return result;
};

/**
 * Calculate the project completion percentage for the student status
 * @param studentStatus the student status to calculate the project 
 * completion percentage
 * @return the project completion percentage as an integer
 */
View.prototype.calculateStudentCompletionForStudentStatus = function(studentStatus) {
    var completedNumberSteps = 0;
    var totalNumberSteps = 0;
    
    if(studentStatus != null) {
        //get the node statuses
        var nodeStatuses = studentStatus.nodeStatuses;
        
        //get all the step node ids in the project
        var nodeIds = this.getProject().getNodeIds();
        
        if(nodeIds != null) {
            //loop through all the node ids
            for(var x=0; x<nodeIds.length; x++) {
                //get a node id
                var nodeId = nodeIds[x];
                
                //check if the student has completed the step
                if(this.isNodeCompleted(nodeId, nodeStatuses)) {
                    //the student has completed the step so we will update the counter
                    completedNumberSteps++;
                }
                
                //update the number of steps counter
                totalNumberSteps++;
            }
        }
    }
    
    //calculate the percentage as an integer
    var completionPercentage = completedNumberSteps / totalNumberSteps;
    completionPercentage = parseInt(100 * completionPercentage);
    
    return completionPercentage;
};

/**
 * Check if the student has completed the step
 * @param nodeId the node id of the step we want to check for completion
 * @param nodeStatuses the node statuses from a student
 * @return whether the student has completed the step or not
 */
View.prototype.isNodeCompleted = function(nodeId, nodeStatuses) {
    var result = false;
    
    if(nodeId != null && nodeStatuses != null) {
        //loop through all the node statuses
        for(var x=0; x<nodeStatuses.length; x++) {
            //get a node status object
            var tempNodeStatus = nodeStatuses[x];
            
            if(tempNodeStatus != null) {
                //get the node id
                var tempNodeId = tempNodeStatus.nodeId;
                
                //get all the statuses for the node
                var tempStatuses = tempNodeStatus.statuses;
                
                //check if the node id matches the one we want
                if(nodeId == tempNodeId) {
                    //the node id matches so we will get the 'isCompleted' status value
                    result = Node.prototype.getStatus('isCompleted', tempStatuses);
                    break;
                }
            }
        }
    }
    
    return result;
};

/**
 * Calculate the percentage of the class that has completed the step
 * @param nodeId the node id for the step
 * @param periodId the period id to get the step completion for. if this
 * parameter is null or 'all' we will calculate the step completion for
 * all periods.
 * @return the percentage of the class that has completed the step
 * as an integer
 */
View.prototype.calculateStepCompletionForNodeId = function(nodeId, periodId) {
    var numberStudentsCompleted = 0;
    var totalNumberStudents = 0;
    
    //get the number of students in the period
    totalNumberStudents = this.getNumberOfStudentsInPeriod(periodId);
    
    //get the number of students in the period that have completed the step
    numberStudentsCompleted = this.getNumberOfStudentsInPeriodThatCompletedStep(periodId, nodeId);
    
    //calculate the percentage as an integer
    var completionPercentage = numberStudentsCompleted / totalNumberStudents;
    completionPercentage = parseInt(100 * completionPercentage);
    
    return completionPercentage;
};

/**
 * Get the number of students in the period
 * @param periodId the period id. if this is null or 'all' we will
 * get the number of students in all the periods.
 * @return the number of students in the period
 */
View.prototype.getNumberOfStudentsInPeriod = function(periodId) {
    var numberOfStudentsInPeriod = 0;
    
    var userAndClassInfo = this.getUserAndClassInfo();
    
    if(userAndClassInfo != null) {
        //get the students in the run
        var classmateUserInfos = userAndClassInfo.getClassmateUserInfos();
        
        if(classmateUserInfos != null) {
            
            //loop through all the students in the run
            for(var x=0; x<classmateUserInfos.length; x++) {
                //get a student
                var classmateUserInfo = classmateUserInfos[x];
                
                //get the period id the student is in
                var tempPeriodId = classmateUserInfo.periodId;
                
                if(periodId == null || periodId == 'all') {
                    //we are getting the number of students in all the periods
                    numberOfStudentsInPeriod++;
                } else if(periodId == tempPeriodId) {
                    /*
                     * we are getting the number of students in a specific period
                     * and this student is in the period
                     */
                    numberOfStudentsInPeriod++;
                }
            }
        }
    }
    
    return numberOfStudentsInPeriod;
};

/**
 * Get the number of students in the period that have completed the step
 * @param periodId the period id. if this is null or 'all' we will get all periods.
 * @param nodeId the node id
 * @return the number of students in the period that have completed the step
 */
View.prototype.getNumberOfStudentsInPeriodThatCompletedStep = function(periodId, nodeId) {
    var numberOfStudentsInPeriodCompleted = 0;
    
    //get the user and class info
    var userAndClassInfo = this.getUserAndClassInfo();
    
    if(userAndClassInfo != null) {
        //get the students in the run
        var classmateUserInfos = userAndClassInfo.getClassmateUserInfos();
        
        if(classmateUserInfos != null) {
            //loop through all the students in the run
            for(var x=0; x<classmateUserInfos.length; x++) {
                //get a student
                var classmateUserInfo = classmateUserInfos[x];
                
                if(classmateUserInfo != null) {
                    //get the student workgroup id
                    var workgroupId = classmateUserInfo.workgroupId;
                    
                    //get the period id the student is in
                    var tempPeriodId = classmateUserInfo.periodId;
                    
                    if(periodId == null || periodId == 'all' || periodId == tempPeriodId) {
                        /*
                         * we are getting the number of students who have completed the step
                         * for all periods or if we are looking for a specific period and
                         * the student we are currently on is in that period
                         */
                        
                        //get the student status
                        var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
                        
                        if(studentStatus != null) {
                            //get the node statuses for the student
                            var nodeStatuses = studentStatus.nodeStatuses;
                            
                            //check if the student has completed the step
                            if(this.isNodeCompleted(nodeId, nodeStatuses)) {
                                //the student has completed the step so we will update the counter
                                numberOfStudentsInPeriodCompleted++;
                            }                           
                        }
                    }
                }
            }
        }
    }
    
    return numberOfStudentsInPeriodCompleted;
};

/**
 * Get the number of (online) workgroups on a step
 * 
 * @param nodeId the node id of the step
 * @param period id the period id. if this is null or 'all' we will get all periods.
 * @return Object with number of students on step (and online) and string array (of names in workgroups)
 * 
 * TODO: re-enable showing offline workgroups as well?
 */
View.prototype.getStudentsOnStep = function(nodeId, periodId) {
    var numberOfStudentsOnStep = 0,
        workgroups = [];
    
    //get the student statuses
    var studentStatuses = this.studentStatuses;
    
    if(studentStatuses !== null) {
        //loop through all the student statuses
        for(var x=0; x<studentStatuses.length; x++) {
            //get a student status
            var studentStatus = studentStatuses[x];
            
            if(studentStatus != null  && this.isStudentOnline(studentStatus.workgroupId)) {
                //get the period id the student is in
                var tempPeriodId = studentStatus.periodId;
                
                //get the current node id the student is on
                var currentNodeId = studentStatus.currentNodeId;
                
                //check if the student is in the period we want
                if(periodId === null || periodId === 'all' || periodId == tempPeriodId) {
                    //we want all periods or the student is in the period we want
                    
                    //check if the node id matches the one we want
                    if(nodeId == currentNodeId) {
                        //the node id matches so the student is on the step
                        numberOfStudentsOnStep++;
                        
                        //get the student names
                        var studentNames = view.getUserAndClassInfo().getStudentNamesByWorkgroupId(studentStatus.workgroupId);
                        
                        if(studentNames !== null) {
                            //add the student names to the workgroups array
                            workgroups.push(studentNames.join(', '));                       
                        }
                    }
                }
            }
        }
    }
    
    return {
        'total': numberOfStudentsOnStep,
        'workgroups': workgroups
    };
};

/**
 * This function is called when the teacher receives a websocket message
 * with messageType 'studentConnected'.
 * A student has connected to the web socket server so we will update
 * our list of online students and also update the UI accordingly.
 * @param data the web socket message that contains the user name
 * and workgroup id
 */
View.prototype.studentConnected = function(data) {
    if(data != null) {
        var userName = data.userName;
        var workgroupId = data.workgroupId;
        
        //add the student to our list of online students
        this.addStudentOnline(workgroupId);
        
        //update the UI to show the student is online
        this.updateStudentOnline(workgroupId, true);
    }
};

/**
 * This function is called when the teacher receives a websocket message
 * with messageType 'studentDisconnected'.
 * A student has disconnected from the web socket server so we will update
 * our list of online students and also update the UI accordingly.
 * @param data the web socket message that contains the user name
 * and workgroup id
 */
View.prototype.studentDisconnected = function(data) {
    if(data != null) {
        var userName = data.userName;
        var workgroupId = data.workgroupId;
        
        //remove the student from our list of online students
        this.removeStudentOnline(workgroupId);
        
        //update the UI to show the student is offline
        this.updateStudentOnline(workgroupId, false);
    }
};

/**
 * Add the student to our list of online students
 * @param workgroupId the workgroup id of the student that has come online
 */
View.prototype.addStudentOnline = function(workgroupId) {
    //initialize the students online array if necessary
    if(this.studentsOnline == null) {
        this.studentsOnline = [];
    }
    
    //check if the workgroup id already exists in the array
    if(this.studentsOnline.indexOf(workgroupId) == -1) {
        //the workgroup id does not already exist so we will add it
        this.studentsOnline.push(workgroupId);
    }
};

/**
 * Remove the student from our list of online students
 * @param workgroupId the workgroup id of the student that has gone offline
 */
View.prototype.removeStudentOnline = function(workgroupId) {
    //initialize the students online array if necessary
    if(this.studentsOnline == null) {
        this.studentsOnline = [];
    }
    
    //loop through all the students online
    for(var x=0; x<this.studentsOnline.length; x++) {
        //get a workgroup id
        var studentOnline = this.studentsOnline[x];
        
        //check if the workgroup id matches
        if(workgroupId == studentOnline) {
            //the workgroup id matches so we will remove it from the array
            this.studentsOnline.splice(x, 1);
            
            /*
             * set the counter back so we can continue looping through
             * the array in case the workgroup id occurs more than once
             */
            x--;
        }
    }
};

/**
 * Update the student online status in the UI
 * @param workgroupId the workgroup id
 * @param isOnline whether the student is online
 */
View.prototype.updateStudentOnline = function(workgroupId, isOnline) {
    if(workgroupId != null) {
        // get DataTable, row, row data for workgroup
        var table = this.studentProgressTable,
            row = $('#studentProgress_' + workgroupId),
            data = table.row(row).data(),
            rowClass = isOnline ? 'online' : 'offline',
            periodId = data.period_id;
        
        data.online = isOnline;
        data.online_html = this.getStudentOnlineHtml(isOnline);
        data.DT_RowClass = rowClass;
        
        // update DataTable
        table
            .row( row )
            .data( data );
        table.draw();
        
        //check if idea baskets are enabled for the run
        if(this.isIdeaBasketEnabled()) {
            //idea baskets are enabled
            
            //get the idea basket list table
            var ideaBasketListTable = $('#ideaBasketListTable');
            
            if(ideaBasketListTable != null) {
                //get the idea basket list data table
                var ideaBasketListTableDataTable = ideaBasketListTable.DataTable();
                
                if(ideaBasketListTableDataTable != null) {
                    //get the row for the workgroup in the idea basket list
                    var ideaBasketRow = $('#ideaBasketList_' + workgroupId);
                    
                    if(ideaBasketRow != null) {
                        //get the data in the row
                        var ideaBasketRowData = ideaBasketListTableDataTable.row(ideaBasketRow).data();
                        
                        if(ideaBasketRowData != null) {
                            //get the number of ideas the workgroup has in their basket
                            var ideaCount = this.getStudentIdeaBasketIdeaCount(workgroupId);
                            
                            //update the values of the row
                            ideaBasketRowData.online = isOnline;
                            ideaBasketRowData.online_html = this.getStudentOnlineHtml(isOnline);
                            ideaBasketRowData.idea_count = ideaCount;
                            ideaBasketRowData.DT_RowClass = rowClass;
                            
                            //update the row data
                            ideaBasketListTableDataTable.row(ideaBasketRow).data(ideaBasketRowData);
                            
                            //re-draw the table
                            ideaBasketListTableDataTable.draw();                            
                        }
                    }
                }
            }
        }
        
        // update number of online workgroups display
        var $online = $('#studentsOnline');
        $online.text(this.getI18NStringWithParams('classroomMonitor_workgroupsOnline', [this.studentsOnline.length]));
        this.studentsOnline.length ? $online.addClass('label-success') : $online.removeClass('label-success');
        
        // update step progress display
        this.updateStepProgress(null,[periodId]);
    }
};

/**
 * Check if the student is online
 * @param workgroupId the workgroup id of the student
 */
View.prototype.isStudentOnline = function(workgroupId) {
    var result = false;
    
    //initialize the students online array if necessary
    if(this.studentsOnline == null) {
        this.studentsOnline = [];
    }
    
    //check if the workgroup id is in the array
    if(this.studentsOnline.indexOf(workgroupId) != -1) {
        result = true;
    }
    
    return result;
};

/**
 * Send the run status back to the server to be saved in the db
 */
View.prototype.sendRunStatus = function(pauseMessage) {
    //get the run status url we will use to make the request
    var runStatusUrl = this.getConfig().getConfigParam('runStatusUrl');
    
    //get the run id
    var runId = this.getConfig().getConfigParam('runId');
    
    if(pauseMessage != null) {
        //set the pause message if one was provided
        this.runStatus.pauseMessage = pauseMessage;
    }
    
    //get the run status as a string
    var runStatus = JSON.stringify(this.runStatus);
    
    //encode the run status data
    runStatus = encodeURIComponent(runStatus);
    
    //create the params for the request
    var runStatusParams = {
        runId:runId,
        status:runStatus
    }
    
    if(runStatusUrl != null) {
        //make the request to the server for the student statuses
        this.connectionManager.request('POST', 3, runStatusUrl, runStatusParams, this.sendRunStatusCallback, this, this.sendRunStatusFail, false, null);
    }
};

/**
 * 
 */
View.prototype.sendRunStatusCallback = function(responseText, responseXML, view) {
    
};

/**
 * 
 */
View.prototype.sendRunStatusFail = function(responseText, responseXML, view) {
    
};

/**
 * Update the paused value for a period in our run status
 * @param periodId the period id
 * @param value whether the period is paused or not
 */
View.prototype.updatePausedRunStatusValue = function(periodId, value) {
    //create the local run status object if necessary
    if(this.runStatus == null) {
        this.createRunStatus();
    }
    
    //get the local run status object
    var runStatus = this.runStatus;
    
    if(periodId == null || periodId == 'all') {
        //we are updating the all periods value
        runStatus.allPeriodsPaused = value;
        
        //set all the periods to the value as well
        this.setAllPeriodsPaused(value);
    } else {
        //we are updating a specific period
        
        //get all the periods
        var periods = runStatus.periods;
        
        if(periods != null) {
            //loop through all the periods
            for(var x=0; x<periods.length; x++) {
                //get a period
                var tempPeriod = periods[x];
                
                //get the period id
                var tempPeriodId = tempPeriod.periodId;
                
                //check if the period id matches the one we need to update
                if(periodId == tempPeriodId) {
                    //we have found the period we want to update
                    tempPeriod.paused = value;
                }
            }           
        }
    }
};

/**
 * Set all the periods to be paused or not
 * @param isPaused boolean value that specifies if the periods are paused or not
 */
View.prototype.setAllPeriodsPaused = function(isPaused) {
    //create the local run status object if necessary
    if(this.runStatus == null) {
        this.createRunStatus();
    }
    
    //get the local run status object
    var runStatus = this.runStatus;
    
    //get all the periods
    var periods = runStatus.periods;
    
    if(periods != null) {
        //loop through all the peridos
        for(var x=0; x<periods.length; x++) {
            //get a period
            var tempPeriod = periods[x];

            //set the period to be paused or not
            tempPeriod.paused = isPaused;
        }           
    }
};

/**
 * Check if a period is paused
 * @param periodId the period id
 */
View.prototype.isPeriodPaused = function(periodId) {
    //we will default to not paused
    var paused = false;
    
    //create the local run status object if necessary
    if(this.runStatus == null) {
        this.createRunStatus();
    }
    
    //get the run status
    var runStatus = this.runStatus;
    
    if(periodId == null || periodId == 'all') {
        //we want to check if all periods are paused
        
        //check if our local run status object has the allPeriodsPaused value
        if(runStatus.allPeriodsPaused != null) {
            //get whether all periods are paused
            paused = runStatus.allPeriodsPaused;
        }
    } else {
        //we want to check if a specific period is paused
        
        //get all the periods
        var periods = runStatus.periods;
        
        if(periods != null) {
            //loop through all the periods
            for(var x=0; x<periods.length; x++) {
                //get the period
                var tempPeriod = periods[x];
                
                //get the period id
                var tempPeriodId = tempPeriod.periodId;
                
                //check if this is the period id we are looking for
                if(periodId == tempPeriodId) {
                    /*
                     * we have found the period we are looking for so we will get
                     * whether it is paused or not
                     */
                    paused = tempPeriod.paused;
                }
            }
        }
    }

    return paused;
};

/**
 * Updates the pause screens status
 */
View.prototype.updatePauseScreens = function(){
    var msg = $('#pauseMsg').val(),
        selected = $('#pauseSelectPeriods').val(),
        numSelected = selected ? selected.length : 0;
    $('#pauseSelectPeriods > option').each(function(){
        var periodId = $(this).val().replace(/^pause_/,''),
            pauseMode = $(this).prop('selected');
        if(periodId !== 'all'){
            // pause or un-pause screens in the period
            pauseMode ? view.pauseScreens(periodId, msg) : view.unPauseScreens(periodId);
        }
    });
};

/**
 * We have received a pause screen websocket message so we will 
 * update our local run status object as well as our UI to
 * reflect the period becoming paused or not
 */
View.prototype.pauseScreenReceived = function(data) {
    if(data != null) {
        //get a period id
        var periodId = data.periodId;
        
        //if period id is null we will treat it as all periods
        if(periodId == null) {
            periodId = 'all';
        }
        
        //get the message type
        var messageType = data.messageType;
        
        if(messageType != null) {
            
            var isPaused = false;
            
            if(messageType == 'pauseScreen') {
                //the message is to pause the student screen
                isPaused = true;
            } else if(messageType == 'unPauseScreen') {
                //the message is to unpause the student screens
                isPaused = false;
            }
            
            //update the run status value for the period
            this.updatePausedRunStatusValue(periodId, isPaused);
            
            if(isPaused) {
                //set the period as paused
                $('#pauseSelectPeriods').multiselect('select', 'pause_' + periodId);
                $('#pauseMsg').val(data.pauseMessage);
            } else {
                //set the period as un-paused
                $('#pauseSelectPeriods').multiselect('deselect', 'pause_' + periodId);
            }
            
            // refresh pause screens display
            $('#pauseSelectPeriods').multiselect('refresh');
            if($('#pauseSelectPeriods').val()){
                $('#pauseControls').removeClass('btn-default').addClass('btn-danger');
                //$('#pauseState').text(view.getI18NString('classroomMonitor_pause_on'));
            } else {
                $('#pauseControls').removeClass('btn-danger').addClass('btn-default');
                //$('#pauseState').text(view.getI18NString('classroomMonitor_pause_off'));
            }
        }
    }
};

/**
 * Create the grade by student display
 */
View.prototype.createGradeByStudentDisplay = function() {
    var view = this,
        table = $('#gradeByStudentTable');
    
    // initialize dataTable
    table.dataTable( {
        'paging': false,
        'dom': '<"dataTables_top"lf><"clearfix">rt<"dataTables_bottom"ip><"clear">',
        'language': {
            'search': '',
            'info': view.getI18NStringWithParams('classroomMonitor_tableInfoText', ['_TOTAL_']),
            'infoFiltered': ''
        },
        'order': [ 8, 'asc' ],
        'columnDefs': [
            { 'orderSequence': [ 'desc' ], 'targets': [ 4, 7 ] },
            { 'orderData': [ 0 ], 'targets': [ 8 ] },
            { 'orderData': [ 7 ], 'targets': [ 9 ] },
            { 'searchable': false, 'targets': [ 0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 12 ] },
            { 'visible': false, 'targets': [ 0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12 ] }
        ],
        'footerCallback': function ( row, data, start, end, display ) {
            // show total student score
            /*var api = this.api(),
                pageTotal = 0,
    
                // Get total completion over current page
                data = api
                    .column( 5, { page: 'current'} )
                    .data();
            
            if(data.length){
                pageTotal = data.reduce( function (pVal, cVal) {
                    return pVal*1 + cVal*1;
                } )
            }
            var numVals = api.column( 5, { page: 'current'} ).data().length;
            pageTotal = numVals ? pageTotal/numVals : 0;
            
            // Update footer
            $( api.column( 6 ).footer() ).html(
                '<div class="progress">\
                <div class="progress-bar"  role="progressbar" aria-valuenow="' + pageTotal + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + pageTotal + '%">\
                <span class="sr-only">' + pageTotal + '% Complete</span></div></div>'
            );*/
        },
        'initComplete': function( settings, json ) {
            $('.dataTables_filter input[type="search"]', $('#gradeByStudent')).attr('placeholder', view.getI18NString('classroomMonitor_grading_search'));
        },
        'drawCallback': function( settings ) {
            // add headers for step groupings
            var api = this.api(),
                rows = api.rows().nodes(),
                last = null;
 
            api.column(2).data().each( function ( group, i ) {
                if ( last !== group ) {
                    var nodeId = api.cell(i, 1).data();
                    $(rows).eq( i ).before(
                        '<tr class="group-spacer"><td colspan="14"></td></tr>\
                        <tr class="group" data-nodetitle="' + group + '"><td colspan="14"><a href="javascript:void(0);" data-nodeid="' + nodeId + '">'+group+'</a></td></tr>'
                    );
                    last = group;
                }
            } );
            
            var $headers = $('.group', table),
                i = 1000;
            
            $headers.each(function(){
                $('a', $(this)).off('click').on('click', function(){
                    view.stepRowClickedHandler($(this).data('nodeid'));
                });
                
                var total = 0,
                    nodeTitle = $(this).data('nodetitle'),
                    $header = $(this);
                $header.data('zindex', i);
                api.column(2).data().each( function (val, i) {
                    if (val === nodeTitle) { ++total; }
                });
                
                $('[data-stepname="' + nodeTitle + '"]', table).each(function(){
                    if($(this).hasClass('new')){
                        $header.addClass('new');
                        return false;
                    }
                });
                
                if(total > 1){
                    var $toggleLink = $('<a class="toggle-revisions pull-right label">' + view.getI18NStringWithParams('classroomMonitor_grading_revisionsCount', [total-1]) + ' <span class="fa fa-plus-square-o"></span></a>');
                    $('td', $(this)).append($toggleLink);
                    $toggleLink.off('click').on('click', function(){
                        var show = true;
                        if($(this).hasClass('visible')){
                            $(this).removeClass('visible');
                            $('.fa', $(this)).addClass('fa-plus-square-o');
                            $('.fa', $(this)).removeClass('fa-minus-square-o');
                            show = false;
                        } else {
                            $(this).addClass('visible');
                            $('.fa', $(this)).removeClass('fa-plus-square-o');
                            $('.fa', $(this)).addClass('fa-minus-square-o');
                        }
                        var $revisions = $('.revision[data-stepname="' + nodeTitle + '"]', table);
                        show ? $revisions.show() : $revisions.hide();
                        
                        if(show){
                            var top = $($revisions[0]).offset().top - 125;
                            $('body,html').animate({scrollTop: top}, '500');
                        }
                    });
                }
                ++i;
            });
            
            // disable all input elements for non-gradable rows
            //$('.revision, .no-work', table).find('.score, .comment').prop('disabled', true);
            
            view.redrawFixedHeaders(true);
            //view.bsPopover($('.bs-popover', table), {trigger: 'hover click focus', html: true, placement: 'right auto'});
            //view.bsTooltip($('.workgroups-online', table), { html: true, placement: 'left' });
        }
    } );
    
    table.dataTable().fnFilterOnReturnGrading();
    
    this.fixedHeaders.push(new $.fn.dataTable.FixedHeader( table.dataTable() , {
        'offsetTop': 90
    }));
    view.redrawFixedHeaders();
    
    // create view object for future api access
    this.gradeByStudentTable = table.DataTable();
    
    // add period filter and header text
    var $wrapper = $('#gradeByStudentTable_wrapper');
    this.addSectionHeader(table, $wrapper, view.getI18NString('classroomMonitor_gradeByStudent_title'), { 'view': 'studentGrading' });
    
    // add grade by student sub-header
    $('.dataTables_top', $wrapper).append($('<div class="clearfix">'));
    
    // add workgroup details hedaer
    $workgroupHeader = $('<div class="datatables-subheader">');
    $('.dataTables_top', $wrapper).append($workgroupHeader);
    $workgroupInfo = $('<div class="pull-left workgroup-info">');
    $workgroupHeader.append($workgroupInfo);
    
    // add workgroup names holder
    $workgroupInfo.append('<span id="gradeByStudentNames" class="workgroup-names"></span> <span id="gradeByStudentWorkgroupId" class="small"></span>');
    // add items to review display
    $workgroupInfo.append('<span id="gradeByStudentItemsToReview" class="review-items label label-success"></span>');
    
    /*$displayTools = $('<div class="pull-right">');
    // add display options multiselect
    var $displayOptions = $('<select id="gradeByStudentOptions" multiple="multiple" disabled>');
    $displayOptions.append('<option name="gradeByStudentOptions" value="newOnly">' + view.getI18NString('classroomMonitor_newItemsOnly') + '</option>');
    $displayOptions.append('<option name="gradeByStudentOptions" value="flagOnly">' + view.getI18NString('classroomMonitor_grading_flagOnly') + '</option>');
    $displayOptions.append('<option name="gradeByStudentOptions" value="hidePersonal">' + view.getI18NString('classroomMonitor_hidePersonalInfo') + '</option>');
    
    $workgroupHeader.append($displayTools);
    $displayTools.append('<label for="gradeByStudentOptions">' + view.getI18NString('classroomMonitor_grading_options_label') + '</label> ');
    $displayTools.append($displayOptions);
    
    $displayOptions.multiselect({
        buttonText: view.multiselectButtonText,
        dropRight: true,
        nonSelectedText: view.getI18NString('classroomMonitor_grading_options_select'),
        buttonClass: 'btn btn-default btn-sm',
        numberDisplayed: 1,
        onChange: function(){
            
        }
    });*/
    
    $('.dataTables_top', $wrapper).append($('<div class="clearfix">'));
}

/**
 * Create the step work display
 */
View.prototype.createGradeByStepDisplay = function() {
    var view = this,
        table = $('#gradeByStepTable');
    
    // initialize dataTable
    table.dataTable( {
        'paging': false,
        'dom': '<"dataTables_top"lf><"clearfix">rt<"dataTables_bottom"ip><"clear">',
        'language': {
            'search': '',
            'info': view.getI18NStringWithParams('classroomMonitor_tableInfoText', ['_TOTAL_']),
            'infoFiltered': ''
        },
        'order': [ 8, 'asc' ],
        'columnDefs': [
            { 'orderSequence': [ 'desc' ], 'targets': [ 4, 7 ] },
            { 'orderData': [ 0 ], 'targets': [ 8 ] },
            { 'orderData': [ 7 ], 'targets': [ 9 ] },
            { 'searchable': false, 'targets': [ 0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 12 ] },
            { 'visible': false, 'targets': [ 0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12 ] }
        ],
        'footerCallback': function ( row, data, start, end, display ) {
            // show total step score
            /*var api = this.api(),
                pageTotal = 0,
    
                // Get total completion over current page
                data = api
                    .column( 5, { page: 'current'} )
                    .data();
            
            if(data.length){
                pageTotal = data.reduce( function (pVal, cVal) {
                    return pVal*1 + cVal*1;
                } )
            }
            var numVals = api.column( 5, { page: 'current'} ).data().length;
            pageTotal = numVals ? pageTotal/numVals : 0;
            
            // Update footer
            $( api.column( 6 ).footer() ).html(
                '<div class="progress">\
                <div class="progress-bar"  role="progressbar" aria-valuenow="' + pageTotal + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + pageTotal + '%">\
                <span class="sr-only">' + pageTotal + '% Complete</span></div></div>'
            );*/
        },
        'initComplete': function( settings, json ) {
            $('.dataTables_filter input[type="search"]', $('#gradeByStep')).attr('placeholder', view.getI18NString('classroomMonitor_grading_search'));
        },
        'drawCallback': function( settings ) {
            // add headers for step groupings
            var api = this.api(),
                rows = api.rows().nodes(),
                last = null;
    
            api.column(2).data().each( function ( group, i ) {
                if ( last !== group ) {
                    var workgroupId = api.cell(i, 1).data();
                    $(rows).eq( i ).before(
                        '<tr class="group-spacer"><td colspan="14"></td></tr>\
                        <tr class="group" data-workgroup="' + group + '"><td colspan="14"><a href="javascript:void(0);" data-workgroupid="' + workgroupId + '">'+group+'</a></td></tr>'
                    );
                    last = group;
                }
            } );
            
            var $headers = $('.group', table),
                i = 1000;
            
            $headers.each(function(){
                $('a', $(this)).off('click').on('click', function(){
                    view.studentRowClickedHandler($(this).data('workgroupid'));
                });
                
                var total = 0,
                    workgroup = $(this).data('workgroup'),
                    $header = $(this);
                $header.data('zindex', i);
                api.column(2).data().each( function (val, i) {
                    if (val === workgroup) { ++total; }
                });
                
                $('[data-workgroup="' + workgroup + '"]', table).each(function(){
                    if($(this).hasClass('new')){
                        $header.addClass('new');
                        return false;
                    }
                });
                
                if(total > 1){
                    var $toggleLink = $('<a class="toggle-revisions pull-right label">' + view.getI18NStringWithParams('classroomMonitor_grading_revisionsCount', [total-1]) + ' <span class="fa fa-plus-square-o"></span></a>');
                    $('td', $(this)).append($toggleLink);
                    $toggleLink.off('click').on('click', function(){
                        var show = true;
                        if($(this).hasClass('visible')){
                            $(this).removeClass('visible');
                            $('.fa', $(this)).addClass('fa-plus-square-o');
                            $('.fa', $(this)).removeClass('fa-minus-square-o');
                            show = false;
                        } else {
                            $(this).addClass('visible');
                            $('.fa', $(this)).removeClass('fa-plus-square-o');
                            $('.fa', $(this)).addClass('fa-minus-square-o');
                        }
                        var $revisions = $('.revision[data-workgroup="' + workgroup + '"]', table);
                        show ? $revisions.show() : $revisions.hide();
                        
                        if(show){
                            var top = $($revisions[0]).offset().top - 125;
                            $('body,html').animate({scrollTop: top}, '500');
                        }
                    });
                }
                ++i;
            });
            
            // disable all input elements for non-gradable rows
            //$('.revision, .no-work', table).find('.score, .comment').prop('disabled', true);
            
            view.redrawFixedHeaders(true);
            //view.bsPopover($('.bs-popover', table), {trigger: 'hover click focus', html: true, placement: 'right auto'});
            //view.bsTooltip($('.workgroups-online', table), { html: true, placement: 'left' });
        }
    } );
    
    table.dataTable().fnFilterOnReturnGrading();
    
    this.fixedHeaders.push(new $.fn.dataTable.FixedHeader( table.dataTable() , {
        'offsetTop': 90
    }));
    view.redrawFixedHeaders();
    
    // create view object for future api access
    this.gradeByStepTable = table.DataTable();
    
    // add period filter and header text
    var $wrapper = $('#gradeByStepTable_wrapper');
    this.addSectionHeader(table, $wrapper, view.getI18NString('classroomMonitor_gradeByStep_title'), { 'view': 'stepGrading' });
    
    // add grade by step sub-header
    $('.dataTables_top', $wrapper).append($('<div class="clearfix">'));
    
    // add step details hedaer
    $stepHeader = $('<div class="datatables-subheader">');
    $('.dataTables_top', $wrapper).append($stepHeader);
    $stepInfo = $('<div class="pull-left step-info">');
    $stepHeader.append($stepInfo);
    
    // add step name holder
    $stepInfo.append('<span id="gradeByStepName" class="step-name"></span>');
    // add step type holder
    $stepInfo.append(' <span id="gradeByStepType" class="small"></span>');
    // add items to review display
    $stepInfo.append('<span id="gradeByStepItemsToReview" class="review-items label label-success"></span>');
    
    /*$displayTools = $('<div class="pull-right">');
    // add display options multiselect
    var $displayOptions = $('<select id="gradeByStepOptions" multiple="multiple"> disabled');
    $displayOptions.append('<option name="gradeByStepOptions" value="newOnly">' + view.getI18NString('classroomMonitor_newItemsOnly') + '</option>');
    $displayOptions.append('<option name="gradeByStepOptions" value="flagOnly">' + view.getI18NString('classroomMonitor_grading_flagOnly') + '</option>');
    $displayOptions.append('<option name="gradeByStepOptions" value="hidePersonal">' + view.getI18NString('classroomMonitor_hidePersonalInfo') + '</option>');
    
    $stepHeader.append($displayTools);
    $displayTools.append('<label for="gradeByStepOptions">' + view.getI18NString('classroomMonitor_grading_options_label') + '</label> ');
    $displayTools.append($displayOptions);
    
    $displayOptions.multiselect({
        buttonText: view.multiselectButtonText,
        dropRight: true,
        nonSelectedText: view.getI18NString('classroomMonitor_grading_options_select'),
        buttonClass: 'btn btn-default btn-sm',
        numberDisplayed: 1,
        onChange: function(){
            
        }
    });*/
    
    var promptTerm = view.getI18NString('promptTerm');
    $promptToggle  = $('<a href="javascript:void(0);" id="gradeByStepPromptToggle">' + promptTerm + ' +</a>').on('click', function(){
        $('#gradeByStepPrompt').slideToggle('fast', function(){
            if($(this).is(':visible')){
                $promptToggle.text(promptTerm + ' -');
            } else {
                $promptToggle.text(promptTerm + ' +');
            }
            
            view.redrawFixedHeaders(true);
        })
    });
    $('#gradeByStepItemsToReview').after($promptToggle);
    
    var $promptDisplay = $('<div id="gradeByStepPrompt">');
    $promptDisplay
        .append('<div id="gradeByStepPromptWrap" class="well"><div id="promptContent"></div></div>');
    
    $('.dataTables_top', $wrapper)
        .append($('<div class="clearfix">'))
        .append($promptDisplay);
}

/**
 * Retrieve all the annotations for this run
 * @param mode the display to load after we retrieve the annotations
 * the value will either be 'student', 'step', or 'progress'
 * @param id the node id or workgroup id (optional for 'progress' mode)
 */
View.prototype.retrieveAnnotations = function(mode, id) {
    var async = (mode === 'progress') ? true : false;
    this.connectionManager.request('GET', 1, this.getConfig().getConfigParam('getAnnotationsUrl'), null, this.retrieveAnnotationsCallback, [this, mode, id], null, async);
};

/**
 * The callback function for retrieving annotations
 * @param text the annotations in JSON string format
 * @param xml
 * @param the args that we passed to the request
 */
View.prototype.retrieveAnnotationsCallback = function(text, xml, args) {
    var thisView = args[0];
    var mode = args[1];
    var id = args[2];
    
    thisView.retrieveAnnotationsCallbackHandler(text, mode, id);
};

/**
 * The function that handles the logic when the retrieve annotations callback
 * is called
 */
View.prototype.retrieveAnnotationsCallbackHandler = function(annotationsJSONString, mode, id) {
    // set the annotations
    this.model.setAnnotations(Annotations.prototype.parseDataJSONString(annotationsJSONString));
    
    if(mode === 'student') {
        // display the grade by student display
        this.displayGradeByStudent(id); 
    } else if(mode === 'step') {
        // display the grade by step display
        this.displayGradeByStep(id);
    } else if(mode === 'progress') {
        // add scores to student progress display
        this.insertStudentScores(id);
    }
    
    eventManager.fire("retrieveAnnotationsCompleted");
};

/**
 * Remove everything in the display specific buttons div
 */
View.prototype.clearDisplaySpecificButtonsDiv = function() {
    $('#displaySpecificButtonsDiv').html('');
};

/**
 * Remove everything in the save button div
 */
View.prototype.clearSaveButtonDiv = function() {
    $('#saveButtonDiv').html('');
};

/**
 * Remove everything in the new work notification div
 */
View.prototype.clearNewWorkNotificationDiv = function() {
    $('#newWorkNotificationDiv').html('');
};

/**
 * Create the export student work display
 */
View.prototype.createExportStudentWorkDisplay = function() {
    //create the export student work div
    var exportStudentWorkDisplay = $('<div></div>').attr({id:'exportStudentWorkDisplay'});
    
    //add the export student work div to the main div
    $('#classroomMonitorMainDiv').append(exportStudentWorkDisplay);
    
    //hide the export student work div, we will show it later when necessary
    exportStudentWorkDisplay.hide();
    
    //create the div that is shown when the user first clicks on the 'Export Student Work' button
    var mainExportDiv = this.createMainExportDiv();
    
    //create the div that will show the custom export display
    var customExportDiv = this.createCustomExportDiv();
    
    //create the div that will show the special export display
    var specialExportDiv = this.createSpecialExportDiv();
    
    //create the hidden form that is used to generate the request to download the export file
    var exportForm = this.createExportForm();
    
    //add the export student work table to the div
    $('#exportStudentWorkDisplay').append(mainExportDiv);
    $('#exportStudentWorkDisplay').append(customExportDiv);
    $('#exportStudentWorkDisplay').append(specialExportDiv);
    $('#exportStudentWorkDisplay').append(exportForm);
    
};

/**
 * Create the idea basket list display that will list all the students
 * in the run and how many ideas each student has in their basket
 */
View.prototype.createIdeaBasketListDisplay = function() {
    var view = this,
        table = $('#ideaBasketListTable');
    var ideaBasketListData = [];
    
    //get all the workgroup ids in the class
    var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder();
    
    if(workgroupIds != null) {
        //loop through all the workgroup ids
        for(var x=0; x<workgroupIds.length; x++) {
            //get a workgroup id
            var workgroupId = workgroupIds[x],
            
                //check if the student is online
                online = this.isStudentOnline(workgroupId),
                rowClass = online ? 'online' : 'offline',
                onlineHtml = view.getStudentOnlineHtml(online),
                
                //get the student names for this workgroup
                students = this.userAndClassInfo.getStudentNamesByWorkgroupId(workgroupId),
                studentNames = '';
            
            for(var i=0; i<students.length; i++){
                if(i>0){
                    studentNames += ', ';
                }
                studentNames += students[i];
            }
                
            //get the period name the workgroup is in
            var periodName = this.userAndClassInfo.getClassmatePeriodNameByWorkgroupId(workgroupId),
                
                //get the period id the workgroup is in
                periodId = this.userAndClassInfo.getClassmatePeriodIdByWorkgroupId(workgroupId);
            
            studentNames = '<a href="javascript:void(0);" class="grade-by-student" title="' + view.getI18NString('classroomMonitor_studentProgress_viewStudentWork') + '" data-workgroupid="' + workgroupId + '">' + studentNames + '<span class="fa fa-search-plus fa-flip-horizontal"></span> <span class="label label-default">' + view.getI18NStringWithParams('classroomMonitor_periodLabel', [periodName]) + '</span></a>';

            //get the number of ideas the workgroup has in their idea basket
            var ideaCount = this.getStudentIdeaBasketIdeaCount(workgroupId);
            
            //create the row for the student
            ideaBasketListData.push(
                {
                    "DT_RowId": 'ideaBasketList_' + workgroupId,
                    "DT_RowClass": rowClass,
                    "online": online,
                    "online_html": onlineHtml, 
                    "workgroup_id": workgroupId,
                    "period_id": periodId,
                    "period_name": periodName,
                    "student_names": studentNames,
                    "idea_count": ideaCount
                });
        }       
    }

    // initialize dataTable
    table.dataTable( {
        'data': ideaBasketListData,
        'paging': false,
        'autoWidth': false,
        'dom': '<"dataTables_top"lf><"clearfix">rt<"dataTables_bottom"ip><"clear">',
        'language': {
            'search': '',
            'info': view.getI18NStringWithParams('classroomMonitor_tableInfoText', ['_TOTAL_'])
        },
        'columns': [
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_online'), 'data': 'online_html', 'class': 'center', 'sort': 'online', 'width': '5%' },
            { 'title': 'Workgroup ID', 'data': 'workgroup_id' },
            { 'title': 'Period ID', 'data': 'period_id' },
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_workgroup'), 'data': 'student_names', 'class': 'gradable viewStudentWork', 'width': '70%' },
            { 'title': 'Number of Ideas', 'data': 'idea_count', 'width': '25%' },
            { 'title': view.getI18NString('classroomMonitor_studentProgress_headers_period'), 'data': 'period_name', 'class': 'center', 'orderData': [5, 3] }
        ],
        'order': [[ 3, 'asc' ]],
        'columnDefs': [
            {
                'targets': [ 1, 2, 5 ],
                'visible': false
            },
            {
                'targets': [ 1, 2 ],
                'searchable': false
            }
        ],
        'initComplete': function( settings, json ) {
            $('.dataTables_filter input[type="search"]', $('#ideaBasketList')).attr('placeholder', view.getI18NString('classroomMonitor_search'));
        },
        'drawCallback': function( settings ) {
            view.redrawFixedHeaders(true);
            
            // bind click actions to workgroup links
            $('.grade-by-student', table).each(function(){
                $(this).off('click').on('click', {thisView:view, workgroupId:$(this).data('workgroupid')}, view.ideaBasketClicked);
            });
        }
    } );
    
    table.dataTable().fnFilterOnReturn();
    
    // create view object for future api access
    this.ideaBasketListTable = table.DataTable();
    
    // add period filter and header text
    this.addSectionHeader(table, $('#ideaBasketListTable_wrapper'), view.getI18NString('classroomMonitor_idea_baskets_title'), { 'view': 'ideaBasketList', 'periodCol': 5 });
};

/**
 * Create the idea basket item display
 */
View.prototype.createIdeaBasketItemDisplay = function() {
    //get the idea basket item table
    var table = $('#ideaBasketItemTable');
    
    //get the project meta data
    var projectMetaData = this.getProjectMetadata();
    
    var ideaAttributeNames = [];
    
    var ideaAttributes = null;
    
    //get the idea basket attributes
    if(projectMetaData != null) {
        if(projectMetaData.hasOwnProperty('tools')) {
            var tools = projectMetaData.tools;
            
            if(tools.hasOwnProperty('ideaManagerSettings')) {
                var ideaManagerSettings = tools.ideaManagerSettings;
                
                if(ideaManagerSettings.hasOwnProperty('ideaAttributes')) {
                    ideaAttributes = ideaManagerSettings.ideaAttributes;
                }
            }
        }
    }
    
    if(ideaAttributes == null) {
        /*
         * there are no idea attributes authored in the idea basket which means
         * the default attributes were used for the project
         */
        ideaAttributeNames.push('Source');
        ideaAttributeNames.push('Tags');
        ideaAttributeNames.push('Flag');
    } else {
        //loop through all the idea basket attributes
        for(var x=0; x<ideaAttributes.length; x++) {
            //get an attribute
            var ideaAttribute = ideaAttributes[x];
            
            if(ideaAttribute != null) {
                //get the attribute name
                var ideaAttributeName = ideaAttribute.name;
                ideaAttributeNames.push(ideaAttributeName);
            }
        }
    }
    
    var dataTableSettings = {
        'paging': false,
        'dom': '<"dataTables_top"lf><"clearfix">rt<"dataTables_bottom"ip><"clear">',
        'language': {
            'search': ''
        },
        'autoWidth': false,
        'columns': [],
        'columnDefs': [
            {
                'targets': [ 1 ],
                'visible': false
            }
        ],
        'initComplete': function( settings, json ) {
            $('.dataTables_filter input[type="search"]', $('#ideaBasketItem')).attr('placeholder', view.getI18NString('classroomMonitor_search'));
        }
    };
    
    //add the idea text column
    dataTableSettings.columns.push({ 'title': 'Idea', 'data': 'ideaText', 'width': '50%' });
    
    //add the hidden period name column
    dataTableSettings.columns.push({ 'title': view.getI18NString('classroomMonitor_studentProgress_headers_period'), 'data': 'period_name', 'class': 'center' });
    
    //the number of attributes for an idea
    var numAttributes = 0;
    
    //the column number that the period is located at
    var periodColumn = 1;
    
    //get the number of attributes for an idea
    if(ideaAttributeNames == null) {
        /*
         * attributes were not authored for the idea basket which means
         * the default attributes were used for the project
         */
        numAttributes = 3;
    } else {
        //attributes were authored so we will get how many were used
        
        if(ideaAttributeNames.length > 0) {
            numAttributes = ideaAttributeNames.length;
        }
    }
    
    /*
     * calculate the widths of the columns that appear to the right of
     * the idea text column. all columns to the right of the idea text
     * column will share 50% of the width of the table
     */
    var extraColumnWidths = 50 / (numAttributes + 2);
    
    if(ideaAttributeNames != null && ideaAttributeNames.length > 0) {
        //loop through all the attribute names
        for(var i=0; i<ideaAttributeNames.length; i++) {
            //get an attibute name
            var ideaAttributeName = ideaAttributeNames[i];

            //create the object that will specify the attribute column
            var columnObject = {};
            columnObject.title = ideaAttributeName;
            columnObject.data = 'attribute_' + i;
            columnObject.width = extraColumnWidths + '%';
            
            //add the attribute column
            dataTableSettings.columns.push(columnObject);
        }
    }
    
    //add the step created on column
    dataTableSettings.columns.push({ 'title': 'Step Created On', 'data': 'stepName', 'width': extraColumnWidths + '%' });
    
    //add the time created column
    dataTableSettings.columns.push({ 'title': 'Created', 'data': 'timeCreated', 'width': extraColumnWidths + '%' });
    
    //get the column number of the time created column
    var createdColumn = 3 + numAttributes;
    
    //sort the rows based on the time created column from newest to oldest
    dataTableSettings.order = [[ createdColumn, 'desc' ]];
    
    // initialize dataTable
    table.dataTable(dataTableSettings);

    this.addSectionHeader(table, $('#ideaBasketItemTable_wrapper'), view.getI18NString('classroomMonitor_idea_basket_title'), { 'view': 'ideaBasketItem', 'periodCol': periodColumn });
};

/**
 * Create the hidden form that is used to create the request to download the export file
 */
View.prototype.createExportForm = function() {
    //create the form
    var exportForm = $('<form>');
    exportForm.attr('id', 'exportForm');
    exportForm.css('display', 'none');
    exportForm.attr('action', '');
    exportForm.attr('method', 'GET');
    
    /*
     * add the fields in the form that will be passed to the 
     * server when the request for the export file is made
     */
    exportForm.append('<input type="hidden" name="runId" id="runId" value=""/>');
    exportForm.append('<input type="hidden" name="runName" id="runName" value=""/>');
    exportForm.append('<input type="hidden" name="projectId" id="projectId" value=""/>');
    exportForm.append('<input type="hidden" name="parentProjectId" id="parentProjectId" value=""/>');
    exportForm.append('<input type="hidden" name="projectName" id="projectName" value=""/>');
    exportForm.append('<input type="hidden" name="exportType" id="exportType" value=""/>');
    exportForm.append('<input type="hidden" name="customStepsArray" id="customStepsArray" value=""/>');
    exportForm.append('<input type="hidden" name="contentBaseUrl" id="contentBaseUrl" value=""/>');
    exportForm.append('<input type="hidden" name="nodeId" id="nodeId" value=""/>');
    exportForm.append('<input type="hidden" name="fileType" id="fileType" value=""/>');
    
    return exportForm;
};

/**
 * Create the table row that contains the export name and the export type
 * @param exportName the export name e.g. 'Export Latest Student Work' or 'Export All Student Work'
 * @param exportType the export type that the server uses to determine what type
 * of export to generate e.g. 'latestStudentWork' 'allStudentWork'
 */
View.prototype.createExportStudentWorkRow = function(exportName, exportType) {
    //create the row
    var exportStudentWorkRow = $('<tr>');
    
    //create the cell that will contain the export name
    var exportStudentWorkCellLabel = $('<td>');
    exportStudentWorkCellLabel.html(exportName);
    
    //create the cell that will contain the XLS button
    var exportStudentWorkXLSButtonCell = $('<td>');
    var exportStudentWorkXLSButton = $('<input>');
    exportStudentWorkXLSButton.attr('type', 'button');
    exportStudentWorkXLSButton.val('XLS');
    exportStudentWorkXLSButtonCell.append(exportStudentWorkXLSButton);
    exportStudentWorkXLSButton.click({thisView:this, exportType:exportType, fileType:'xls'}, function(event) {
        var thisView = event.data.thisView;
        var exportType = event.data.exportType;
        var fileType = event.data.fileType;
        
        //generate the XLS file
        thisView.exportStudentWorkButtonClicked(exportType, fileType);
    });
    
    //create the cell that will contain the CSV button
    var exportStudentWorkCSVButtonCell = $('<td>');
    var exportStudentWorkCSVButton = $('<input>');
    exportStudentWorkCSVButton.attr('type', 'button');
    exportStudentWorkCSVButton.val('CSV');
    exportStudentWorkCSVButtonCell.append(exportStudentWorkCSVButton);
    exportStudentWorkCSVButton.click({thisView:this, exportType:exportType, fileType:'csv'}, function(event) {
        var thisView = event.data.thisView;
        var exportType = event.data.exportType;
        var fileType = event.data.fileType;
        
        //generate the CSV file
        thisView.exportStudentWorkButtonClicked(exportType, fileType);
    });
    
    exportStudentWorkRow.append(exportStudentWorkCellLabel);
    exportStudentWorkRow.append(exportStudentWorkXLSButtonCell);
    exportStudentWorkRow.append(exportStudentWorkCSVButtonCell);
    
    return exportStudentWorkRow;
};

/**
 * The button was clicked to download the export file
 * @param exportType the export type that the server uses to determine what type
 * of export to generate e.g. 'latestStudentWork' 'allStudentWork'
 * @param fileType the file type for the export e.g. 'xls' or 'csv'
 */
View.prototype.exportStudentWorkButtonClicked = function(exportType, fileType) {
    //get the parameters for the download export file request
    var getXLSExportUrl = this.getConfig().getConfigParam('getXLSExportUrl');
    var runId = this.getConfig().getConfigParam('runId');
    var projectId = this.getConfig().getConfigParam('projectId');
    var parentProjectId = this.getConfig().getConfigParam('parentProjectId');
    var runName = this.getConfig().getConfigParam('runName');
    var projectName = this.getProject().getTitle();
    
    //set the parameters into the form
    $('#exportForm input[name=runId]').val(runId);
    $('#exportForm input[name=runName]').val(runName);
    $('#exportForm input[name=projectId]').val(projectId);
    $('#exportForm input[name=parentProjectId]').val(parentProjectId);
    $('#exportForm input[name=projectName]').val(projectName);
    $('#exportForm input[name=exportType]').val(exportType);
    $('#exportForm input[name=fileType]').val(fileType);
    
    if(exportType == 'customLatestStudentWork' || exportType == 'customAllStudentWork') {
        //get all the node ids that were chosen for the custom export
        var customStepsArrayJSONString = this.getCustomStepsArrayJSONString();
        $('#exportForm input[name=customStepsArray]').val(customStepsArrayJSONString);
    }
    
    //set the action url
    $('#exportForm').attr('action', getXLSExportUrl);
    
    //submit the form to request the export file
    $('#exportForm').submit();
};

/**
 * The button was clicked to download the special export file
 * @param nodeId the node id for the step that we want the special
 * export for
 */
View.prototype.specialExportStepButtonClicked = function(nodeId) {
    //get the parameters for the download export file request
    var getXLSExportUrl = this.getConfig().getConfigParam('getSpecialExportUrl');
    var runId = this.getConfig().getConfigParam('runId');
    var projectId = this.getConfig().getConfigParam('projectId');
    var parentProjectId = this.getConfig().getConfigParam('parentProjectId');
    var runName = this.getConfig().getConfigParam('runName');
    var projectName = this.getProject().getTitle();
    
    //set the parameters into the form
    $('#exportForm input[name=runId]').val(runId);
    $('#exportForm input[name=runName]').val(runName);
    $('#exportForm input[name=projectId]').val(projectId);
    $('#exportForm input[name=parentProjectId]').val(parentProjectId);
    $('#exportForm input[name=projectName]').val(projectName);
    $('#exportForm input[name=nodeId]').val(nodeId);
    $('#exportForm input[name=exportType]').val('specialExport');
    
    //set the action url
    $('#exportForm').attr('action', getXLSExportUrl);
    
    //submit the form to request the export file
    $('#exportForm').submit();
};

/**
 * Get the custom steps array JSON string
 * @return a JSON string that contains all the custom node ids
 */
View.prototype.getCustomStepsArrayJSONString = function() {
    var customStepsJSONString = "";
    
    //get the steps that were checked in the custom export screen
    var customStepsArray = this.getCustomStepsArray();
    
    if(customStepsArray != null) {
        //get the string format of the array
        customStepsJSONString = JSON.stringify(customStepsArray);
    }
    
    return customStepsJSONString;
};

/**
 * Get the custom steps that were checked in the custom export screen
 * @return and array of node id strings
 */
View.prototype.getCustomStepsArray = function() {
    var customStepsArray = [];
    
    //get all the steps that were checked
    var customSteps = $("input:checkbox[name='customExportStepCheckbox']:checked");
    
    //loop through all the steps
    for(var x=0; x<customSteps.length; x++) {
        var customStep = customSteps[x];
        
        if(customStep != null) {
            //get the node id of the step
            var nodeId = customStep.value;
            
            if(nodeId != null) {
                //add the node id to our array
                customStepsArray.push(nodeId);          
            }           
        }
    }
    
    return customStepsArray;
};

/**
 * Create the div that will display the main export screen
 */
View.prototype.createMainExportDiv = function() {
    //create the div
    var mainExportDiv = $('<div>');
    mainExportDiv.attr('id', 'mainExportDiv');
    
    //create the table that will contain the export labels and buttons
    var exportStudentWorkTable = $('<table>');
    exportStudentWorkTable.attr('id', 'exportStudentWorkTable');
    
    //create the rows that will display the export labels and buttons
    var exportLatestStudentWorkRow = this.createExportStudentWorkRow('Export Latest Student Work', 'latestStudentWork');
    var exportAllStudentWorkRow = this.createExportStudentWorkRow('Export All Student Work', 'allStudentWork');
    var exportIdeaBasketsRow = this.createExportStudentWorkRow('Export Idea Baskets', 'ideaBaskets');
    var exportExplanationBuilderWorkRow = this.createExportStudentWorkRow('Export Explanation Builder Work', 'explanationBuilderWork');
    var exportAnnotatorWorkRow = this.createExportStudentWorkRow('Export Annotator Work', 'annotatorWork');
    var exportFlashAnnotatorWorkRow = this.createExportStudentWorkRow('Export Flash Annotator Work', 'flashStudentWork');
    var customExportStudentWorkRow = this.createCustomExportStudentWorkRow();
    var specialExportStudentWorkRow = this.createSpecialExportStudentWorkRow();
    
    //add the rows to the table
    exportStudentWorkTable.append(exportLatestStudentWorkRow);
    exportStudentWorkTable.append(exportAllStudentWorkRow);
    exportStudentWorkTable.append(exportIdeaBasketsRow);
    exportStudentWorkTable.append(exportExplanationBuilderWorkRow);
    exportStudentWorkTable.append(exportAnnotatorWorkRow);
    exportStudentWorkTable.append(exportFlashAnnotatorWorkRow);
    exportStudentWorkTable.append(customExportStudentWorkRow);
    exportStudentWorkTable.append(specialExportStudentWorkRow);
    
    //add the table to the main div
    mainExportDiv.append(exportStudentWorkTable);
    
    return mainExportDiv;
};

/**
 * Create the row that will display the custom export label and button
 */
View.prototype.createCustomExportStudentWorkRow = function() {
    //create the row
    var exportStudentWorkRow = $('<tr>');
    
    //create the cell that will display the export label
    var exportStudentWorkCellLabel = $('<td>');
    exportStudentWorkCellLabel.html('Export Custom Student Work');
    
    //create the cell that will contain the 'Choose Steps' button
    var exportStudentWorkButtonCell = $('<td>');
    exportStudentWorkButtonCell.attr('colspan', 2);
    
    //creat the 'Choose Steps' button
    var exportStudentWorkButton = $('<input>');
    exportStudentWorkButton.attr('type', 'button');
    exportStudentWorkButton.val('Choose Steps');
    exportStudentWorkButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        /*
         * the 'Choose Steps' button was clicked so we will display the
         * custom export screen where the user chooses which steps they
         * want to be exported
         */ 
        thisView.customExportStudentWorkButtonClicked();
    });
    
    //add the 'Choose Steps' button
    exportStudentWorkButtonCell.append(exportStudentWorkButton);
    
    //add the label and the button to the row
    exportStudentWorkRow.append(exportStudentWorkCellLabel);
    exportStudentWorkRow.append(exportStudentWorkButtonCell);
    
    return exportStudentWorkRow;
};

/**
 * The 'Choose Steps' button was clicked so we will display the custom
 * export screen
 */
View.prototype.customExportStudentWorkButtonClicked = function() {
    //show the custom export div
    $('#mainExportDiv').hide();
    $('#customExportDiv').show();
    $('#specialExportDiv').hide();
    
    var customExportDiv = $('#customExportDiv');
    
    //populate the div if it hasn't already been populated
    if(customExportDiv.html() == '') {
        //create a table to contain the buttons and steps
        var customExportTable = $('<table>');
        
        //create the button to go back to the main export screen
        var backButtonRow = this.createExportBackButtonRow();
        customExportTable.append(backButtonRow);
        
        //create the row that will display 'Custom Export'
        var pageHeaderRow = $('<tr>');
        var pageHeaderCell = $('<td>');
        var pageHeader = $('<h3>');
        pageHeader.css('display', 'inline');
        pageHeader.html('Custom Export');
        pageHeaderCell.append(pageHeader);
        pageHeaderRow.append(pageHeaderCell);
        customExportTable.append(pageHeaderRow);
        
        //create the row for the custom latest student work export
        var exportCustomLatestStudentWorkRow = this.createExportStudentWorkRow('Export Custom Latest Student Work', 'customLatestStudentWork');
        customExportTable.append(exportCustomLatestStudentWorkRow);
        
        //create the row for the custom all student work export
        var exportCustomAllStudentWorkRow = this.createExportStudentWorkRow('Export Custom All Student Work', 'customAllStudentWork');
        customExportTable.append(exportCustomAllStudentWorkRow);
        
        //create the row that will contain all the steps with check boxes
        var selectStepsTableRow = $('<tr>');
        
        //create the table that will contain all the steps with check boxes
        var selectStepsTable = this.createCustomExportSelectStepsTable();
        
        selectStepsTableRow.append(selectStepsTable);
        customExportTable.append(selectStepsTableRow);

        /*
         * create the row for the custom latest student work export 
         * that will show up at the bottom of the screen
         */
        var exportCustomLatestStudentWorkRow2 = this.createExportStudentWorkRow('Export Custom Latest Student Work', 'customLatestStudentWork');
        customExportTable.append(exportCustomLatestStudentWorkRow2);
        
        /*
         * create the row for the custom all student work export
         * that will show up at the bottom of the screen
         */
        var exportCustomAllStudentWorkRow2 = this.createExportStudentWorkRow('Export Custom All Student Work', 'customAllStudentWork');
        customExportTable.append(exportCustomAllStudentWorkRow2);
        
        /*
         * create the button to go back to the main export screen.
         * this back button will show up at the bottom of the screen.
         */ 
        var backButtonRow = this.createExportBackButtonRow();
        customExportTable.append(backButtonRow);
        
        customExportDiv.append(customExportTable);
    }
};

/**
 * Create the row that will contain the back button to go back
 * to the main export screen
 */
View.prototype.createExportBackButtonRow = function() {
    //create the button
    var backButton = $('<input>');
    backButton.attr('type', 'button');
    backButton.val('Back');
    backButton.click({}, function(event) {
        $('#mainExportDiv').show();
        $('#customExportDiv').hide();
        $('#specialExportDiv').hide();
    });
    
    //create the row
    var backButtonRow = $('<tr>');
    var backButtonCell = $('<td>');
    backButtonCell.append(backButton);
    backButtonRow.append(backButtonCell);
    
    return backButtonRow;
};

/**
 * Create the table that will display the steps and check boxes
 * for the custom export
 */
View.prototype.createCustomExportSelectStepsTable = function() {
    //create the table
    var table = $('<table>');
    
    //create the row for the 'Select All Steps' check boxes
    var selectAllStepsRow = $('<tr>');
    var selectAllStepsCell = $('<td>');
    
    //create the select all steps checkbox
    var selectAllStepsCellInput = $('<input>');
    selectAllStepsCellInput.attr('id', 'selectAllStepsCheckBox');
    selectAllStepsCellInput.attr('type', 'checkbox');
    selectAllStepsCellInput.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        thisView.customExportSelectAllStepsCheckBoxClicked();
    });
    
    //create the label for the 'Select All Steps'
    selectAllStepsCellH4 = $('<h4>');
    selectAllStepsCellH4.html('Select All Steps');
    selectAllStepsCellH4.css('display', 'inline');
    
    //add the check box and label
    selectAllStepsCell.append(selectAllStepsCellInput);
    selectAllStepsCell.append(selectAllStepsCellH4);
    
    selectAllStepsRow.append(selectAllStepsCell);

    //add the row to the table
    table.append(selectAllStepsRow);
    
    //initialize the activity counter
    this.activityNumber = 0;
    
    //add the steps in the project
    this.createCustomExportSelectStepsTableHelper(table, this.getProject().getRootNode());
    
    return table;
};

/**
 * Adds the activities and steps to the table for the custom export page.
 * The activities and steps will have check boxes next to them. This is a recursive
 * function that will traverse the project.
 * @param table the table dome element to add step rows to
 * @param node the current node we are on
 */
View.prototype.createCustomExportSelectStepsTableHelper = function(table, node) {
    //get the current node id
    var nodeId = node.id;
    
    if(node.isLeafNode()) {
        //this node is a leaf/step

        //create the row and cell
        var row = $('<tr>');
        var cell = $('<td>');
        
        //create the check box
        var checkBox = $('<input>');
        checkBox.attr('id', 'stepCheckBox_' + nodeId);
        checkBox.addClass('activityStep_' + (this.activityNumber - 1));
        checkBox.addClass('stepCheckBox');
        checkBox.css('margin-left', '20px');
        checkBox.attr('type', 'checkbox');
        checkBox.attr('name', 'customExportStepCheckbox');
        checkBox.val(nodeId);
        
        var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
        var nodeType = node.getType();
        
        //create the step label
        var p = $('<p>');
        p.html(stepNumberAndTitle + ' (' + nodeType + ')');
        p.css('display', 'inline');
        
        //add the check box and label
        cell.append(checkBox);
        cell.append(p);
        
        row.append(cell);
        
        table.append(row);
    } else {
        /*
         * we need to skip the first sequence because that is always the
         * master sequence. we will encounter the master sequence when 
         * this.activityNumber is 0, so all the subsequent activities will
         * start at 1.
         */
        if(this.activityNumber != 0) {
            //create the row and cell
            var row = $('<tr>');
            var cell = $('<td>');
            
            var activityCheckBoxId = 'activityCheckBox_' + this.activityNumber;

            //create the check box
            var checkBox = $('<input>');
            checkBox.attr('id', activityCheckBoxId);
            checkBox.addClass('activityCheckBox');
            checkBox.attr('type', 'checkbox');
            checkBox.attr('name', 'customExportActivityCheckbox');
            checkBox.val(nodeId);
            checkBox.click({thisView:this, activityCheckBoxId:activityCheckBoxId}, function(event) {
                var thisView = event.data.thisView;
                var activityCheckBoxId = event.data.activityCheckBoxId;
                
                thisView.customExportActivityCheckBoxClicked(activityCheckBoxId);
            });
            
            var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
            var title = node.getTitle();
            
            //create the activity label
            var h4 = $('<h4>');
            h4.html('Activity ' + stepNumberAndTitle);
            h4.css('display', 'inline');
            
            //add the check box and label
            cell.append(checkBox);
            cell.append(h4);
            
            row.append(cell);
            
            table.append(row);
        }

        //increment the activity number
        this.activityNumber++;
        
        //loop through all its children
        for(var x=0; x<node.children.length; x++) {
            //add the child
            this.createCustomExportSelectStepsTableHelper(table, node.children[x]);
        }
    }
};

/**
 * The select all steps check box in the custom export screen was clicked
 */
View.prototype.customExportSelectAllStepsCheckBoxClicked = function() {
    //get whether the checkbox was checked or unchecked
    var isSelectAllStepsChecked = $('#selectAllStepsCheckBox').attr('checked');
    
    if(isSelectAllStepsChecked == null) {
        isSelectAllStepsChecked = false;
    }
    
    //check or uncheck all the steps
    $(".stepCheckBox").each(function(index, element) {$(element).attr('checked', isSelectAllStepsChecked);});
    
    //check or uncheck all the activities
    $(".activityCheckBox").each(function(index, element) {$(element).attr('checked', isSelectAllStepsChecked);});
};

/**
 * One of the activity check boxes in the custom export screen was clicked
 * @param activityCheckBoxId the dom id of the activity checkbox
 */
View.prototype.customExportActivityCheckBoxClicked = function(activityCheckBoxId) {
    //get the activity number
    var activityNumber = activityCheckBoxId.replace("activityCheckBox_", "");
    
    //get whether the activity check box is checked or unchecked
    var isActivityChecked = $('#' + activityCheckBoxId).attr('checked');
    
    if(isActivityChecked == null) {
        isActivityChecked = false;
    }
    
    //check or uncheck all the steps in this activity
    $(".activityStep_" + activityNumber).each(function(index, element) {$(element).attr('checked', isActivityChecked);});
}

/**
 * Create the custom export div
 */
View.prototype.createCustomExportDiv = function() {
    var customExportDiv = $('<div>');
    customExportDiv.attr('id', 'customExportDiv');
    
    return customExportDiv;
};

/**
 * Create the row for the 'Special Export'
 */
View.prototype.createSpecialExportStudentWorkRow = function() {
    //create the row
    var exportStudentWorkRow = $('<tr>');
    
    //create the cell that will contain the label
    var exportStudentWorkCellLabel = $('<td>');
    exportStudentWorkCellLabel.html('Special Export');
    
    //create the cell that will contain the button
    var exportStudentWorkButtonCell = $('<td>');
    exportStudentWorkButtonCell.attr('colspan', 2);
    
    //create the button
    var exportStudentWorkButton = $('<input>');
    exportStudentWorkButton.attr('type', 'button');
    exportStudentWorkButton.val('Choose Step');
    exportStudentWorkButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        //open the display that will let the user choose the step they want to export
        thisView.specialExportStudentWorkButtonClicked();
    });
    
    exportStudentWorkButtonCell.append(exportStudentWorkButton);
    
    exportStudentWorkRow.append(exportStudentWorkCellLabel);
    exportStudentWorkRow.append(exportStudentWorkButtonCell);
    
    return exportStudentWorkRow;
};

/**
 * Display the special export screen where the user chooses
 * which step to export
 */
View.prototype.specialExportStudentWorkButtonClicked = function() {
    $('#mainExportDiv').hide();
    $('#customExportDiv').hide();
    $('#specialExportDiv').show();
    
    //get the special export div
    var specialExportDiv = $('#specialExportDiv');
    
    //populate the div it is empty
    if(specialExportDiv.html() == '') {
        //create a table to display all the steps in the project
        var specialExportTable = $('<table>');
        
        //create the back button row
        var backButtonRow = this.createExportBackButtonRow();
        specialExportTable.append(backButtonRow);
        
        //create the row that will display 'Special Export'
        var pageHeaderRow = $('<tr>');
        var pageHeaderCell = $('<td>');
        var pageHeader = $('<h3>');
        pageHeader.css('display', 'inline');
        pageHeader.html('Special Export');
        pageHeaderCell.append(pageHeader);
        pageHeaderRow.append(pageHeaderCell);
        specialExportTable.append(pageHeaderRow);
        
        //create a row to hold all the steps
        var selectStepsTableRow = $('<tr>');
        
        //create the table that will contain all the steps
        var selectStepsTable = this.createSpecialExportSelectStepsTable();
        
        selectStepsTableRow.append(selectStepsTable);
        
        specialExportTable.append(selectStepsTableRow);
        
        //create the back button row that will show at the bottom of the screen
        var backButtonRow = this.createExportBackButtonRow();
        specialExportTable.append(backButtonRow);
        
        specialExportDiv.append(specialExportTable);
    }
};

/**
 * Create the table of steps for the special export
 */
View.prototype.createSpecialExportSelectStepsTable = function() {
    //create the table
    var table = $('<table>');
    
    //initialize the activity counter
    this.activityNumber = 0;
    
    //add the step rows to the table
    this.createSpecialExportSelectStepsTableHelper(table, this.getProject().getRootNode());
    
    return table;
};

/**
 * Populate the table with step rows. This is a recursive function
 * that will traverse the activities and steps in the project.
 * @param table the html table that will contain all the steps
 * @param node the current node we are on
 */
View.prototype.createSpecialExportSelectStepsTableHelper = function(table, node) {
    //get the current node id
    var nodeId = node.id;
    
    if(node.isLeafNode()) {
        //this node is a leaf/step

        var row = $('<tr>');
        var cell = $('<td>');
        
        //get the step number and title
        var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
        var nodeType = node.getType();

        //check if this step can be special exported
        if(node.canSpecialExport()) {
            //this step type can be special exported so we will display a button

            //create the button for the step
            var stepButton = $('<input>');
            stepButton.attr('type', 'button');
            stepButton.attr('id', 'stepButton_' + nodeId);
            stepButton.css('margin-left', '20px');
            stepButton.val(stepNumberAndTitle + '(' + nodeType + ')');
            stepButton.click({thisView:this, nodeId:nodeId}, function(event) {
                var thisView = event.data.thisView;
                var nodeId = event.data.nodeId;
                
                //make the request for the special export file
                thisView.specialExportStepButtonClicked(nodeId);
            });
            
            cell.append(stepButton);
        } else {
            //this step can't be special exported so we will just display the step name as text
            
            //create the step label
            var stepP = $('<p>');
            stepP.css('display', 'inline');
            stepP.css('margin-left', '20px');
            stepP.html(stepNumberAndTitle + '(' + nodeType + ')');
            
            cell.append(stepP);
        }
        
        row.append(cell);
        
        table.append(row);
    } else {
        /*
         * we need to skip the first sequence because that is always the
         * master sequence. we will encounter the master sequence when 
         * this.activityNumber is 0, so all the subsequent activities will
         * start at 1.
         */
        if(this.activityNumber != 0) {
            //this node is a sequence so we will display a checkbox and label for the current activity
            
            var row = $('<tr>');
            var cell = $('<td>');
            
            //get the activity number and title
            var stepNumberAndTitle = this.getProject().getStepNumberAndTitle(nodeId);
            
            //create the h4 to display the activity label
            var activityH4 = $('<h4>');
            activityH4.html('Activity ' + stepNumberAndTitle);
            activityH4.css('display', 'inline');
            
            cell.append(activityH4);
            
            row.append(cell);
            
            table.append(row);
        }

        //increment the activity number
        this.activityNumber++;
        
        //loop through all its children
        for(var x=0; x<node.children.length; x++) {
            //add the children
            this.createSpecialExportSelectStepsTableHelper(table, node.children[x]);
        }
    }
};

/**
 * Create the special export div
 */
View.prototype.createSpecialExportDiv = function() {
    var specialExportDiv = $('<div>');
    specialExportDiv.attr('id', 'specialExportDiv');
    
    return specialExportDiv;
};

/**
 * Get the students on a step
 * @param nodeId the node id for the step
 * @param periodId (optional) the period we want students from
 * @return an object that contains an array of students that
 * are online and an array of students that are offline that  
 * are on the step and in the period
 */
/*View.prototype.getStudentsOnStep = function(nodeId, periodId) {
    if(periodId == null) {*/
        /*
         * the period id was not passed in so we will use the period id
         * that is currently selected in the UI
         */
        /*periodId = this.classroomMonitorPeriodIdSelected;
    }
    
    var studentsOnline = [];
    var studentsOffline = [];
    
    //get the workgroup ids in user name alphabetical order
    var workgroupIds = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder();
    
    if(workgroupIds != null) {
        //loop through the workgroup ids
        for(var x=0; x<workgroupIds.length; x++) {
            //get a workgroup id
            var workgroupId = workgroupIds[x];
            
            //get the student status for the workgroup id
            var studentStatus = this.getStudentStatusByWorkgroupId(workgroupId);
            
            if(studentStatus != null) {
                //get the values from the student status
                var workgroupId = studentStatus.workgroupId;
                var currentNodeId = studentStatus.currentNodeId;
                var tempPeriodId = studentStatus.periodId;
                
                //check if the student is in the period we want
                if(periodId == null || periodId == 'all' || periodId == tempPeriodId) {
                    //check if the student is on the step we want
                    if(nodeId == currentNodeId) {
                        //check if the student is online
                        if(this.isStudentOnline(workgroupId)) {
                            //the student is online
                            studentsOnline.push(workgroupId);
                        } else {
                            //the student is offline
                            studentsOffline.push(workgroupId);
                        }
                    }
                }
            }
        }
    }
    
    var result = {
        studentsOnline:studentsOnline,
        studentsOffline:studentsOffline
    }
    
    return result;
};*/

/**
 * Highlight the background of the element yellow
 * @param element the element to highlight
 */
View.prototype.highlightYellow = function(element) {
    $(element).css('background', 'yellow');
};

/**
 * Remove the background highlight from the element
 * @param element the element to remove the highlight from
 */
View.prototype.removeHighlight = function(element) {
    $(element).css('background', '');
};

/**
 * Called when the classroom monitor window closes
 */
View.prototype.onWindowUnload = function(logout) {
    /*
     * the classroom monitor window is being closed so we will make sure
     * the student screens are unpaused so the students aren't stuck
     * at the pause screen
     */
    this.unPauseScreens();
    
    if(logout === true) {
        //get the context path e.g. /wise
        var contextPath = this.getConfig().getConfigParam('contextPath');
        
        //log out the user
        window.top.location = contextPath + "/j_spring_security_logout";        
    }
};

/**
 * Create the table that will display the student user name, workgroup id, and period
 * @param studentNames the student user names in the workgroup
 * @param workgroupId the workgroup id
 * @param showStudentWorkLink boolean value that determines whether to show the student work link
 * @param showIdeaBasketLink boolean value that determines whether to show the idea basket link
 * @param periodName the name of the period
 */
View.prototype.createStudentHeaderTable = function(studentNames, workgroupId, periodName, showStudentWorkLink, showIdeaBasketLink) {
    //create the table that will display the user name, workgroup id, period name, navigation buttons, and save button
    var gradeByStudentHeaderTable = $('<table>');
    gradeByStudentHeaderTable.attr('id', 'gradeByStudentHeaderTable');
    gradeByStudentHeaderTable.attr('width', '99%');
    gradeByStudentHeaderTable.css('position', 'fixed');
    gradeByStudentHeaderTable.css('top', '105px');
    gradeByStudentHeaderTable.css('left', '10px');
    gradeByStudentHeaderTable.css('background', 'yellow');
    gradeByStudentHeaderTable.css('z-index', '1');
    
    //create the row that will display the user name, workgroup id, period name, navigation buttons, and save button
    var gradeByStudentHeaderTR = $('<tr>');
    
    /*
     * create the div that will show the green or red dot to show whether
     * the student is online
     */
    var isOnlineDiv = $('<div>');
    isOnlineDiv.attr('id', 'isOnlineDiv_' + workgroupId);
    isOnlineDiv.css('float', 'left');
    isOnlineDiv.css('width', '20px');
    isOnlineDiv.css('margin', '1px');
    isOnlineDiv.css('text-align', 'center');
    
    var isOnline = this.isStudentOnline(workgroupId);
    
    if(isOnline) {
        //the student is online
        isOnlineDiv.html(this.getIsOnlineHTML());
    } else {
        //the student is offline
        isOnlineDiv.html(this.getIsOfflineHTML());
    }
    
    //create the table data that will display the student names
    var gradeByStudentHeaderStudentNamesTD = $('<td>');
    gradeByStudentHeaderStudentNamesTD.css('background', 'yellow');
    
    //create the div to show the student name drop down
    var studentNameDropDownDiv = $('<div>');
    studentNameDropDownDiv.css('display', 'inline');
    studentNameDropDownDiv.css('margin-left', '5px');
    
    //create the drop down box to select the student
    var studentSelect = $('<select>');
    studentSelect.attr('id', 'studentDropDown');
    
    //get all the workgroup ids in the period
    var classmateWorkgroupIdsInPeriod = this.getUserAndClassInfo().getClassmateWorkgroupIdsInAlphabeticalOrder(this.classroomMonitorPeriodIdSelected);
    
    //loop through all the workgroup ids in the period
    for(var x=0; x<classmateWorkgroupIdsInPeriod.length; x++) {
        //get a workgroup id
        var classmateWorkgroupId = classmateWorkgroupIdsInPeriod[x];
        
        //get the classmate names for the workroup id
        var classmateNames = this.getUserAndClassInfo().getStudentNamesByWorkgroupId(classmateWorkgroupId);
        
        //create the option for the classmates
        var classmateOption = $('<option>');
        classmateOption.val(classmateWorkgroupId);
        classmateOption.text(classmateNames.join(', '));

        //add the option to the drop down
        studentSelect.append(classmateOption);
    }

    //select the workgroup that is currently being displayed
    studentSelect.val(workgroupId);
    
    //set the change event to display a new student
    studentSelect.change({thisView:this}, this.studentDropDownChanged);
    
    //add the student drop down
    studentNameDropDownDiv.append(studentSelect);
    
    //create the div to show the idea basket link or student work link
    var toggleStudentWorkIdeaBasketDiv = $('<div>');
    toggleStudentWorkIdeaBasketDiv.attr('id', 'toggleStudentWorkIdeaBasketDiv_' + workgroupId);
    toggleStudentWorkIdeaBasketDiv.css('display', 'inline');
    toggleStudentWorkIdeaBasketDiv.css('margin-left', '20px');
    
    //create the link to show the student work
    var studentWorkLink = $('<a>');
    studentWorkLink.text('Show Student Work');
    studentWorkLink.attr('id', 'showStudentWorkLink_' + workgroupId);
    studentWorkLink.css('text-decoration', 'underline');
    studentWorkLink.css('color', 'blue');
    studentWorkLink.css('cursor', 'pointer');
    studentWorkLink.click({thisView:this, workgroupId:workgroupId}, this.studentRowClicked);
    
    if(showStudentWorkLink) {
        //show the student work link
        toggleStudentWorkIdeaBasketDiv.append(studentWorkLink);
    }
    
    //create the link to show the idea basket
    var ideaBasketLink = $('<a>');
    ideaBasketLink.text('Show Idea Basket');
    ideaBasketLink.attr('id', 'showIdeaBasketLink_' + workgroupId);
    ideaBasketLink.css('text-decoration', 'underline');
    ideaBasketLink.css('color', 'blue');
    ideaBasketLink.css('cursor', 'pointer');
    ideaBasketLink.click({thisView:this, workgroupId:workgroupId}, this.ideaBasketClicked);
    
    /*
     * check if we need to show the idea basket link and that the project
     * has the idea basket enabled
     */
    if(showIdeaBasketLink && this.isIdeaBasketEnabled()) {
        //show the idea basket link
        toggleStudentWorkIdeaBasketDiv.append(ideaBasketLink);
    }
    
    //create the div to show the number of items to review
    var numberOfItemsToReviewDiv = $('<div>');
    numberOfItemsToReviewDiv.attr('id', 'numberOfItemsToReviewDiv_' + workgroupId);
    numberOfItemsToReviewDiv.css('display', 'inline');
    numberOfItemsToReviewDiv.css('margin-left', '20px');
    numberOfItemsToReviewDiv.text('Number of Items to Review: ');
    
    //create the span to display the number of items to review value
    var numberOfItemsToReviewSpan = $('<span>');
    numberOfItemsToReviewSpan.attr('id', 'numberOfItemsToReviewSpan_' + workgroupId);
    numberOfItemsToReviewSpan.text('Calculating...');

    numberOfItemsToReviewDiv.append(numberOfItemsToReviewSpan);
    
    if(showStudentWorkLink) {
        /*
         * hide the number of items to review if we are showing the student 
         * work link which means we are displaying the student idea basket
         */
        numberOfItemsToReviewDiv.css('display', 'none');
    }
    
    gradeByStudentHeaderStudentNamesTD.append(isOnlineDiv);
    gradeByStudentHeaderStudentNamesTD.append(studentNameDropDownDiv);
    gradeByStudentHeaderStudentNamesTD.append(toggleStudentWorkIdeaBasketDiv);
    gradeByStudentHeaderStudentNamesTD.append(numberOfItemsToReviewDiv);
    
    //add the tds to the row
    gradeByStudentHeaderTR.append(gradeByStudentHeaderStudentNamesTD);
    
    //add the row to the header table
    gradeByStudentHeaderTable.append(gradeByStudentHeaderTR);
    
    return gradeByStudentHeaderTable;
};

/**
 * The student drop down was changed
 * @param event the jquery event
 */
View.prototype.studentDropDownChanged = function(event) {
    var thisView = event.data.thisView;
    thisView.studentDropDownChangedHandler();
};

/**
 * Handles the student drop down changing
 */
View.prototype.studentDropDownChangedHandler = function() {
    //get the selected workgroup id
    var workgroupId = $('#studentDropDown').val();
    
    //display the student that was clicked
    this.studentRowClickedHandler(workgroupId);
};

/**
 * Check if this project has the idea basket enabled
 * @return a boolean value whether the idea basket is
 * enabled or not
 */
View.prototype.isIdeaBasketEnabled = function() {
    var result = false;
    
    //get the project meta data
    var projectMetaData = this.getProjectMetadata();
    
    if(projectMetaData != null) {
        if(projectMetaData.hasOwnProperty('tools')) {
            //get the tools
            var tools = projectMetaData.tools;
            
            if(tools.hasOwnProperty('isIdeaManagerEnabled')) {
                
                //check if the idea basket is enabled
                if(tools.isIdeaManagerEnabled) {
                    result = true;                  
                }
            }
        }
    }
    
    return result;
};

/**
 * Create the premade comments div
 */
View.prototype.createPremadeCommentsDiv = function() {
    //create the premade comments div
    var premadeCommentsDiv = $('<div></div>').attr({id:'premadeCommentsDiv'});
    
    var premadeCommentsListsLabel = $('<p></p>');
    premadeCommentsListsLabel.attr('id', 'premadeCommentsListsLabel');
    premadeCommentsListsLabel.html('<u>Premade Comments</p>');
    
    var premadeCommentsListsDiv = $('<div></div>');
    premadeCommentsListsDiv.attr('id', 'premadeCommentsListsDiv');
    
    var premadeCommentsTextArea = $('<textarea></textarea>');
    premadeCommentsTextArea.attr('id', 'premadeCommentsTextArea');
    premadeCommentsTextArea.css('width', '500px');
    premadeCommentsTextArea.css('height', '100px');
    
    var premadeCommentsSubmitButton = $('<input></input>');
    premadeCommentsSubmitButton.attr('id', 'premadeCommentsSubmitButton');
    premadeCommentsSubmitButton.attr('type', 'button');
    premadeCommentsSubmitButton.val('Submit');
    premadeCommentsSubmitButton.click({thisView:this}, function(event) {
        var thisView = event.data.thisView;
        var commentBoxId = thisView.commentBoxId;
        thisView.premadeCommentsSubmitButtonClicked(commentBoxId);
    });
    
    premadeCommentsDiv.append(premadeCommentsListsLabel);
    premadeCommentsDiv.append(premadeCommentsListsDiv);
    premadeCommentsDiv.append(premadeCommentsTextArea);
    premadeCommentsDiv.append('<br>');
    premadeCommentsDiv.append(premadeCommentsSubmitButton);
    
    //add the premade comments div to the main div
    $('#classroomMonitorMainDiv').append(premadeCommentsDiv);
    
    //hide the premade comments div, we will show it later when necessary
    premadeCommentsDiv.hide();
};

/**
 * Populate the show classroom div
 */
View.prototype.createShowClassroomDisplay = function() {
    //get the show classroom div
    var showClassroomDiv = $('#showClassroomDiv');
    
    //create a div wrapper that will contain all the show classroom UI elements
    var showClassroomWrapper = $('<div>');
    showClassroomWrapper.attr('id', 'showClassroomWrapper');
    showClassroomWrapper.addClass('dataTables_wrapper');
    showClassroomDiv.append(showClassroomWrapper);
    
    //create the prompt background label
    var promptBackgroundLabel = $('<span>');
    promptBackgroundLabel.text('Prompt Background: ');
    showClassroomWrapper.append(promptBackgroundLabel);
    
    //create the prompt background input
    var showClassroomPromptBackgroundInput = $('<input>');
    showClassroomPromptBackgroundInput.attr('id', 'showClassroomPromptBackgroundInput');
    showClassroomPromptBackgroundInput.attr('type', 'input');
    showClassroomPromptBackgroundInput.attr('size', 70);
    showClassroomWrapper.append(showClassroomPromptBackgroundInput);
    
    //create the send prompt button
    var showClassroomSendPromptButton = $('<input>');
    showClassroomSendPromptButton.attr('id', 'showClassroomSendPromptButton');
    showClassroomSendPromptButton.attr('type', 'button');
    showClassroomSendPromptButton.val('Send Prompt');
    showClassroomWrapper.append(showClassroomSendPromptButton);
    
    //listen for when the teacher clicks the send prompt button
    showClassroomSendPromptButton.on('click', {thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        //get the currently selected period
        var periodId = thisView.classroomMonitorPeriodIdSelected;
        
        //get the prompt background value
        var showClassroomPromptBackgroundInputValue = $('#showClassroomPromptBackgroundInput').val();

        var imageObj = new Image();

        imageObj.onload = function() {
            //get the canvas
            var canvas = $('#showClassroomCanvas');
            
            //get the canvas context
            var canvasContext = $(canvas)[0].getContext('2d');
            
            //draw the image on the canvas context
            canvasContext.drawImage(imageObj, 0, 0);
        };
        
        //set the source of the image
        imageObj.src = showClassroomPromptBackgroundInputValue;
        
        //send the show classroom prompt to the students
        thisView.sendShowClassroomTeacherPrompt(periodId, showClassroomPromptBackgroundInputValue);
    });
    
    //create the close prompt button
    var showClassroomClosePromptButton = $('<input>');
    showClassroomClosePromptButton.attr('id', 'showClassroomClosePromptButton');
    showClassroomClosePromptButton.attr('type', 'button');
    showClassroomClosePromptButton.val('Close Prompt');
    showClassroomWrapper.append(showClassroomClosePromptButton);
    
    //listen for when the teacher clicks the close prompt button
    showClassroomClosePromptButton.on('click', {thisView:this}, function(event) {
        var thisView = event.data.thisView;
        
        //get the currently selected period
        var periodId = thisView.classroomMonitorPeriodIdSelected;
        
        //close the show classroom teacher prompt
        thisView.closeShowClassroomTeacherPrompt(periodId);
        
        //get the show classroom canvas
        var canvas = $('#showClassroomCanvas');
        
        //get the canvas DOM element
        var canvasDOMElement = canvas[0];
        
        //get the canvas context
        var canvasContext = canvasDOMElement.getContext('2d');
        
        //clear the canvas
        canvasContext.clearRect(0, 0, $(canvas)[0].width, $(canvas)[0].height);
    });
    
    //create the div that will contain the show classroom canvas
    var showClassroomPromptDisplayDiv = $('<div>');
    showClassroomPromptDisplayDiv.attr('id', 'showClassroomPromptDisplayDiv');
    showClassroomPromptDisplayDiv.css('width', '800px');
    showClassroomPromptDisplayDiv.css('height', '600px');
    showClassroomPromptDisplayDiv.css('border', '1px');
    showClassroomWrapper.append(showClassroomPromptDisplayDiv);
    
    /*
     * create the show classroom canvas that is used to display what the
     * teacher will send to the students
     */
    var showClassroomCanvas = $('<canvas>');
    showClassroomCanvas.attr('id', 'showClassroomCanvas');
    showClassroomCanvas.attr('width', '800');
    showClassroomCanvas.attr('height', '600');
    showClassroomCanvas.css('border', '1px solid black');
    showClassroomPromptDisplayDiv.append(showClassroomCanvas);
    
    //listen for when the teacher clicks on the show classroom canvas
    showClassroomCanvas.on('mousedown', {thisView:this, showClassroomCanvas:showClassroomCanvas}, function(event) {
        var thisView = event.data.thisView;
        var showClassroomCanvas = event.data.showClassroomCanvas;
        
        //the teacher has clicked on the show classroom canvas  
        thisView.showClassroomCanvasClicked(showClassroomCanvas, event);
    });
    
    //hide the show classroom div, we will show it later when necessary
    showClassroomDiv.hide();
};

/**
 * Send the teacher input to the students
 * @param params an object containing the params for the teacher input
 */
View.prototype.sendShowClassroomTeacherInput = function(params) {
    //create the message object with the necessary parameters
    var messageJSON = {};
    
    //set the run id
    messageJSON.runId = parseInt(this.getConfig().getConfigParam('runId'));
    
    //set the message type
    messageJSON.messageType = 'showClassroomTeacherInputReceived';
    
    //get the period id
    var periodId = this.classroomMonitorPeriodIdSelected;
    
    //set the message participants
    if(periodId == null || periodId == 'all') {
        //we are going to pause all the students in a run
        messageJSON.messageParticipants = 'teacherToStudentsInRun';
    } else if(periodId != null) {
        //we are going to pause the students in a period
        messageJSON.periodId = periodId;
        messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
    }
    
    //get the x and y values
    var x = params.x;
    var y = params.y;
    messageJSON.x = x;
    messageJSON.y = y;
    
    //send the teacher input to websockets
    this.sendTeacherWebSocketMessage(messageJSON);
};

/**
 * Send the show classroom teacher prompt
 * @param periodId the period id
 * @param background the background to display to the students
 */
View.prototype.sendShowClassroomTeacherPrompt = function(periodId, background) {
    //create the message object with the necessary parameters
    var messageJSON = {};
    
    //set the run id
    messageJSON.runId = parseInt(this.getConfig().getConfigParam('runId'));
    
    //set the message type
    messageJSON.messageType = 'showClassroomTeacherPromptReceived';
    
    //set the message participants
    if(periodId == null || periodId == 'all') {
        //we are going to show the prompt to all the students in a run
        messageJSON.messageParticipants = 'teacherToStudentsInRun';
    } else if(periodId != null) {
        //we are going to show the prompt to the students in a period
        messageJSON.periodId = periodId;
        messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
    }
    
    if(background != null) {
        //set the pause message
        messageJSON.background = background;
    }
    
    //send the message to show the teacher prompt
    this.sendTeacherWebSocketMessage(messageJSON);
};

/**
 * Close the show classroom teacher prompt
 * @param periodId the period id
 */
View.prototype.closeShowClassroomTeacherPrompt = function(periodId) {
    //create the message object with the necessary parameters
    var messageJSON = {};
    
    //set the run id
    messageJSON.runId = parseInt(this.getConfig().getConfigParam('runId'));
    
    //set the message type
    messageJSON.messageType = 'closeShowClassroomTeacherPrompt';
    
    //set the message participants
    if(periodId == null || periodId == 'all') {
        //we are going to show the prompt to all the students in a run
        messageJSON.messageParticipants = 'teacherToStudentsInRun';
    } else if(periodId != null) {
        //we are going to show the prompt to the students in a period
        messageJSON.periodId = periodId;
        messageJSON.messageParticipants = 'teacherToStudentsInPeriod';
    }
    
    //send the message to close the teacher prompt
    this.sendTeacherWebSocketMessage(messageJSON);
};

/**
 * The teacher has clicked on the show classroom canvas
 * @param canvas the canvas jquery object
 * @param event the jquery click event
 */
View.prototype.showClassroomCanvasClicked = function(canvas, event) {
    //get the canvas DOM elemenet
    var canvasDOMElement = canvas[0];
    
    //get the canvas bounding rectangle
    var canvasRectangle = canvasDOMElement.getBoundingClientRect();
    
    //get the x and y coordinates of where the teacher clicked
    var x = event.clientX - canvasRectangle.left;
    var y = event.clientY - canvasRectangle.top;
    
    //get the integer values of x and y
    x = parseInt(x);
    y = parseInt(y);
    
    //create the params object that will contain the x and y values
    var params = {};
    params.x = x;
    params.y = y;
    
    //draw a red dot at the x, y position
    var context = canvasDOMElement.getContext('2d');
    context.beginPath();
    context.arc(x, y, 4, 0, 2 * Math.PI, false);
    context.fillStyle = 'red';
    context.fill();
    context.lineWidth = 1;
    context.stroke();
    
    //send the teacher input to websockets
    this.sendShowClassroomTeacherInput(params);
};

/**
 * A student has sent a show classroom student input
 * @param data the websocket message from the student
 */
View.prototype.showClassroomStudentInputReceived = function(data) {
    //get the canvas
    var canvas = $('#showClassroomCanvas');
    
    //get the canvas DOM element
    var canvasDOMElement = canvas[0];
    
    //get the x and y values
    var x = data.x;
    var y = data.y;
    
    //get the integer values of x and y
    x = parseInt(x);
    y = parseInt(y);
    
    //get the canvas context
    var canvasContext = canvasDOMElement.getContext('2d');

    //draw a green dot at the x, y position
    canvasContext.beginPath();
    canvasContext.arc(x, y, 4, 0, 2 * Math.PI, false);
    canvasContext.fillStyle = 'green';
    canvasContext.fill();
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = '#003300';
    canvasContext.stroke();
};

/**
 * The premade comments submit button was clicked
 * @param commentBoxId the id of the textarea that we will insert the text into
 */
View.prototype.premadeCommentsSubmitButtonClicked = function(commentBoxId) {
    if(commentBoxId != null) {
        //update the associated comment textarea with the new value
        var premadeCommentsText = $('#premadeCommentsTextArea').val();
        $('#' + this.escapeIdForJquery(commentBoxId)).val(premadeCommentsText);
        $('#' + this.escapeIdForJquery(commentBoxId)).change();
    }
    
    //clear the global premade comments textarea
    $('#premadeCommentsTextArea').val('');
    
    this.hidePremadeCommentsDiv();
};

/**
 * Retrieves the premade comments if we haven't before and
 * then renders the premade comments interface. If the
 * user has opened the premade comments window before
 * we should already have the premade comments from before
 * so we don't need to retrieve them again.
 */
View.prototype.retrievePremadeComments = function() {
    //check if we have retrieved premade comments before
    if(this.premadeCommentLists == null) {
        //we have not retrieved premade comments before so we need to retrieve them
        
        //get the url that will retrieve the premade comments
        var getPremadeCommentsUrl = this.getConfig().getConfigParam('getPremadeCommentsUrl');
        
        //callback when we have received the premade comments from the server
        var getPremadeCommentsCallback = function(text, xml, args) {
            var thisView = args[0];

            thisView.premadeCommentLists = $.parseJSON(text);
            thisView.loadPremadeComments();
        };
        
        //called when we fail to retrieve the premade comments from the server
        var getPremadeCommentsCallbackFail = function(text, args) {
            
        };
        
        var getPremadeCommentsArgs = {};
        
        //make the request for the premade comments
        this.connectionManager.request('GET', 1, getPremadeCommentsUrl, getPremadeCommentsArgs, getPremadeCommentsCallback, [this], getPremadeCommentsCallbackFail);
    }
};

/**
 * Load the premade comments into the UI
 */
View.prototype.loadPremadeComments = function() {
    //get the user name from the userandclassinfo
    var userLoginName = this.getUserAndClassInfo().getUserLoginName();
    
    //get the div that contains all the premade comments lists
    var premadeCommentsListsDiv = $('#premadeCommentsListsDiv');
    
    //loop through all the premade comment lists
    for(var x=0; x<this.premadeCommentLists.length; x++) {
        //get a premade comment list
        var premadeCommentList = this.premadeCommentLists[x];
        
        //check if the signed in user is the owner of this list
        var signedInUserIsOwner = false;
        if(userLoginName == premadeCommentList.owner) {
            signedInUserIsOwner = true;
        }
        
        //create the div that will contain one of the lists
        var premadeCommentsListDiv = this.createPremadeCommentsListDiv(premadeCommentList, signedInUserIsOwner);
        
        //put this premadeCommentsListDiv in the premadeCommentsListsDiv to display it
        premadeCommentsListsDiv.append(premadeCommentsListDiv);

        //allow user to edit the premadecomment list label (the name of the list) in place
        if(signedInUserIsOwner) {
            //make the label editable in place if the user owns this list
            this.makePremadeCommentListLabelEditable(premadeCommentList.id);
            
            //make the comments in the list editable in place
            this.makePremadeCommentListEditable(premadeCommentList);
        }
    }
    
    //make the lists that this user owns sortable
    this.makePremadeCommentListsSortable();
    
    //show a drop-down list of premade comment lists. order alphabetically by title.
    this.premadeCommentLists.sort(this.sortPremadeCommentsListByLabelAlphabetical);
    
    //id of premadecommentsList to show at the beginning. See if last-shown list was stored in localstorage.
    var premadeCommentsListIdToShow = this.premadeCommentLists[0].id;
    
    //get the drop down that is used to select the premade comment list
    var premadeCommentsListLabelDD = $("<select>").attr("id","premadeCommentsListLabelDD");
    
    //loop through all premade comment lists
    for (var i=0; i<this.premadeCommentLists.length; i++) {
        //get a list
        var premadeCommentLists = this.premadeCommentLists[i];
        
        //create a drop down option for the list
        var premadeCommentsListLabelDDItem = $("<option>")
        premadeCommentsListLabelDDItem.attr("id",'premadeCommentsListLabelDDItem_' + premadeCommentLists.id);
        premadeCommentsListLabelDDItem.attr("value", premadeCommentLists.id);
        premadeCommentsListLabelDDItem.text(premadeCommentLists.label);
        
        if (premadeCommentsListIdToShow == premadeCommentLists.id) {
            //if this is the premadeCommentListId to show, select it in the select dropdown list
            premadeCommentsListLabelDDItem.attr("selected","selected");
        };
        
        //add the option to the drop down
        premadeCommentsListLabelDD.append(premadeCommentsListLabelDDItem);
    }
    
    var thisView = this;
    
    premadeCommentsListLabelDD.change({"thisView":thisView}, function() {
        //the teacher has chosen another option in the drop down
    
        //get the value of the option chosen
        var listIdChosen = $(this).val();
        
        //now hide all the lists except the last one that user had opened, or the first one if none exists.
        premadeCommentsListsDiv.find(".premadeCommentsListDiv").hide();
        
        //show just the selected premadecommentslist div.
        premadeCommentsListsDiv.find("#premadeCommentsListDiv_" + listIdChosen).show();     
        
        /*
         * save the current state of the premade comments so that it
         * can be restored the next time the user opens up the premade
         * comments again
         */
        thisView.savePremadeCommentsState();
    });
    
    //add the option to add a new list as the last option in the drop-down
    var newPremadeCommentsListDDItem = $("<option>");
    newPremadeCommentsListDDItem.attr("id","newPremadeCommentsListDDItem");
    newPremadeCommentsListDDItem.attr("value","newPremadeCommentstList");
    newPremadeCommentsListDDItem.text("Create New List...");
    newPremadeCommentsListDDItem.click({"thisView":this},function(event) {
        //the create new list option was chosen
        
        var thisView = event.data.thisView;
        //arguments used in the server post
        var premadeCommentAction = 'addCommentList';
        var postPremadeCommentsCallback = thisView.newPremadeCommentListCallback;
        var premadeCommentId = null;
        var premadeComment = null;
        var premadeCommentListId = null;
        var premadeCommentListLabel = "My New List";
        var isGlobal = null;
        var premadeCommentListPositions = null;
        var projectId = null;

        //make the request to edit the premade comment on the server
        thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, projectId);     
    });
    
    //add the new list option
    premadeCommentsListLabelDD.append(newPremadeCommentsListDDItem);
    
    //add the drop down to the div
    premadeCommentsListsDiv.prepend(premadeCommentsListLabelDD);
    
    //now hide all the lists except the last one that user had opened, or the first one if none exists.
    premadeCommentsListsDiv.find(".premadeCommentsListDiv").hide();
    
    //show just the selected premadecommentslist div.
    premadeCommentsListsDiv.find("#premadeCommentsListDiv_"+premadeCommentsListIdToShow).show();
    
    //display the premade comment list that was last open and check the checkboxes there were previously checked
    this.restorePremadeCommentsState();
};

/**
 * Make the comments in the list editable in the DOM
 * @param premadeCommentList the premade comment list
 */
View.prototype.makePremadeCommentListEditable = function(premadeCommentList) {
    //loop through all the premade comments in the list
    for(var y=0; y<premadeCommentList.premadeComments.length; y++) {
        //get a premade comment
        var premadeComment = premadeCommentList.premadeComments[y];
        
        //get the id of the premade comment
        var premadeCommentId = premadeComment.id;
        
        //make the premade comment editable in place in the DOM
        this.makePremadeCommentEditable(premadeCommentId);
    }
};

/**
 * The callback that is called after the server we receive the
 * response from the editComment request
 * @param text the JSON of the edited comment
 * @param xml
 * @param args
 */
View.prototype.newPremadeCommentListCallback = function(text, xml, args) {
    //obtain the view
    var thisView = args[0];
    
    //parse the premade comment
    var premadeCommentList = $.parseJSON(text);
    
    //update the premade comment list locally
    thisView.addPremadeCommentListLocally(premadeCommentList);
    
    var premadeCommentListId = premadeCommentList.id;

    //create the option in the lists drop down
    var premadeCommentsListLabelDDItem = $("<option>");
    premadeCommentsListLabelDDItem.attr("id",'premadeCommentsListLabelDDItem_' + premadeCommentListId);
    premadeCommentsListLabelDDItem.attr("selected","selected");
    premadeCommentsListLabelDDItem.attr("value", premadeCommentListId);
    premadeCommentsListLabelDDItem.text(premadeCommentList.label);
    premadeCommentsListLabelDDItem.click({"thisView":thisView},function(event) {
        var listIdChosen = this.value;
        var thisView = event.data.thisView;
        
        //now hide all the lists
        $("#premadeCommentsListsDiv").find(".premadeCommentsListDiv").hide();
        
        //show just the selected premadecommentslist div.
        $("#premadeCommentsListsDiv").find("#premadeCommentsListDiv_" + listIdChosen).show();       
        
        /*
         * save the current state of the premade comments so that it
         * can be restored the next time the user opens up the premade
         * comments again
         */
        thisView.savePremadeCommentsState();
    });
    
    //append the list option to the select dropdown
    $("#premadeCommentsListLabelDD").append(premadeCommentsListLabelDDItem);
    
    //now hide all the lists
    $(".premadeCommentsListDiv").hide();

    var signedInUserIsOwner = true;

    //create the div for the new list
    var premadeCommentsListDiv = thisView.createPremadeCommentsListDiv(premadeCommentList,signedInUserIsOwner);

    //put this premadeCommentsListDiv in the premadeCommentsListsDiv to display it
    $("#premadeCommentsListsDiv").append(premadeCommentsListDiv);

    //make the label editable in place if the user owns this list
    thisView.makePremadeCommentListLabelEditable(premadeCommentList.id);                

    //make the comments within the list sortable
    $("#premadeCommentsListDiv_" + premadeCommentListId + ' ul').sortable({handle:'.premadeCommentHandle', update:function(event, ui) {view.sortUpdate(event, ui, view);}});
    
    //show the new premadecommentslist
    $("#premadeCommentsListDiv_" + premadeCommentListId).show();    
    
    /*
     * save the current state of the premade comments so that it
     * can be restored the next time the user opens up the premade
     * comments again
     */
    thisView.savePremadeCommentsState();
};

/**
 * Creates and returns a div for the specified premade comment list.
 * @param premadeCommentList premade comment list
 * @return div for the premade comment list
 */
View.prototype.createPremadeCommentsListDiv = function(premadeCommentList, signedInUserIsOwner) {
    
    //get the id of the list
    var premadeCommentListId = premadeCommentList.id;
    
    //get the label of the list
    var premadeCommentListLabel = premadeCommentList.label;
    
    //sort premade comment list by premade comment listposition
    premadeCommentList.premadeComments = this.sortPremadeCommentList(premadeCommentList.premadeComments);
    
    //make a div for this premade comments list
    var premadeCommentsListDiv = $("<div>");
    premadeCommentsListDiv.attr("id", "premadeCommentsListDiv_" + premadeCommentListId);
    premadeCommentsListDiv.addClass("premadeCommentsListDiv");
    
    //get the name of the premade comment list
    var premadeCommentListLabelP = $("<p>");
    premadeCommentListLabelP.attr("id","premadeCommentsListP_"+premadeCommentListId);
    premadeCommentListLabelP.addClass("premadeCommentsListP");
    premadeCommentListLabelP.css("display","inline");
    premadeCommentListLabelP.html(premadeCommentListLabel);
    
    //add the premade comment list name to the div
    premadeCommentsListDiv.append(premadeCommentListLabelP);
    premadeCommentsListDiv.append("<br>");
    
    if(signedInUserIsOwner) {
        //create the button that the user will use to add a new premade comment
        var premadeCommentListAddCommentButton = $('<input></input>');
        premadeCommentListAddCommentButton.attr('id', 'premadeCommentListAddCommentButton_' + premadeCommentListId);
        premadeCommentListAddCommentButton.attr('type', 'button');
        premadeCommentListAddCommentButton.addClass('premadeCommentListAddCommentButton');
        premadeCommentListAddCommentButton.val('Add New Comment');
        premadeCommentListAddCommentButton.click({thisView:this, premadeCommentListId:premadeCommentListId}, function(event) {
            var thisView = event.data.thisView;
            var premadeCommentListId = event.data.premadeCommentListId;
            
            thisView.addPremadeCommentClicked(premadeCommentListId);
        });
        
        //add the premade comment add comment button to the div
        premadeCommentsListDiv.append(premadeCommentListAddCommentButton);          
        
        //create the button that the user will use to delete this list
        var premadeCommentListDeleteListButton = $('<input></input>');
        premadeCommentListDeleteListButton.attr('id', 'premadeCommentListDeleteListButton_' + premadeCommentListId);
        premadeCommentListDeleteListButton.attr('type', 'button');
        premadeCommentListDeleteListButton.addClass('premadeCommentListDeleteListButton');
        premadeCommentListDeleteListButton.val('Delete This List');
        premadeCommentListDeleteListButton.click({thisView:this, premadeCommentListId:premadeCommentListId}, function(event) {
            var thisView = event.data.thisView;
            var premadeCommentListId = event.data.premadeCommentListId;
            
            thisView.deletePremadeCommentList(premadeCommentListId);
        });
        
        //add the premade comment add comment button to the div
        premadeCommentsListDiv.append(premadeCommentListDeleteListButton);
    }
    
    /*
     * if the signed in user is the owner, we will give it the
     * 'myPremadeCommentList' class so that it will be sortable
     */
    var premadeCommentListULClass = "";
    if(signedInUserIsOwner) {
        premadeCommentListULClass = 'myPremadeCommentList';
    }
    
    //create the UL element that will hold all the premade comments in this list
    var premadeCommentListUL = $('<ul></ul>');
    premadeCommentListUL.attr('id', 'premadeCommentUL_' + premadeCommentListId);
    premadeCommentListUL.css('margin-left', '0px');
    premadeCommentListUL.css('padding-left', '0px');
    if(premadeCommentListULClass != '') {
        premadeCommentListUL.addClass(premadeCommentListULClass);       
    }
    
    //put this UL into the premadeCommentsListDiv
    premadeCommentsListDiv.append(premadeCommentListUL);
    
    //loop through all the premade comments in the list
    for(var y=0; y<premadeCommentList.premadeComments.length; y++) {
        //get a premade comment
        var premadeComment = premadeCommentList.premadeComments[y];
        
        //get the id of the premade comment
        var premadeCommentId = premadeComment.id;
        
        //get the comment
        var comment = premadeComment.comment;
        
        //create the premade comment LI
        var premadeCommentLI = this.createPremadeCommentLI(premadeCommentId, comment, premadeCommentListId, signedInUserIsOwner);
        
        //add the LI to the UL
        premadeCommentListUL.append(premadeCommentLI);
    }
    
    return premadeCommentsListDiv;
};

/**
 * Posts premade comment data back to the server. This handles all premade comments
 * posting. Some of the parameters are optional depending on what kind of post
 * request we are making.
 * e.g. if we are changing the premadeComment text, we do not need to pass
 * in the premadeComentLabels
 * @param premadeCommentAction the type of premade comment data we are sending
 * back to the server such as
 * 'addComment'
 * 'editComment'
 * 'deleteComment'
 * 'reOrderCommentList'
 * 
 * @param postPremadeCommentsCallback the callback function that is called after
 * the post has succeeded
 * @param premadeCommentListId the id of the premade comment list
 * @param premadeCommentListLabel the name of the premade comment list
 * @param premadeCommentId the id of the premade comment
 * @param premadeComment the comment string
 * @param isGlobal whether we are dealing with a global element
 * @param premadeCommentListPositions the positions of the premade comments within a list
 * @param projectId the project id
 */
View.prototype.postPremadeComments = function(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, projectId) {
    //get the url that will post the premade comment to the server
    var postPremadeCommentsUrl = this.getConfig().getConfigParam('postPremadeCommentsUrl');
    
    //called when we fail to send the premade comment data to the server
    var postPremadeCommentsCallbackFail = function(text, args) {

    };
    
    //the post parameters
    var postPremadeCommentsArgs = {
            premadeCommentAction:premadeCommentAction,
            premadeCommentListId:premadeCommentListId,
            premadeCommentListLabel:premadeCommentListLabel,
            premadeCommentId:premadeCommentId,
            premadeComment:premadeComment,
            isGlobal:isGlobal,
            projectId:projectId,
            premadeCommentListPositions:premadeCommentListPositions
    };
    
    //make the post to the server
    this.connectionManager.request('POST', 1, postPremadeCommentsUrl, postPremadeCommentsArgs, postPremadeCommentsCallback, [this, postPremadeCommentsArgs], postPremadeCommentsCallbackFail);
};

/**
 * Create the premade comment LI element
 * @param premadeCommentId the id of the premade comment
 * @param comment the comment text
 * @param premadeCommentListId the id of the premade comment list
 * @param signedInUserIsOwner boolean whether the signed in user is the owner of
 * the list this premade comment is part of
 * @return an LI element that contains a select button, the premade comment text,
 * a drag handle, and a delete button
 */
View.prototype.createPremadeCommentLI = function(premadeCommentId, comment, premadeCommentListId, signedInUserIsOwner) {
    //get the premade comment dom id for the element that will hold the comment text
    var premadeCommentDOMId = this.getPremadeCommentDOMId(premadeCommentId);
    
    //create the LI element that will hold the button, the comment, and the handle
    var premadeCommentLI = $('<li></li>');
    premadeCommentLI.attr('id', 'premadeCommentLI_' + premadeCommentId);
    premadeCommentLI.css('list-style-type', 'none');
    premadeCommentLI.css('margin-left', '0px');
    premadeCommentLI.css('padding-left', '0px');
    premadeCommentLI.addClass('premadeCommentLI');
    
    /*
     * the input button the user will click to choose the comment.
     * this is not displayed in the authoring tool but is displayed
     * in the grading tool.
     */
    var premadeCommentSelectButton = $('<input></input>');
    premadeCommentSelectButton.attr('id', 'premadeCommentSelectButton_' + premadeCommentId);
    premadeCommentSelectButton.attr('type', 'button');
    premadeCommentSelectButton.val('Select');
    premadeCommentSelectButton.click({thisView:this, premadeCommentDOMId:premadeCommentDOMId}, function(event) {
        var thisView = event.data.thisView;
        var premadeCommentDOMId = event.data.premadeCommentDOMId;
        
        thisView.selectPremadeComment(premadeCommentDOMId);
    });
    
    premadeCommentLI.append(premadeCommentSelectButton);
    
    //create a space between the Select button and the comment text
    var spacingP = $('<p></p>');
    spacingP.css('display', 'inline');
    spacingP.text(' ');
    
    //the p element that will display the comment
    var premadeCommentP = $('<p></p>');
    premadeCommentP.attr('id', premadeCommentDOMId);
    premadeCommentP.css('display', 'inline');
    premadeCommentP.text(comment);

    //add the elements to the LI
    premadeCommentLI.append(spacingP);
    premadeCommentLI.append(premadeCommentP);

    /*
     * check if the signed in user is the owner of the list so we can determine
     * if we want to display the '[Drag Me]' and Delete button UI elements
     */
    if(signedInUserIsOwner) {
        //the p element that will display the handle to use for re-ordering comments in the list
        var premadeCommentDragHandle = $('<p></p>');
        premadeCommentDragHandle.attr('id', 'premadeCommentHandle_' + premadeCommentId);
        premadeCommentDragHandle.css('display', 'inline');
        premadeCommentDragHandle.css('cursor', 'pointer');
        premadeCommentDragHandle.addClass('premadeCommentHandle');
        premadeCommentDragHandle.text('[Drag Me]');
        
        //the delete button to delete the premade comment
        var premadeCommentDeleteButton = $('<input></input>');
        premadeCommentDeleteButton.attr('id', 'premadeCommentDeleteButton_' + premadeCommentId);
        premadeCommentDeleteButton.attr('type', 'button');
        premadeCommentDeleteButton.val('Delete');
        premadeCommentDeleteButton.click({thisView:this, premadeCommentId:premadeCommentId, premadeCommentListId:premadeCommentListId}, function(event) {
            var thisView = event.data.thisView;
            var premadeCommentId = event.data.premadeCommentId;
            var premadeCommentListId = event.data.premadeCommentListId;
            
            thisView.deletePremadeComment(premadeCommentId, premadeCommentListId);
        });
        
        //add the elements to the LI
        premadeCommentLI.append(document.createTextNode(' '));
        premadeCommentLI.append(premadeCommentDragHandle);
        premadeCommentLI.append(document.createTextNode(' '));
        premadeCommentLI.append(premadeCommentDeleteButton);
    }
    
    return premadeCommentLI;
};

/**
 * Called when the user chooses a premade comment to use
 * @param premadeCommentDOMId the dom id of the element that contains
 * the premade comment text
 */
View.prototype.selectPremadeComment = function(premadeCommentDOMId) {
    //obtain the text already in the text area
    var existingCommentText = $('#premadeCommentsTextArea').val();
    
    if(existingCommentText != '') {
        //add a new line if text already exists in the textarea
        existingCommentText = existingCommentText + '\n';
    }
    
    //get the premade comment text
    var premadeCommentText = $('#' + premadeCommentDOMId).text();
    
    /*
     * retrieve the premade comment text that was chosen and append it
     * into the text area at the bottom of the premade comments window
     * so the user can view it and modify it if they decide to do so
     */
    $('#premadeCommentsTextArea').val(existingCommentText + premadeCommentText);
};

/**
 * Create the call to delete a premade comment list
 * @param premadeCommentListId the id of the premade comment list to delete
 */
View.prototype.deletePremadeCommentList = function(premadeCommentListId) {
    //first confirm with user that they want to delete this list
    var doDelete = confirm("Are you sure you want to delete this list? This action cannot be undone.");
    if (doDelete) {
        //arguments used in the server request to create a new comment
        var premadeCommentAction = 'deleteCommentList';
        var postPremadeCommentsCallback = this.deletePremadeCommentListCallback;
        var premadeCommentListLabel = null;
        var premadeCommentId = null;
        var premadeComment = null;
        var isGlobal = null;
        var premadeCommentListPositions = null;
        var projectId = null;
        
        //make the request to create a new comment
        this.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, projectId);     
    };
};

/**
 * Called after the server deletes a premade comment list
 * @param text the JSON of the old premade comment list comment
 * @param xml
 * @param args
 */
View.prototype.deletePremadeCommentListCallback = function(text, xml, args) {
    //obtain the view
    var thisView = args[0];
    
    //parse the premade comment
    var premadeCommentList = $.parseJSON(text);
    
    //obtain the premade comment list id
    var premadeCommentListId = premadeCommentList.id;
        
    //remove premadecomment list item from dropdown
    $("#premadeCommentsListLabelDDItem_" + premadeCommentListId).remove();
    
    //remove premadecomment list div
    $("#premadeCommentsListDiv_" + premadeCommentListId).remove();
    
    //get premadecommentlist id of the newly-selected dropdown item after the deletion. selection happens automatically.
    var newlySelectedPremadeCommentListId = $("#premadeCommentsListLabelDD").find(":selected").val();
    
    //show the newly-selected premadecommentlist
    $("#premadeCommentsListDiv_" + newlySelectedPremadeCommentListId).show();
    
    /*
     * save the current state of the premade comments so that it
     * can be restored the next time the user opens up the premade
     * comments again
     */
    thisView.savePremadeCommentsState();
        
    //delete the premade comment from our local array of premade comments
    thisView.deletePremadeCommentListLocally(premadeCommentListId);
};

/**
 * Delete the premade comment list from our local copy of the premade comment lists
 * @param premadeCommentListId the id of the premade comment list to delete
 */
View.prototype.deletePremadeCommentListLocally = function(premadeCommentListId) {   
    var indexOfPremadeCommentList = -1;
    // loop thru the premadecommentslist and find index of premadeCommentList
    for (var i=0; i<this.premadeCommentLists.length;i++) {
        if (this.premadeCommentLists[i].id == premadeCommentListId) {
            indexOfPremadeCommentList = i;
        }   
    };
    if (indexOfPremadeCommentList > -1) {
        // remove from list
        this.premadeCommentLists.splice(indexOfPremadeCommentList,1);
    }
};

/**
 * Get the premade comment dom id of the element that holds the comment
 * text
 * @param premadeCommentId the id of the premade comment (an integer)
 * @return a string containing the dom id
 */
View.prototype.getPremadeCommentDOMId = function(premadeCommentId) {
    return 'premadeComment_' + premadeCommentId;
};

/**
 * Sort the premade comment list by premade comment list positions
 * in descending order (largest first, smallest last)
 * @param an array of premade comments
 */
View.prototype.sortPremadeCommentList = function(premadeCommentList) {
    premadeCommentList = premadeCommentList.sort(this.sortPremadeCommentListByListPositions);
    
    return premadeCommentList;
};

/**
 * A sorting function used as an argument to array.sort() to sort premade
 * comment list labels alphabetically
 * @param a some premade comment list
 * @param b some premade comment list
 * @return
 * true if b comes after a
 * false if a comes after b
 */
View.prototype.sortPremadeCommentsListByLabelAlphabetical = function(a, b) {
    var aListLabel = a.label.toLowerCase();
    var bListLabel = b.label.toLowerCase();
    return aListLabel > bListLabel;
};

/**
 * A sorting function used as an argument to array.sort() to sort premade
 * comments in a premade comment list in descending order (largest first,
 * smallest last)
 * @param a some premade comment
 * @param b some premade comment
 * @return
 * true if b comes after a
 * false if a comes after b
 */
View.prototype.sortPremadeCommentListByListPositions = function(a, b) {
    var aListPosition = a.listPosition;
    var bListPosition = b.listPosition;
    
    return aListPosition < bListPosition;
};

/**
 * Save the current state of the premade comments which includes
 * which premade comment list is being shown and which checkboxes
 * are checked
 */
View.prototype.savePremadeCommentsState = function() {
    //get the premade comment list option that is selected and being shown
    var selectedPremadeCommentListOption = $('#premadeCommentsListLabelDD option:selected');
    
    if(selectedPremadeCommentListOption.length > 0) {
        //get the DOM option element for the premade comment list
        var selectedPremadeCommentList = selectedPremadeCommentListOption[0];
        
        //get the premade comment list id
        var premadeCommentListIdSelected = parseInt(selectedPremadeCommentList.value);
        
        //create an object to contain the information we are saving
        var wise4PremadeCommentsState = {
            premadeCommentListIdSelected:premadeCommentListIdSelected
        };
        
        /*
         * save the object to local storage so we can retrieve it the next
         * time the premade comments page is open
         */
        this.setLocalStorageValue('wise4PremadeCommentsState', wise4PremadeCommentsState);
    }
};


/**
 * Restore the previous state of the premade comments which includes
 * which premade comment list was being shown
 */
View.prototype.restorePremadeCommentsState = function() {
    //get the local storage item we saved from the previous session
    var wise4PremadeCommentsState = this.getLocalStorageValue('wise4PremadeCommentsState');
    
    if(wise4PremadeCommentsState != null) {
        //create the JSON object
        wise4PremadeCommentsState = JSON.parse(wise4PremadeCommentsState);
        
        if(wise4PremadeCommentsState != null) {
            //get the premade comment list id that was previously shown
            var premadeCommentListIdSelected = wise4PremadeCommentsState.premadeCommentListIdSelected;
            
            if(premadeCommentListIdSelected != null) {
                /*
                 * try to retrieve the list with the given list id to make sure
                 * the id corresponds to one of our lists and not someone else's
                 */
                var premadeCommentList = this.getPremadeCommentListLocally(premadeCommentListIdSelected);
                
                if(premadeCommentList != null) {
                    //select the list in the drop down
                    $('#premadeCommentsListLabelDDItem_' + premadeCommentListIdSelected).attr('selected', 'selected');

                    //hide all the lists
                    $(".premadeCommentsListDiv").hide();
                    
                    //show just the selected premadecommentslist div
                    $("#premadeCommentsListDiv_" + premadeCommentListIdSelected).show();
                }
            }
        }
    }
};

/**
 * Create the call to add a new premade comment to a list
 * @param premadeCommentListId the id of the premade comment list
 */
View.prototype.addPremadeCommentClicked = function(premadeCommentListId) {
    //arguments used in the server request to create a new comment
    var premadeCommentAction = 'addComment';
    var postPremadeCommentsCallback = this.addPremadeCommentCallback;
    var premadeCommentListLabel = null;
    var premadeCommentId = null;
    var premadeComment = null;
    var isGlobal = null;
    var premadeCommentListPositions = null;
    var projectId = null;
    
    //make the request to create a new comment
    this.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, projectId);
};

/**
 * Called after the server creates a new comment
 * @param text the JSON of the new comment
 * @param xml
 * @param args
 */
View.prototype.addPremadeCommentCallback = function(text, xml, args) {
    //obtain the view
    var thisView = args[0];
    
    //parse the premade comment
    var premadeComment = $.parseJSON(text);
    
    //obtain the premade comment list id
    var premadeCommentListId = premadeComment.premadeCommentListId;
    
    //obtain the premade comment id
    var premadeCommentId = premadeComment.id;
    
    //this is a new comment so the comment will be empty
    var premadeCommentMessage = premadeComment.comment;
    
    //create the LI element for the premade comment
    var premadeCommentLI = thisView.createPremadeCommentLI(premadeCommentId, premadeCommentMessage, premadeCommentListId, true);
    
    //add the premade comment LI to the top of the premade comment list UL
    $('#premadeCommentUL_' + premadeCommentListId).prepend(premadeCommentLI);
    
    //make the premade comment LI editable
    thisView.makePremadeCommentEditable(premadeCommentId);
    
    //add the premade comment to our local array of premade comments
    thisView.addPremadeCommentLocally(premadeCommentListId, premadeComment);
};

/**
 * Add the premade comment to our local copy of the premade comment list
 * @param premadeCommentListId the id of the premade comment list to add
 * the new premade comment to
 * @param premadeComment the new premade comment
 */
View.prototype.addPremadeCommentLocally = function(premadeCommentListId, premadeComment) {
    //get the premade comment list
    var premadeCommentList = this.getPremadeCommentListLocally(premadeCommentListId);
    
    /*
     * add the premade comment to the premade comments array in the
     * premade comment list object
     */ 
    premadeCommentList.premadeComments.push(premadeComment);
};

/**
 * Get a premade comment list given the premade comment list id
 * @param premadeCommentListId the id of the premade comment list
 * @return a premade comment list object
 */
View.prototype.getPremadeCommentListLocally = function(premadeCommentListId) {
    //loop through all the premade comment lists
    for(var x=0; x<this.premadeCommentLists.length; x++) {
        //get a premade comment list
        var currentPremadeCommentList = this.premadeCommentLists[x];
        
        //get the id of the premade comment list
        var currentPremadeCommentListId = currentPremadeCommentList.id;
        
        //check if the id matches
        if(currentPremadeCommentListId == premadeCommentListId) {
            //the id matches so we will return the list
            return currentPremadeCommentList;
        }
    }
    
    //the list was not found
    return null;
};

/**
 * Make a premade comment editable in place
 * @param premadeCommentId the id of the premade comment
 */
View.prototype.makePremadeCommentEditable = function(premadeCommentId) {
    //obtain the dom id of the element that holds the comment text
    var premadeCommentDOMId = this.getPremadeCommentDOMId(premadeCommentId);
    
    //make the comment editable in place
    $("#" + premadeCommentDOMId).editInPlace({callback:this.editPremadeComment, params:[this], text_size:60});
    $("#" + premadeCommentDOMId).attr('maxlength', 10);
};

/**
 * Called when the user finishes editing the comment in place
 * @param idOfEditor the dom id of the element that contains the comment text
 * @param enteredText the text that the user entered
 * @param originalText the text that was there before the user edited
 * @param args an array that holds extra args, in our case the view
 * @return the entered text
 */
View.prototype.editPremadeComment = function(idOfEditor, enteredText, originalText, args) {
    //get the view
    var thisView = args[0];
    
    //arguments used in the server post
    var premadeCommentAction = 'editComment';
    var postPremadeCommentsCallback = thisView.editPremadeCommentCallback;
    var premadeCommentListId = null;
    var premadeCommentListLabel = null;
    
    //get the premade comment id (an integer)
    var premadeCommentId = idOfEditor.replace('premadeComment_', '');
    var premadeComment = enteredText;
    var isGlobal = null;
    var premadeCommentListPositions = null;
    var projectId = null;
    
    //get the length of the premade comment
    var premadeCommentLength = premadeComment.length;
    
    if(premadeCommentLength > 255) {
        //the database column is varchar(255) so premade comments can only be a max of 255 chars
        
        //display the error message
        alert("Error: Premade comment length must be 255 characters or less. Your premade comment is " + premadeCommentLength + " characters long. Your premade comment will be truncated.");
        
        //truncate the premade comment to 255 chars
        premadeComment = premadeComment.substring(0, 255);
    }
    
    //make the request to edit the premade comment on the server
    thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, projectId);
    
    return premadeComment;
};

/**
 * The callback that is called after the server we receive the
 * response from the editComment request
 * @param text the JSON of the edited comment
 * @param xml
 * @param args
 */
View.prototype.editPremadeCommentCallback = function(text, xml, args) {
    //obtain the view
    var thisView = args[0];
    
    //parse the premade comment
    var premadeComment = $.parseJSON(text);

    //update the premade comment locally
    thisView.editPremadeCommentLocally(premadeComment);
};

/**
 * Updates the the comment text in our local copy of the premade comments
 * @param premadeComment the premade comment that was updated
 */
View.prototype.editPremadeCommentLocally = function(premadeComment) {
    //loop through all the premade comment lists
    for(var x=0; x<this.premadeCommentLists.length; x++) {
        //get a premade comment list
        var premadeCommentList = this.premadeCommentLists[x];
        
        //get the array of premade comments in the list
        var premadeComments = premadeCommentList.premadeComments;
        
        //loop through all the premade comments
        for(var y=0; y<premadeComments.length; y++) {
            //get a premade comment
            var currentPremadeComment = premadeComments[y];
            
            /*
             * check if the current premade comment has the same id
             * as the one we need to update
             */
            if(currentPremadeComment.id == premadeComment.id) {
                //update the comment text
                currentPremadeComment.comment = premadeComment.comment;
            }
        }
    }
};

/**
 * Add the new premade comment list to our array of lists
 * @param premadeCommentList the new premade comment list
 */
View.prototype.addPremadeCommentListLocally = function(premadeCommentList) {
    //add the new premade comment list to our array of lists
    this.premadeCommentLists.push(premadeCommentList);
};

/**
 * Make a premade comment list label editable in place
 * @param premadeCommentId the id of the premade comment list
 */
View.prototype.makePremadeCommentListLabelEditable = function(premadeCommentListId) {
    //make the comment editable in place
    $("#premadeCommentsListP_" + premadeCommentListId).editInPlace({callback:this.editPremadeCommentListLabel, params:[this], text_size:60});   
};


/**
 * Called when the user finishes editing the comment list label in place
 * @param idOfEditor the dom id of the element that contains the comment list label text
 * @param enteredText the text that the user entered
 * @param originalText the text that was there before the user edited
 * @param args an array that holds extra args, in our case the view
 * @return the entered text
 */
View.prototype.editPremadeCommentListLabel = function(idOfEditor, enteredText, originalText, args) {
    //get the view
    var thisView = args[0];
    
    //arguments used in the server post
    var premadeCommentAction = 'editCommentListLabel';
    var postPremadeCommentsCallback = thisView.editPremadeCommentListLabelCallback;
    var premadeCommentId = null;
    var premadeComment = null;
    
    //get the premade comment id (an integer)
    var premadeCommentListId = idOfEditor.replace('premadeCommentsListP_', '');
    var premadeCommentListLabel = enteredText;
    var isGlobal = null;
    var premadeCommentListPositions = null;
    var projectId = null;
    
    //get the length of the premade comment
    var premadeCommentLength = premadeCommentListLabel.length;
    
    if(premadeCommentLength > 255) {
        //the database column is varchar(255) so premade comments can only be a max of 255 chars
        
        //display the error message
        thisView.premadeCommentsWindow.alert("Error: Premade comment list label length must be 255 characters or less. Your label is " + premadeCommentLength + " characters long. Your label will be truncated.");
        
        //truncate the premade comment to 255 chars
        premadeCommentListLabel = premadeCommentListLabel.substring(0, 255);
    }
    
    //make the request to edit the premade comment on the server
    thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, projectId);
    
    return premadeCommentListLabel;
};

/**
 * The callback that is called after the server we receive the
 * response from the editComment request
 * @param text the JSON of the edited comment
 * @param xml
 * @param args
 */
View.prototype.editPremadeCommentListLabelCallback = function(text, xml, args) {
    //obtain the view
    var thisView = args[0];
    
    //parse the premade comment
    var premadeCommentList = $.parseJSON(text);

    //update the list label text on the select dropdown
    $("#premadeCommentsListLabelDDItem_" + premadeCommentList.id).html(premadeCommentList.label);
    
    //update the premade comment list locally
    thisView.editPremadeCommentListLabelLocally(premadeCommentList);
};

/**
 * Updates the the comment text in our local copy of the premade comments
 * @param premadeComment the premade comment that was updated
 */
View.prototype.editPremadeCommentListLabelLocally = function(premadeCommentListIn) {
    //loop through all the premade comment lists
    for(var x=0; x<this.premadeCommentLists.length; x++) {
        //get a premade comment list
        var premadeCommentList = this.premadeCommentLists[x];
        
        if (premadeCommentList.id == premadeCommentListIn.id) {
            premadeCommentList.label = premadeCommentListIn.label;
        };
    };
};


/**
 * Called when the user clicks on the delete button for a premade comment
 * @param premadeCommentId the id of the premade comment
 * @param premadeCommentListId the id of the premade comment list
 */
View.prototype.deletePremadeComment = function(premadeCommentId, premadeCommentListId) {
    //arguments used in the server post
    var premadeCommentAction = 'deleteComment';
    var postPremadeCommentsCallback = this.deletePremadeCommentCallback;
    var premadeCommentListLabel = null;
    var premadeComment = null;
    var isGlobal = null;
    var premadeCommentListPositions = null;
    var projectId = null;
    
    //make the request to delete the premade comment on the server
    this.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, projectId);
};

/**
 * Callback called after the server deletes a premade comment
 * @param text the JSON for the premade comment that was deleted
 * @param xml
 * @param args
 */
View.prototype.deletePremadeCommentCallback = function(text, xml, args) {
    //obtain the view
    var thisView = args[0];
    
    //get the post args
    var postPremadeCommentsArgs = args[1];
    
    //get the premade comment list id
    var premadeCommentListId = postPremadeCommentsArgs.premadeCommentListId;
    
    //parse the premade comment
    var premadeComment = $.parseJSON(text);
    
    //obtain the premade comment id
    var premadeCommentId = premadeComment.id;
    
    //remove the LI for the deleted premade comment
    var premadeCommentLIId = 'premadeCommentLI_' + premadeCommentId;
    
    $("#" + premadeCommentLIId).remove();
    
    //delete the premade comment locally
    thisView.deletePremadeCommentLocally(premadeComment);
    
    /*
     * save the current state of the premade comments which includes
     * which list id is being displayed
     */
    thisView.savePremadeCommentsState();
};

/**
 * Delete the premade comment locally
 * @param premadeComment the premade comment to delete
 */
View.prototype.deletePremadeCommentLocally = function(premadeComment) {
    //loop through all the premade comment lists
    for(var x=0; x<this.premadeCommentLists.length; x++) {
        //get a premade comment list
        var premadeCommentList = this.premadeCommentLists[x];
        
        //get the array of premade comments
        var premadeComments = premadeCommentList.premadeComments;
        
        //loop through all the premade comments
        for(var y=0; y<premadeComments.length; y++) {
            //get a premade comment
            var currentPremadeComment = premadeComments[y];
            
            //compare the current premade comment id with the one we need to delete
            if(currentPremadeComment.id == premadeComment.id) {
                //the ids match so we will remove this premade comment from the array
                premadeComments.splice(y, 1);
                
                return;
            }
        }
    }
};

/**
 * Make the premade comment lists sortable
 */
View.prototype.makePremadeCommentListsSortable = function() {
    //make the lists that the user owns sortable
    $('.myPremadeCommentList').sortable({handle:'.premadeCommentHandle', update:function(event, ui) {view.sortUpdate(event, ui, view);}});
};


/**
 * This is used as the function call for when the sortable
 * list fires the update event. This function creates an array
 * that will contain the order of the premade comment ids.
 * 
 * e.g.
 * premade comment 10 = "great job"
 * premade comment 11 = "needs more facts"
 * premade comment 12 = "incorrect"
 * 
 * are in a list and in the list they are sorted in the order
 * 
 * "needs more facts"
 * "great job"
 * "incorrect"
 * 
 * so the array will contain the premade comment ids in this order
 * 
 * 11, 10, 12
 * 
 * the index specifies the list position and the value is the premade comment id
 * 
 * index - premadeCommentId - listPosition
 * [0] - 11 - 1
 * [1] - 10 - 2
 * [2] - 12 - 3
 * 
 * @param event
 * @param ui
 * @param thisView
 */
View.prototype.sortUpdate = function(event, ui, thisView) {
    //the array we will store the premade comment ids in
    var listPositions = [];
    
    //get the id of the UL that was updated
    var ulElementId = $(event.target).attr('id');
    
    //get the list id
    var listId = ulElementId.replace('premadeCommentUL_', '');
    
    //get all the LI elements in the UL
    var liElementsInUL = $(event.target).find('li');
    
    //loop through all the LI elements
    for(var x=0; x<liElementsInUL.length; x++) {
        //get an LI element
        var liElement = liElementsInUL[x];
        
        //get the premade comment id
        var liElementId = liElement.id.replace('premadeCommentLI_', '');
        
        //put the premade comment id into the array
        listPositions.push(parseInt(liElementId));
    }
    
    /*
     * reverse the array so that the top of the list becomes the end of
     * the array. we want to do this because we want the top of the
     * list to have the highest index value since the newer premade
     * comments should have larger list positions. this is so that
     * when we add a new premade comment we just set the list position
     * as the next highest available position as opposed to setting it
     * to 1 and then having to shift all the other elements by 1.
     */
    listPositions.reverse();

    //arguments used in the server post
    var premadeCommentAction = 'reOrderCommentList';
    var postPremadeCommentsCallback = thisView.reOrderPremadeCommentCallback;
    var premadeCommentListId = listId;
    var premadeCommentListLabel = null;
    
    //get the premade comment id (an integer)
    var premadeCommentId = null;
    var premadeComment = null;
    var isGlobal = null;
    var premadeCommentListPositions = $.stringify(listPositions);
    var projectId = null;
    
    thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, projectId);
};

/**
 * Callback called after we receive the response from a
 * reOrderCommentList request
 * @param text a JSON object containing the list id and an array
 * containing list positions
 * @param xml
 * @param args
 */
View.prototype.reOrderPremadeCommentCallback = function(text, xml, args) {
    //obtain the view
    var thisView = args[0];
    
    //parse the premade comment
    var reOrderReturn = $.parseJSON(text);
    
    //get the premade comment list id
    var premadeCommentListId = reOrderReturn.premadeCommentListId;
    
    //get the list positions
    var listPositions = reOrderReturn.listPositions;
    
    //re-order the premade comments in the list in our local copy
    thisView.reOrderPremadeCommentLocally(premadeCommentListId, listPositions);
};

/**
 * Re-order a premade comment list locally
 * @param premadeCommentListId the id of the premade comment list
 * @param listPositions an array containing premade comment ids in the order
 * that they should be positioned in the list
 * 
 * 
 * e.g.
 * premade comment 10 = "great job"
 * premade comment 11 = "needs more facts"
 * premade comment 12 = "incorrect"
 * 
 * are in a list and in the list they are sorted in the order
 * 
 * "needs more facts"
 * "great job"
 * "incorrect"
 * 
 * so the array will contain the premade comment ids in this order
 * 
 * 11, 10, 12
 * 
 * the index specifies the list position and the value is the premade comment id
 * 
 * index - premadeCommentId - listPosition
 * [0] - 11 - 1
 * [1] - 10 - 2
 * [2] - 12 - 3
 */
View.prototype.reOrderPremadeCommentLocally = function(premadeCommentListId, listPositions) {
    //get the premade comment list with the given id
    var premadeCommentList = this.getPremadeCommentListLocally(premadeCommentListId);
    
    //get the array of premade comments from the list
    var premadeComments = premadeCommentList.premadeComments;
    
    //loop through all the premade comments
    for(var x=0; x<premadeComments.length; x++) {
        //get a premade comment
        var currentPremadeComment = premadeComments[x];
        
        //get the id of the premade comment
        var currentPremadeCommentId = currentPremadeComment.id;
        
        //find the index of the premade comment id within the listPositions array
        var listPositionIndex = listPositions.indexOf(currentPremadeCommentId);
        
        //update the listPosition of the premade comment
        currentPremadeComment.listPosition = listPositionIndex + 1;
    }
};


/**
 * Set the key value pair into the localStorage if localStorage exists
 * @param key the key as a string
 * @param value the value as a string, number, or object
 */
View.prototype.setLocalStorageValue = function(key, value) {
    if(localStorage) {
        //localStorage is available on this browser
        
        if(value == null) {
            localStorage.setItem(key, value);
        } else if(typeof value == 'object') {
            /*
             * the value is an object so we will turn it into a string
             * since values can only be numbers or strings
             */
            localStorage.setItem(key, JSON.stringify(value));
        } else if(typeof value == 'string') {
            localStorage.setItem(key, value);
        }
    }
};

/**
 * Get the key value from localStorage if localStorage exists
 * @param key the key as a string
 * @returns the value corresponding to the key, or null if
 * localStorage is not available on this browser
 */
View.prototype.getLocalStorageValue = function(key) {
    var value = null;
    
    if(localStorage) {
        value = localStorage.getItem(key);
    }
    
    return value;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
    eventManager.fire('scriptLoaded', 'vle/view/classroomMonitor/classroomMonitorView_main.js');
}