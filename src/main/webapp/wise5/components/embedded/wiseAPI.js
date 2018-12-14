class WISEAPI {

  constructor() {
    window.addEventListener('message', this.createReceiveMessageFromParentFunction(this));
  }

  /**
   * Request the parameters from the WISE Embedded component.
   */
  sendGetParametersMessage() {
    this.sendMessageToParent(this.createMessage('getParameters'));
  }

  /**
   * Notify the WISE Embedded component that this application has finished initializing.
   */
  sendApplicationInitializedMessage() {
    this.sendMessageToParent(this.createMessage('applicationInitialized'));
  }

  /**
   * Request the latest annotations from the WISE Embedded component.
   */
  sendGetLatestAnnotationsMessage() {
    this.sendMessageToParent(this.createMessage('getLatestAnnotations'));
  }

  /**
   * We previously sent a 'getParameters' message to the WISE Embedded component and now it's
   * sending us the component parameters in response.
   */
  handleParametersMessage(messageData) {
    const parameters = messageData.parameters;
  }

  /**
   * We previously sent a 'applicationInitialized' message to the WISE Embedded component and now
   * it's sending us the latest component state for this component in response.
   */
  handleComponentStateMessage(messageData) {
    const componentState = messageData.componentState;
  }

  /**
   * The WISE Embedded component is notifying us that a component state has been saved for this
   * component.
   */
  handleComponentStateSavedMessage(messageData) {
    const componentState = messageData.componentState;
  }

  /**
   * We previously sent a 'getStudentWork' message to the WISE Embedded component and now it's
   * sending us the student work in response.
   */
  handleStudentWorkMessage(messageData) {
    const latestStudentWorkFromThisComponent = messageData.latestStudentWorkFromThisComponent;
    const allStudentWorkFromThisComponent = messageData.allStudentWorkFromThisComponent;

    const latestStudentWorkFromThisNode = messageData.latestStudentWorkFromThisNode;
    const allStudentWorkFromThisNode = messageData.allStudentWorkFromThisNode;

    const latestStudentWorkFromOtherComponents = messageData.latestStudentWorkFromOtherComponents;
    const allStudentWorkFromOtherComponents = messageData.allStudentWorkFromOtherComponents;
  }

  /**
   * One of the WISE components in the same step has had their student data changed. This is used
   * in scenarios where this model needs to react to changes in other sibling WISE components.
   */
  handleSiblingComponentStudentDataChangedMessage(messageData) {
    const componentState = messageData.componentState;
  }

  /**
   * One of the connected WISE components has had their student data changed. This is used in
   * scenarios where this model needs to react to changes in connected components.
   */
  handleConnectedComponentStudentDataChangedMessage(messageData) {
    const componentState = messageData.componentState;
  }

  /**
   * We previously sent a 'getLatestAnnotations' message to the WISE Embedded component and now
   * it has sent us the latest annotations in response.
   */
  handleLatestAnnotationsMessage(messageData) {
    const latestScoreAnnotation = messageData.latestScoreAnnotation;
    const latestCommentAnnotation = messageData.latestCommentAnnotation;
  }

  createMessage(messageType) {
    return { messageType: messageType };
  }

  /**
   * In WISE we save student data in a unit of data called a component state. A component state is
   * just a plain object that is expected to have certain fields.
   * @param studentData an object
   * @param messageType
   * 'studentWork' if you want the component state to be saved immediately
   * 'studentDataChanged' if you don't want the component state to be saved immediately but
   * want it to be saved when an auto save is triggered or when the student clicks save.
   * You may want to use 'studentDataChanged' if your model generates a lot of component
   * states within a short period of time and you don't need to save every revision.
   * @param isAutoSave
   * @param isSubmit
   */
  createComponentState(studentData, messageType = 'studentDataChanged',
      isAutoSave = false, isSubmit = false) {
    return {
      messageType: messageType,
      isAutoSave: isAutoSave,
      isSubmit: isSubmit,
      timestamp: new Date().getTime(),
      studentData: studentData
    };
  }

  /**
   * In WISE a comment or a score connected to a component state is referred to as an annotation.
   * @param type the type of annotation which can be 'autoScore' or 'autoComment'.
   * @param value a number if the annotation is an autoScore or a string if the
   * annotation is an autoComment.
   */
  createAnnotation(type, value) {
    return {
      type: type,
      data: {
        value: value
      }
    }
  }

  /**
   * @param componentState an object
   * @param annotation an object
   */
  addAnnotationToComponentState(componentState, annotation) {
    if (componentState.annotations == null) {
      componentState.annotations = [];
    }
    componentState.annotations.push(annotation);
  }

  /**
   * @param message An object that contains a messageType field. Additional fields can be added to
   * the message object when applicable. The messageType value can be one of these values:
   * 'event'
   * 'studentWork'
   * 'applicationInitialized'
   * 'componentDirty'
   * 'componentSubmitDirty'
   * 'studentDataChanged'
   * 'getStudentWork'
   * 'getLatestStudentWork'
   * 'getParameters'
   * 'getProjectPath'
   * 'getLatestAnnotations'
   */
  sendMessageToParent(message) {
    window.postMessage(message, "*");
  }

  /**
   * When a message is sent from the WISE Embedded component, the closure function will be called.
   * @param thisWISEAPI This WISEAPI object. We need to pass this in because when the closure
   * function is actually called, the context will have 'this' be the window and not this object.
   * Therefore we will access this object from the thisWISEAPI variable.
   * @return A function that will handle messages.
   */
  createReceiveMessageFromParentFunction(thisWISEAPI) {
    /**
     * @param message An object. The contents of the object depend on the message type. Look at the
     * handle functions above to see what data you can obtain from each message type.
     */
    return (message) => {
      let messageData = message.data;
      if (messageData.messageType === 'parameters') {
        thisWISEAPI.handleParametersMessage(messageData);
        thisWISEAPI.sendApplicationInitializedMessage();
      } else if (messageData.messageType === 'studentWork') {
        thisWISEAPI.handleStudentWorkMessage(messageData);
      } else if (messageData.messageType === 'siblingComponentStudentDataChanged') {
        thisWISEAPI.handleSiblingComponentStudentDataChangedMessage(messageData);
      } else if (messageData.messageType === 'handleConnectedComponentStudentDataChanged') {
        thisWISEAPI.handleConnectedComponentStudentDataChangedMessage(messageData);
      } else if (messageData.messageType === 'componentState') {
        thisWISEAPI.handleComponentStateMessage(messageData);
      } else if (messageData.messageType === 'componentStateSaved') {
        thisWISEAPI.handleComponentStateSavedMessage(messageData);
      } else if (messageData.messageType === 'latestAnnotations') {
        thisWISEAPI.handleLatestAnnotationsMessage(messageData);
      }
    }
  }

}

