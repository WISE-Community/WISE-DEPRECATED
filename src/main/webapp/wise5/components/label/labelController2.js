class LabelController {
    constructor(
        $injector,
        $scope,
        $timeout,
        LabelService,
        NodeService,
        OpenResponseService,
        StudentAssetService,
        StudentDataService
    ) {

        this.$injector = $injector;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.LabelService = LabelService;
        this.NodeService = NodeService;
        this.OpenResponseService = OpenResponseService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // holds student attachments like assets
        this.attachments = [];

        // whether the step should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // whether this component is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // whether the new label button is shown or not
        this.isNewLabelButtonVisible = true;

        // whether the cancel button is shown or not
        this.isCancelButtonVisible = false;

        // whether the student can create new labels
        this.canCreateLabels = true;

        // whether the student can delete labels
        this.canDeleteLabels = true;

        // whether the student is in the mode to create a new label
        this.createLabelMode = false;

        // a reference to the canvas
        this.canvas = null;

        // the canvas width
        this.canvasWidth = 800;

        // the canvas height
        this.canvasHeight = 600;

        // the z index of line elements
        this.lineZIndex = 0;

        // the z index of text elements
        this.textZIndex = 1;

        // the z index of circle elements
        this.circleZIndex = 2;

        // the canvas id
        this.canvasId = 'c';

        // the background image path
        this.backgroundImage = null;

        // the message to display when the student is in create label mode
        this.newLabelMessage = 'Click on the image or ';

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.component;

        this.mode = this.$scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            // get the component state from the scope
            var componentState = this.$scope.componentState;

            if (this.componentContent.canCreateLabels != null) {
                this.canCreateLabels = this.componentContent.canCreateLabels;
            }

            if (this.componentContent.canDeleteLabels != null) {
                this.canDeleteLabels = this.componentContent.canDeleteLabels;
            }

            if (this.componentContent.width != null) {
                this.canvasWidth = this.componentContent.width;
            }

            if (this.componentContent.height != null) {
                this.canvasHeight = this.componentContent.height;
            }

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                if (this.canCreateLabels) {
                    this.isNewLabelButtonVisible = true;
                } else {
                    this.isNewLabelButtonVisible = false;
                }
            } else if (this.mode === 'grading') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isNewLabelButtonVisible = false;
                this.canDeleteLabels = false;
                this.isDisabled = true;

                if (componentState != null) {
                    this.canvasId = 'labelCanvas_' + componentState.id;
                }
            } else if (this.mode === 'onlyShowWork') {
                this.isPromptVisible = false;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isNewLabelButtonVisible = false;
                this.canDeleteLabels = false;
                this.isDisabled = true;
            }

            this.$timeout(angular.bind(this, function() {
                // wait for angular to completely render the html before we initialize the canvas

                // initialize the canvas
                var canvas = this.initializeCanvas();
                this.canvas = canvas;

                // get the component state from the scope
                var componentState = this.$scope.componentState;

                if (this.canDeleteLabels && !this.disabled) {
                    // create the key down listener to listen for the delete key
                    this.createKeydownListener();
                }

                // set whether studentAttachment is enabled
                this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

                if (componentState == null) {
                    /*
                     * only import work if the student does not already have
                     * work for this component
                     */

                    // check if we need to import work
                    var importWorkNodeId = this.componentContent.importWorkNodeId;
                    var importWorkComponentId = this.componentContent.importWorkComponentId;

                    if (importWorkNodeId != null && importWorkComponentId != null) {
                        // import the work from the other component
                        this.importWork();
                    } else if (this.componentContent.labels != null) {
                        /*
                         * the student has not done any work and there are starter labels
                         * so we will populate the canvas with the starter labels
                         */
                        this.addLabelsToCanvas(this.componentContent.labels);
                    }
                } else {
                    // populate the student work into this component
                    this.setStudentWork(componentState);
                }

                // get the background image that may have been set by the student data
                var backgroundImage = this.getBackgroundImage();

                if (backgroundImage == null && this.componentContent.backgroundImage != null) {
                    // get the background image from the component content if any
                    this.setBackgroundImage(this.componentContent.backgroundImage);
                }

                // check if we need to lock this component
                this.calculateDisabled();

                if (this.$scope.$parent.registerComponentController != null) {
                    // register this component with the parent node
                    this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
                }
            }));
        }

        /**
         * Returns true iff there is student work that hasn't been saved yet
         */
        this.$scope.isDirty = function() {
            return this.$scope.labelController.isDirty;
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function() {

            var componentState = null;

            if (this.$scope.labelController.isDirty) {
                // create a component state populated with the student data
                componentState = this.$scope.labelController.createComponentState();

                // set isDirty to false since this student work is about to be saved
                this.$scope.labelController.isDirty = false;
            }

            return componentState;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', angular.bind(this, function(event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {

                if (this.isLockAfterSubmit()) {
                    // disable the component if it was authored to lock after submit
                    this.isDisabled = true;
                }
            }
        }));

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function(event, args) {

        }));
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */
    setStudentWork(componentState) {

        if (componentState != null) {

            var studentData = componentState.studentData;

            if (studentData != null) {

                // get the labels from the student data
                var labels = studentData.labels;

                // add the labels to the canvas
                this.addLabelsToCanvas(labels);

                // get the background image from the student data
                var backgroundImage = studentData.backgroundImage;

                if (backgroundImage != null) {
                    this.setBackgroundImage(backgroundImage);
                }
            }
        }
    };

    /**
     * Add labels ot the canvas
     * @param labels an array of objects that contain the values for a label
     */
    addLabelsToCanvas(labels) {
        if (labels != null) {

            // loop through all the labels
            for (var x = 0; x < labels.length; x++) {

                // get a label
                var label = labels[x];

                if (label != null) {

                    // get the values of the label
                    var pointX = label.pointX;
                    var pointY = label.pointY;
                    var textX = label.textX;
                    var textY = label.textY;
                    var text = label.text;
                    var color = label.color;

                    // create the label
                    var label = this.createLabel(pointX, pointY, textX, textY, text, color);

                    // add the label to the canvas
                    this.addLabelToCanvas(this.canvas, label);
                }
            }
        }
    };

    /**
     * Called when the student clicks the save button
     */
    saveButtonClicked() {

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
     * Called when the student clicks the submit button
     */
    submitButtonClicked() {
        this.isSubmit = true;

        // check if we need to lock the component after the student submits
        if (this.isLockAfterSubmit()) {
            this.isDisabled = true;
        }

        // tell the parent node that this component wants to submit
        this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
     * Called when the student clicks on the new label button to enter
     * create label mode
     */
    newLabelButtonClicked() {
        this.createLabelMode = true;
        this.isCancelButtonVisible = true;
    };

    /**
     * Called when the student clicks on the cancel button to exit
     * create label mode
     */
    cancelButtonClicked() {
        this.createLabelMode = false;
        this.isCancelButtonVisible = false;
    };

    /**
     * Called when the student changes their work
     */
    studentDataChanged() {
        /*
         * set the dirty flag so we will know we need to save the
         * student work later
         */
        this.isDirty = true;

        // get this part id
        var componentId = this.getComponentId();

        // create a component state populated with the student data
        var componentState = this.createComponentState();

        /*
         * the student work in this component has changed so we will tell
         * the parent node that the student data will need to be saved.
         * this will also notify connected parts that this component's student
         * data has changed.
         */
        this.$scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
    };

    /**
     * Get the label objects from the canvas
     * @returns an array of simple JSON objects that represent the labels
     */
    getLabels() {
        var labels = [];

        // get all the objects from the canvas
        var objects = this.canvas.getObjects();

        if (objects != null) {

            // loop through all the objects
            for (var x = 0; x < objects.length; x++) {
                var object = objects[x];

                if (object != null) {

                    // get the object type
                    var type = object.get('type');

                    if (type === 'circle') {
                        /*
                         * the object is a circle which contains all the data
                         * for a label
                         */

                        // get the simple JSON object that represents the label
                        var labelJSONObject = this.getLabelJSONObjectFromCircle(object);

                        if (labelJSONObject != null) {
                            // add the object to our array of labels
                            labels.push(labelJSONObject);
                        }
                    }
                }
            }
        }

        return labels;
    };

    /**
     * Get the simple JSON object that represents the label
     * @param circle a Fabric circle object
     * @returns a simple JSON object that represents the label
     */
    getLabelJSONObjectFromCircle(circle) {
        var labelJSONObject = {};

        if (circle != null) {

            // get the line associated with the circle
            var lineObject = circle.line;

            // get the text object associated with the circle
            var textObject = circle.text;

            if (lineObject != null && textObject != null) {

                // get the position of the circle
                var pointX = circle.get('left');
                var pointY = circle.get('top');

                /*
                 * get the offset of the end of the line
                 * (this is where the text object is also located)
                 */
                var xDiff = lineObject.x2 - lineObject.x1;
                var yDiff = lineObject.y2 - lineObject.y1;

                // get the position of the text object
                var textX = xDiff;
                var textY = yDiff;

                // get the text and background color of the text
                var text = textObject.text;
                var color = textObject.backgroundColor;

                // set all the values into the object
                labelJSONObject.pointX = parseInt(pointX);
                labelJSONObject.pointY = parseInt(pointY);
                labelJSONObject.textX = parseInt(textX);
                labelJSONObject.textY = parseInt(textY);
                labelJSONObject.text = text;
                labelJSONObject.color = color;
            }
        }

        return labelJSONObject;
    };

    /**
     * Create a new component state populated with the student data
     * @return the componentState after it has been populated
     */
    createComponentState() {

        // create a new component state
        var componentState = this.NodeService.createNewComponentState();

        // set the labels into the student data
        var studentData = {};
        studentData.labels = this.getLabels();

        var backgroundImage = this.getBackgroundImage();

        if (backgroundImage != null) {
            studentData.backgroundImage = backgroundImage;
        }

        //studentData.attachments = this.attachments;

        if (this.isSubmit) {
            // the student submitted this work
            componentState.isSubmit = this.isSubmit;

            /*
             * reset the isSubmit value so that the next component state
             * doesn't maintain the same value
             */
            this.isSubmit = false;
        }

        // set the student data into the component state
        componentState.studentData = studentData;

        return componentState;
    };

    /**
     * Check if we need to lock the component
     */
    calculateDisabled() {

        // get the component content
        var componentContent = this.componentContent;

        if (componentContent != null) {

            // check if the parent has set this component to disabled
            if (componentContent.isDisabled) {
                this.isDisabled = true;
            } else if (componentContent.lockAfterSubmit) {
                // we need to lock the component after the student has submitted

                // get the component states for this component
                var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

                // check if any of the component states were submitted
                var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

                if (isSubmitted) {
                    // the student has submitted work for this component
                    this.isDisabled = true;
                }
            }
        }
    };

    /**
     * Check whether we need to show the prompt
     * @return whether to show the prompt
     */
    showPrompt() {
        return this.isPromptVisible;
    };

    /**
     * Check whether we need to show the save button
     * @return whether to show the save button
     */
    showSaveButton() {
        return this.isSaveButtonVisible;
    };

    /**
     * Check whether we need to show the submit button
     * @return whether to show the submit button
     */
    showSubmitButton() {
        return this.isSubmitButtonVisible;
    };

    /**
     * Check whether we need to show the new label button
     * @returns whether to show the new label button
     */
    showNewLabelButton() {
        return this.isNewLabelButtonVisible;
    };

    /**
     * Check whether we need to show the cancel button
     * @returns whether to show the cancel button
     */
    showCancelButton() {
        return this.isCancelButtonVisible;
    };

    /**
     * Check whether we need to lock the component after the student
     * submits an answer.
     */
    isLockAfterSubmit() {
        var result = false;

        if (this.componentContent != null) {

            // check the lockAfterSubmit field in the component content
            if (this.componentContent.lockAfterSubmit) {
                result = true;
            }
        }

        return result;
    };

    removeAttachment(attachment) {
        if (this.attachments.indexOf(attachment) != -1) {
            this.attachments.splice(this.attachments.indexOf(attachment), 1);
            this.studentDataChanged();
        }
    };

    attachNotebookItemToComponent(notebookItem) {
        if (notebookItem.studentAsset != null) {
            // we're importing a StudentAssetNotebookItem
            var studentAsset = notebookItem.studentAsset;
            this.StudentAssetService.copyAssetForReference(studentAsset).then(angular.bind(this, function(copiedAsset) {
                if (copiedAsset != null) {
                    var attachment = {
                        notebookItemId: notebookItem.id,
                        studentAssetId: copiedAsset.id,
                        iconURL: copiedAsset.iconURL
                    };

                    this.attachments.push(attachment);
                    this.studentDataChanged();
                }
            }));
        } else if (notebookItem.studentWork != null) {
            // we're importing a StudentWorkNotebookItem
            var studentWork = notebookItem.studentWork;

            var componentType = studentWork.componentType;

            if (componentType != null) {
                var childService = this.$injector.get(componentType + 'Service');

                if (childService != null) {
                    var studentWorkHTML = childService.getStudentWorkAsHTML(studentWork);

                    if (studentWorkHTML != null) {
                        this.studentResponse += studentWorkHTML;
                        this.studentDataChanged();
                    }
                }
            }
        }
    };

    /**
     * Get the prompt to show to the student
     */
    getPrompt() {
        var prompt = null;

        if (this.componentContent != null) {
            prompt = this.componentContent.prompt;
        }

        return prompt;
    };

    /**
     * Import work from another component
     */
    importWork() {

        // get the component content
        var componentContent = this.componentContent;

        if (componentContent != null) {

            var importWorkNodeId = componentContent.importWorkNodeId;
            var importWorkComponentId = componentContent.importWorkComponentId;

            if (importWorkNodeId != null && importWorkComponentId != null) {

                // get the latest component state for this component
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

                /*
                 * we will only import work into this component if the student
                 * has not done any work for this component
                 */
                if(componentState == null) {
                    // the student has not done any work for this component

                    // get the latest component state from the component we are importing from
                    var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

                    if (importWorkComponentState != null) {
                        /*
                         * populate a new component state with the work from the
                         * imported component state
                         */
                        var populatedComponentState = this.OpenResponseService.populateComponentState(importWorkComponentState);

                        // populate the component state into this component
                        this.setStudentWork(populatedComponentState);
                    }
                }
            }
        }
    };

    /**
     * Get the component id
     * @return the component id
     */
    getComponentId() {
        var componentId = this.componentContent.id;

        return componentId;
    };

    /**
     * Initialize the canvas
     * @returns the canvas object
     */
    initializeCanvas() {

        var canvas = null;

        // get the canvas object from the html
        if (this.isDisabled) {
            // we will make the canvas uneditable
            canvas = new fabric.StaticCanvas(this.canvasId);
        } else {
            // make the canvas editable
            canvas = new fabric.Canvas(this.canvasId);
        }

        // disable selection of items
        canvas.selection = false;

        // change the cursor to a hand when it is hovering over an object
        canvas.hoverCursor = 'pointer';

        // set the width and height of the canvas
        canvas.setWidth(this.canvasWidth);
        canvas.setHeight(this.canvasHeight);

        // listen for the mouse down event
        canvas.on('mouse:down', angular.bind(this, function(options) {

            // check if the student is in create label mode
            if (this.createLabelMode) {
                /*
                 * the student is in create label mode so we will create a new label
                 * where they have clicked
                 */

                var event = options.e;

                if (event != null) {
                    // get the x and y position that the student clicked on
                    var x = event.layerX;
                    var y = event.layerY;

                    /*
                     * set the location of the text object to be down to the right
                     * of the position the student clicked on
                     */
                    var textX = 100;
                    var textY = 100;

                    // create a new label
                    var newLabel = this.createLabel(x, y, textX, textY, 'A new label', 'blue');

                    // add the label to the canvas
                    this.addLabelToCanvas(this.canvas, newLabel);

                    // notify others that the student data has changed
                    this.studentDataChanged();
                }

                // turn off create label mode and hide the cancel button
                this.createLabelMode = false;
                this.isCancelButtonVisible = false;
            }
        }));

        // listen for the object moving event
        canvas.on('object:moving', angular.bind(this, function(options) {
            var target = options.target;

            if (target != null) {

                // get the type of the object that is moving
                var type = target.get('type');

                // get the position of the element
                var left = target.get('left');
                var top = target.get('top');

                // limit the x position to the canvas
                if (left < 0) {
                    target.set('left', 0);
                    left = 0;
                } else if (left > this.canvasWidth) {
                    target.set('left', this.canvasWidth);
                    left = this.canvasWidth;
                }

                // limit the y position to the canvas
                if (top < 0) {
                    target.set('top', 0);
                    top = 0;
                } else if (top > this.canvasHeight) {
                    target.set('top', this.canvasHeight);
                    top = this.canvasHeight;
                }

                if (type === 'circle') {
                    /*
                     * the student is moving the point of the label so we need to update
                     * the endpoint of the line and the position of the text element.
                     * the endpoint of the line and the position of the text element should
                     * maintain the relative position to the point.
                     */

                    // get the line associated with the circle
                    var line = target.line;

                    var xDiff = 0;
                    var yDiff = 0;

                    if (line != null) {
                        // calculate the relative offset of the end of the line
                        xDiff = line.x2 - line.x1;
                        yDiff = line.y2 - line.y1;

                        // set the new position of the two endpoints of the line
                        line.set({x1: left, y1: top, x2: left + xDiff, y2: top + yDiff});

                        // remove and add the line to refresh the element in the canvas
                        canvas.remove(line);
                        canvas.add(line);

                        // set the z index so it will be below the circle and text elements
                        canvas.moveTo(line, this.lineZIndex);
                    }

                    // get the text element
                    var text = target.text;

                    if (text != null) {
                        // set the new position of the text element
                        text.set({left: left + xDiff, top: top + yDiff});

                        // remove and add the line to refresh the element in the canvas
                        canvas.remove(text);
                        canvas.add(text);

                        // set the z index so it will be above line elements and below circle elements
                        canvas.moveTo(text, this.textZIndex);
                    }
                } else if (type === 'i-text') {
                    /*
                     * the student is moving the text of the label so we need to update
                     * the endpoint of the line. the endpoint of the line should be in
                     * the same position as the text element.
                     */

                    var line = target.line;

                    if (line != null) {
                        // set the new position of the text element
                        line.set({x2: left, y2: top});

                        // remove and add the line to refresh the element in the canvas
                        canvas.remove(line);
                        canvas.add(line);

                        // set the z index so it will be below the circle and text elements
                        canvas.moveTo(line, this.lineZIndex);
                    }
                }

                // refresh the canvas
                canvas.renderAll();

                // notify others that the student data has changed
                this.studentDataChanged();
            }
        }));

        // listen for the text changed event
        canvas.on('text:changed', angular.bind(this, function(options) {
            var target = options.target;

            if (target != null) {

                var type = target.get('type');

                if (type === 'i-text') {
                    // notify others that the student data has changed
                    this.studentDataChanged();
                }
            }
        }));

        return canvas;
    };

    /**
     * Set the background image
     * @param backgroundImagePath the url path to an image
     */
    setBackgroundImage(backgroundImagePath) {

        if (backgroundImagePath != null) {
            this.backgroundImage = backgroundImagePath;
            this.canvas.setBackgroundImage(backgroundImagePath, this.canvas.renderAll.bind(this.canvas));
        }
    };

    /**
     * Get the background image
     * @returns the background image path
     */
    getBackgroundImage() {
        return this.backgroundImage;
    };

    /**
     * Create the keydown listener that we will use for deleting labels
     */
    createKeydownListener() {
        window.addEventListener('keydown', angular.bind(this, this.keyPressed), false);
    };

    /**
     * The callback handler for the keydown event
     * @param e the event
     */
    keyPressed(e) {

        // get the key code of the key that was pressed
        var keyCode = e.keyCode;

        // 8 is backspace and 46 is delete
        if (keyCode === 8 || keyCode === 46) {

            // get the active object
            var activeObject = this.canvas.getActiveObject();

            if (activeObject != null) {

                // make sure the active object is a circle which represents the label
                if (activeObject.get('type') === 'circle') {

                    // remove the label from the canvas
                    this.removeLabelFromCanvas(this.canvas, activeObject);

                    // notify others that the student data has changed
                    this.studentDataChanged();
                }
            }
        }
    };

    /**
     * Create a label object. The label object is represented by a circle
     * element (the point), a line element, and a text element. The circle
     * element will contain a reference to the line and text elements. The
     * text element will contain a reference to the line element.
     * @param pointX the x position of the point (circle)
     * @param pointY the y position of the point (circle)
     * @param textX the x position of the text relative to the point (circle)
     * @param textY the y position of the text relative to the point (circle)
     * @param textString the text of the label
     * @param color the background color of the label
     * @returns an object containing a circle, line, and text
     */
    createLabel(pointX, pointY, textX, textY, textString, color) {
        var label = {};

        // get the position of the point
        var x1 = pointX;
        var y1 = pointY;

        // get the absolute position of the text
        var x2 = pointX + textX;
        var y2 = pointY + textY;

        if (color == null) {
            // the default background color for text elements will be blue
            color = 'blue';
        }

        // create a circle element
        var circle = new fabric.Circle({
            radius: 5,
            left: x1,
            top: y1,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: true,
            selectable: true
        });

        // create a line element
        var line = new fabric.Line([x1, y1, x2, y2], {
            fill: 'black',
            stroke: 'black',
            strokeWidth: 3,
            selectable: false
        });

        // create an editable text element
        var text = new fabric.IText(textString, {
            left: x2,
            top: y2,
            originX: 'center',
            originY: 'center',
            fontSize: 20,
            fill: 'white',
            backgroundColor: color,
            width: 100,
            hasControls: false,
            hasBorders: false,
            selectable: true
        });

        // give the circle a reference to the line and text elements
        circle.line = line;
        circle.text = text;

        // give the text element a reference to the line element
        text.line = line;

        // add the circle, line, and text elements to the label object
        label.circle = circle;
        label.line = line;
        label.text = text;

        return label;
    };

    /**
     * Add a label to canvas
     * @param canvas the canvas
     * @param label an object that contains a Fabric circle, Fabric line,
     * and Fabric itext elements
     */
    addLabelToCanvas(canvas, label) {

        if (canvas != null && label != null) {

            // get the circle, line and text elements
            var circle = label.circle;
            var line = label.line;
            var text = label.text;

            if (circle != null && line != null && text != null) {

                // add the elements to the canvas
                canvas.add(circle, line, text);

                // set the z indexes for the elements
                canvas.moveTo(line, this.lineZIndex);
                canvas.moveTo(text, this.textZIndex);
                canvas.moveTo(circle, this.circleZIndex);

                // refresh the canvas
                canvas.renderAll();
            }
        }
    };

    /**
     * Remove a label from the canvas
     * @param canvas the canvas
     * @param label the Fabric circle element that represents the label
     */
    removeLabelFromCanvas(canvas, label) {

        if (canvas != null && label != null) {

            // get the circle, line, and text elements
            var circle = label;
            var line = label.line;
            var text = label.text;

            if (circle != null && line != null && text != null) {

                // remove the elements from the canvas
                canvas.remove(circle);
                canvas.remove(line);
                canvas.remove(text);

                // refresh the canvas
                canvas.renderAll();
            }
        }
    };

    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    registerExitListener() {

        /*
         * Listen for the 'exit' event which is fired when the student exits
         * the VLE. This will perform saving before the VLE exits.
         */
        this.exitListener = this.$scope.$on('exit', angular.bind(this, function(event, args) {

        }));
    };
}

LabelController.$inject = [
    '$injector',
    '$scope',
    '$timeout',
    'LabelService',
    'NodeService',
    'OpenResponseService',
    'StudentAssetService',
    'StudentDataService'
];

export default LabelController;

