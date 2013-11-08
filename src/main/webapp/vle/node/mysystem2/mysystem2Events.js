/*globals View componentloader eventManager */

/*
 * This handles events and calls the appropriate function to handle
 * the event.
 */

View.prototype.mysystem2Dispatcher = function(type,args,obj){
  if ('undefined' === typeof obj.Mysystem2Node) {
    return;
  }
  if(type === 'mysystem2PromptChanged'){
    //  obj.Mysystem2Node.AddNewModule();
  }
  if(type === 'mysystem2FieldUpdated'){
    obj.Mysystem2Node.fieldUpdated(args[0], args[1]);
  }
  if(type === 'mysystem2RemoveMod'){
    obj.Mysystem2Node.removeMod(args[0]);
  }
  if(type === 'mysystem2AddNewModule'){
    obj.Mysystem2Node.AddNewModule();
  }
  if(type === 'mysystem2AddNewEnergyType'){
    obj.Mysystem2Node.AddNewEnergyType();
  }
  if(type === 'mysystem2EnergyFieldUpdated'){
    obj.Mysystem2Node.fieldEnergyUpdated(args[0], args[1]);
  }
  if(type === 'mysystem2RemoveEtype'){
    obj.Mysystem2Node.removeEtype(args[0]);
  }
  if(type === 'mysystem2AuthoringIFrameLoaded'){
    obj.Mysystem2Node.AuthoringIFrameLoaded();
  }
  if(type === 'mySystemPreviewFrameLoaded') {
    obj.Mysystem2Node.previewFrameLoaded();
  }
};

/*
 * this is a list of events that can be fired. when the event is fired,
 * the dispatcher function above will be called and then call the
 * appropriate function to handle the event.
 */
var events = [
  /*
   * TODO: rename templateUpdatePrompt
   * wait until you implement the authoring before you rename this
   */
  'mysystem2FieldUpdated', //",["name","' + a + '"])'});
  'mysystem2EnergyFieldUpdated',
  'mysystem2RemoveMod',     //"' + a + '")'});
  'mysystem2RemoveEtype',
  'mysystem2AddNewModule',
  'mysystem2AddNewEnergyType',
  'mysystem2AuthoringIFrameLoaded',
  'templateUpdatePrompt',
  'previewFrameLoaded',
  'processPostResponseComplete',
  'mySystemPreviewFrameLoaded'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for (var x=0; x<events.length; x++) {
  componentloader.addEvent(events[x], 'mysystem2Dispatcher');
}

// used to notify scriptloader that this script has finished loading
if (typeof eventManager != 'undefined') {
  eventManager.fire('scriptLoaded', 'vle/node/mysystem2/mysystem2Events.js');
}



