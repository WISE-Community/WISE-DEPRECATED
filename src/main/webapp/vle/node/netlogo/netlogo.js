/**
 * @constructor
 * @param node
 * @returns
 */
function Netlogo(node) {
  this.node = node;
  this.view = node.view;
  this.content = node.getContent().getContentJSON();
  this.node.contentPanel['save'] = this.save.bind(this);
  this.applet = '';
  this.nlObjPanel = null;
}

Netlogo.prototype = {

  render: function() {
    //display any into content to the student
    $('#promptDiv').html(this.content.prompt);

    // load the Netlogo jar and activity
    var archive = 'NetLogoLite-5.0.x-d27c65c.jar';
    if(this.content.version == '4'){
      archive = 'NetLogoLite.jar';
    }

    //handle the case that there is no uri selected yet.
    var appletStr = '';

    if(this.content.activity_uri !== '') {
      var codebase = '.';
      var model    = '<param name="DefaultModel" value="' + this.content.activity_uri + '">';
      var extLoc   = '<param name="nlogo.extensions.url" value="' + codebase + '/extensions' + '">';
      var permissions   = '<param name="permissions" value="sandbox"/>';
      appletStr    = '<applet id="netlogo-applet" code="org.nlogo.lite.Applet" codebase="' + codebase +
        '" archive="' + archive + '" width="' + this.content.width + '" height="' + this.content.height + '">' +
        model + extLoc + permissions + '</applet>';
    }

    $('#netlogo_wrapper').html(appletStr);

    this.initializeNLPanel.bind(this)();

  },

  save: function() {

    var modelDataObject = {};

    try {
      modelDataObject = JSON.parse(this.nlCmdReport("data-export:make-model-data"));
    } catch(e) {
      console.log(e);
    }

    // Someone needs to do something with this
    //var imageStr = this.nlCmdReport("web-image:base64-encode web-image:get-view-bytes");

    nlState = new NetlogoState(modelDataObject);

    /*
    * fire the event to push this state to the global view.states object.
    * the student work is saved to the server once they move on to the
    * next step.
    */
    this.view.pushStudentWork(this.node.id, nlState);
  },

  initializeNLPanel: function() {
    try {
      var panel = document.getElementById("netlogo-applet").panel(); // org.nlogo.lite.Applet object
      if (panel === undefined || panel === null) {
        throw "Failed to get panel";
      } else {
        this.nlObjPanel = panel;
      }
    } catch (e) {
      window.setTimeout(this.initializeNLPanel.bind(this), 250);
    }
  },

  nlCmdReport: function(cmd) {
    return this.nlObjPanel.report(cmd);
  }

};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
  eventManager.fire('scriptLoaded', 'vle/node/netlogo/netlogo.js');
}
