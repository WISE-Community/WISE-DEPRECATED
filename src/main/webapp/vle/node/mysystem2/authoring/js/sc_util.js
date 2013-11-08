/*globals Ember */

var SCUtil = {};

SCUtil.uuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};



SCUtil.dataHashProperty = function(key, value) {
  if( !this.get('dataHash')) {
    this.set('dataHash', {});
  }
  if( value === undefined) {
    return this.get('dataHash')[key];
  } else {
    this.get('dataHash')[key] = value;
    this.set('rev', this.get('rev') + 1);
    return value;
  }
}.property();

SCUtil.ModelObject = Ember.Object.extend({
  dataHash: null,
  defaultDataHash: null,
  rev: 0,
  init: function() {
    this._super();

    if(!this.get('dataHash')) {
      var dataHash = {};
      if(this.get('defaultDataHash')){
        jQuery.extend(true, dataHash, this.get('defaultDataHash'));
      }
      this.set('dataHash', dataHash);
    }
  }
});

SCUtil.UUIDModel = Ember.Mixin.create({
  uuid: SCUtil.dataHashProperty,

  init: function() {
    if(Ember.none(this.get('uuid'))){
      this.set('uuid', SCUtil.uuid());
    }
  }
});

SCUtil.ModelArray = Ember.ArrayController.extend({

  contentFromHashArray: function(hashArray) {
    // var size = hashArray.length;
    // var i;
    var self = this;
    Ember.run( function() {
      var item = null;
      var modelType = self.get('modelType');
      var modelObjects = self.get('content');
      if (modelObjects !== null) {
        modelObjects.forEach(function(model){
          model.destroy();
        });
      }

      self.set('content',[]);
      var newData = [];
      if (typeof hashArray === 'undefined') {
        hashArray = [];
      }
      hashArray.forEach(function(item) {
        item = modelType.create({dataHash: item});
        newData.push(item);
      });
      self.set('content',newData);
    });
  },

  createItem: function() {
    // this.pushObject(this.get('modelType').create().get('dataHash'));
    this.pushObject(this.get('modelType').create());
  },

  removeItem: function(button){
    var item = button.get('item');
    this.removeObject(item);
    item.destroy();
  },

  init: function() {
    this._super();
    this.set('modelObjects', Ember.Set.create());
  }

});



