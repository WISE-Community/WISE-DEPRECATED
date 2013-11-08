/*globals $ ZeroClipboard */

var msaPreview = {};

msaPreview.CouchDS = function(authoredDocId) {
  $.couch.urlPrefix = "/mysystem_designs";
  this.db = $.couch.db('');
};

msaPreview.CouchDS.prototype =
{
  db: null,
  authoredDocId: null,
  authoredDocRev: null,
  learnerDocId: null,
  learnerDocRev: null,
  authorContentWindow: null,
  learnerContentWindow: null,
  
  
  setAuthorContentWindow: function (contentWindow) {
    this.authorContentWindow = contentWindow;
  },
  
  
  setLearnerContentWindow: function (contentWindow) {
    this.learnerContentWindow = contentWindow;
  },

  loadData: function (data_id, callback) {
    var self = this;
    this.db.openDoc(
      data_id, 
      {
        success: function (response) {
          callback(response);
        },
        error: function (response) {
          // let us fail silently:
          // alert("Could not find a document with the id '"+self.authoredDocId+"'");
          // window.location.hash = '';
        }
      }
    );
  },

  saveData: function(data, docId, revId, callback) {
    if (!!docId){
      data._id = docId;
    }
    if (!!revId){
      data._rev = revId;
    }
    
    var self = this;
    this.db.saveDoc(  
      data,  
      { 
        success: function(response) { 
          // try to intuit which ID is being sent:
          if (self.authoredDocId) {
            if (response.id != self.authoredDocId) {
              self.learnerDocId = response.id;
            }
          }
          else {
            self.authoredDocId = response.id;
          }

          window.location.hash = (self.authoredDocId + (self.learnerDocId ?  ( "/" + self.learnerDocId) : ""));
          var url = window.location.href;
          window.location.href = url;
          var gritId = $.gritter.add({
            title: 'Data saved.',
            text: url,
            sticky: true,
            after_open: function(e) {
              self.makeCopyLink(e,url);
            }

          });
         
          callback(response);
        }
      }  
    );
  },

  makeCopyLink: function(element,url) {
    var textElement = element.find('p');
    var length = url.length > 6 ? url.length - 6 : url.length;
    var short_id = url.substr(length);
    var a = $('<a id="clip_link" href="'+ url + '"> Copy your link to to the clipboard. ('+ short_id + ')</a>');
    a.css('color','white');
    textElement.html(a);
    if (typeof ZeroClipboard !=='undefined') {
      var clip = new ZeroClipboard.Client();
      clip.glue(a[0],element[0]);
      clip.setText(url);
      clip.setHandCursor( true );
      clip.setCSSEffects( true );                  
      
      clip.addEventListener( 'onComplete',function() {
        // alert('A link to this diagram is now in your clipboard.');
        element.find('.gritter-title').html('A link to this diagram is now in your clipboard.');
        var gritterId = element.closest('.gritter-item-wrapper').attr('id');
        gritterId = gritterId.replace(/gritter-item-/g,'');

        $.gritter.remove(gritterId, { 
          fade: true,
          speed: 3000
        });
      });
    }
  },

  loadAuthoredData: function (authoredDocId) {
    this.authoredDocId = authoredDocId;
    var self = this;
    this.loadData(
      authoredDocId, 
      function(response){
        if (response.authored_data){
          self.authoredDocRev = response._rev;
          self.authorContentWindow.MSA.dataController.loadData(response.authored_data);
        }
      }
    );
  },
  
  loadLearnerData: function (learnerDocId) {
    this.learnerDocId = learnerDocId;
    var self = this;
    this.loadData(
      learnerDocId, 
      function(response){
        if (response.learner_data){
          self.learnerDocRev = response._rev;
          
          self.learnerContentWindow.$('#my_system_state').html(JSON.stringify(response.learner_data));
          self.learnerContentWindow.MySystem.updateFromDOM();
        }
      }
    );
  },
  
  saveAuthoring: function () {
    var authoredData = this.authorContentWindow.MSA.dataController.get('dataJson'),
        authoredDataHash = JSON.parse(JSON.stringify(authoredData, null, 2));
        
    var data = {"authored_data": authoredDataHash};

    var self = this;
    this.saveData(
      data, 
      this.authoredDocId,
      this.authoredDocRev,
      function(response){
        self.authoredDocId = response.id;
        self.authoredDocRev = response.rev;
      }
    );

  },
  
  saveLearner: function () {
    var learnerData = this.learnerContentWindow.$('#my_system_state').html(),
        learnerDataHash = JSON.parse(learnerData);

    var data = {"learner_data": learnerDataHash};
    
    var self = this;
    this.saveData(
      data, 
      this.learnerDocId,
      this.learnerDocRev,
      function(response){
        self.learnerDocId = response.id;
        self.learnerDocRev = response.rev;
        self.learnerContentWindow.MySystem.externalSaveSuccessful(true);
      }
    );
  }
  
};
