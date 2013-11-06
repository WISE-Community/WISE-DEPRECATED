
var lz77 = new LZ77();

/**
 * Populate the drop down with the workgroup ids and display the work from
 * the first workgroup id
 */
function loadStudentData() {
  if(typeof data == 'undefined') {
    //we were unable to access the data in the data.js file
    document.getElementById('metaDataDiv').innerHTML += 'Error: Unable to load data<br>';
    return;
  }


  $('#metaDataDiv').append('<span class="label">Project ID:</span>');
  $('#metaDataDiv').append(data.projectId);

  $('#metaDataDiv').append('<span class="label">Name:</span>');
  $('#metaDataDiv').append(data.projectName);

  $('#metaDataDiv').append('<span class="label">Run:</span>');
  $('#metaDataDiv').append(data.runId);

  $('#metaDataDiv').append('<span class="label"> Step:</span>');
  $('#metaDataDiv').append(data.stepName);


  $('#navigationDiv').append('<span class="label">Workgroup ID:</span>');
  $('#navigationDiv').append('<select id="workgroupIdSelect" onchange="displayStudentData()">');

  $('#navigationDiv').append('<span class="label"></span>');
  $('#navigationDiv').append('<input type="button" value="⇠ Previous" onclick="displayPrevious()"/>');

  $('#navigationDiv').append('<span class="label"></span>');
  $('#navigationDiv').append('<input type="button" value="Next ⇢" onclick="displayNext()"/>');

  if(checkIfAnyStudentWorkHasIsSubmit(data)) {
    /*
     * there is student work with isSubmit=true so we will allow
     * the user to "Only Show Submits" if they want
     */
    document.getElementById('navigationDiv').innerHTML += '<input id="onlyShowSubmitsCheckbox" type="checkbox" value="onlyShowSubmits" onclick="onlyShowSubmitsClicked()"/> Only Show Submits';
  }

  //get the array of student data
  var students = data.students;

  //loop through the array of student data
  for(var x=0; x<students.length; x++) {
    //get a student data object
    var student = students[x];

    if(student != null) {
      //get the workgroup id
      var workgroupId = student.workgroupId;

      //create an option element
      var tempOption = document.createElement('option');
      tempOption.value = workgroupId;
      tempOption.text = workgroupId;

      //put the option element into the drop down
      document.getElementById('workgroupIdSelect').appendChild(tempOption);
    }
  }

  //display the first workgroup id since the first workgroup id will be the one initially selected
  displayStudentData();
}

/**
 * The "Only Show Submits" checkbox was clicked so we will display the
 * student data again so that it takes into consideration whether
 * "Only Show Submits" is checked or not
 */
function onlyShowSubmitsClicked() {
  displayStudentData();
}

/**
 * Get the student data object for the given workgroup id
 * @param workgroupId the workgroup id to retrieve
 */
function getStudentDataByWorkgroupId(workgroupId) {
  //get the array of student data
  var students = data.students;

  //loop through the array of student data
  for(var x=0; x<students.length; x++) {
    //get a student data object
    var student = students[x];

    if(student != null) {
      //get the workgroup id
      var tempWorkgroupId = student.workgroupId;

      if(workgroupId == tempWorkgroupId) {
        //we have found the workgroup id we want
        return student;
      }
    }
  }

  //we did not find the workgroup id
  return null;
}

/**
 * Display the previous workgroup id
 */
function displayPrevious() {
  //get the selected index in the drop down
  var selectedIndex = document.getElementById('workgroupIdSelect').selectedIndex;

  //get all the options in the drop down
  var options = document.getElementById('workgroupIdSelect').options;

  //get the new index we want to display
  var newSelectedIndex = selectedIndex - 1;

  if(newSelectedIndex < 0) {
    //there is no previous workgroup id
    alert('There is no previous Workgroup Id. You are on the first one.');
  } else {
    //change the drop down to the previous option
    document.getElementById('workgroupIdSelect').selectedIndex = newSelectedIndex;

    //display the student data for the workgroup id that is now selected in the drop down
    displayStudentData();
  }
}

/**
 * Display the next workgroup id
 */
function displayNext() {
  //get the selected index in the drop down
  var selectedIndex = document.getElementById('workgroupIdSelect').selectedIndex;

  //get all the options in the drop down
  var options = document.getElementById('workgroupIdSelect').options;

  //get the new index we want to display
  var newSelectedIndex = selectedIndex + 1;

  if(newSelectedIndex > options.length - 1) {
    //there is no next workgroup id
    alert('There is no next Workgroup Id. You are on the last one.');
  } else {
    //change the drop down to the next option
    document.getElementById('workgroupIdSelect').selectedIndex = newSelectedIndex;

    //display the student data for the workgroup id that is now selected in the drop down
    displayStudentData();
  }
}

/**
 * Display the student data for the workgroup id that is currently selected
 * in the drop down. This will also display all revisions if there were any.
 */
function displayStudentData() {
  //get the selected index in the drop down
  var selectedIndex = document.getElementById('workgroupIdSelect').selectedIndex;

  //get all the options in the drop down
  var options = document.getElementById('workgroupIdSelect').options;

  //get the selected workgroup id
  var workgroupId = options[selectedIndex].value;

  //get the student data object for the workgroup id
  var student = getStudentDataByWorkgroupId(workgroupId);

  //get the step work id
  var stepWorkId = student.stepWorkId;

  if(stepWorkId == null || stepWorkId == '') {
    //there is no step work id
    stepWorkId = 'No Step Work Id';
  }

  //clear out the student data div to wipe out the previous student data we were displaying
  document.getElementById('studentDataDiv').innerHTML = '';

  //counts the number of revisions
  var revisionCounter = 1;

  //will hold all the student work including revisions
  var studentDataHtml = '';
  $('#studentDataDiv').append('<h3 style="text-align:center">Student Data</h3>');
  //get the array of student data for the selected workgroup id
  var studentDataArray = student.studentDataArray;

  var onlyShowSubmits = false;

  if(document.getElementById('onlyShowSubmitsCheckbox') != null) {
    //get whether the "Only Show Submits" checkbox was checked or not
    onlyShowSubmits = document.getElementById('onlyShowSubmitsCheckbox').checked;
  }

  if(studentDataArray != null && studentDataArray != '') {
    //loop through all the student data
    for(var x=0; x<studentDataArray.length; x++) {
      //get a student data
      var studentData = studentDataArray[x];

      if(studentData != null) {
        //get the data
        var data = studentData.data;

        //get the step work id
        var stepWorkId = studentData.stepWorkId;

        //get the time the student started working on the step
        var startTime = data.visitStartTime;

        //get the time the student ended working on the step
        var endTime = data.visitEndTime;

        if(startTime != null) {
          //convert the start time from milliseconds to date
          startTime = new Date(startTime);
        }

        if(endTime != null) {
          //convert the end time from milliseconds to date
          endTime = new Date(endTime);
        }

        //get all the node states
        var nodeStates = data.nodeStates;

        if(nodeStates != null && nodeStates != '') {

          if(onlyShowSubmits) {
            //only show submits

            //loop through all the node states from oldest to newest
            for(var y=0; y<nodeStates.length; y++) {
              //get a node state
              var nodeState = nodeStates[y];

              if(nodeStateHasWork(nodeState)) {
                //this node state has work
                var nodeStateStudentDataHtml = '';


                //display information about the node state
                nodeStateStudentDataHtml += '<div class="step">';
                nodeStateStudentDataHtml += '<div class="textcontainer">';
                nodeStateStudentDataHtml += 'Revision: ' + revisionCounter + '<br/>';
                nodeStateStudentDataHtml += 'Step Work Id: ' + stepWorkId + '<br/>';
                nodeStateStudentDataHtml += 'Start Time: <span class="date"> ' + startTime + '</span><br>';
                nodeStateStudentDataHtml += 'End Time: <span class="date">' + endTime + '</span><br>';
                nodeStateStudentDataHtml += "Score: <span id='score" + stepWorkId + "'></span><br/>";
                nodeStateStudentDataHtml += "Categories: <span id='categories" + stepWorkId + "'></span><br/>";
                nodeStateStudentDataHtml += '</div>';
                nodeStateStudentDataHtml += "<div class='svgcontainer' id='stepwork" + stepWorkId + "'></div>";
                nodeStateStudentDataHtml += '</div>';

                $('#studentDataDiv').append(nodeStateStudentDataHtml);

                //increment the revision counter
                revisionCounter++;
                getStudentDataHtml(nodeState,stepWorkId);
              }
            }
          } else {
            //show latest states for all node visits

            //loop through the node states from newest to oldest to find the latest node state that has work
            for(var y=nodeStates.length - 1; y>=0; y--) {
              //get a node state
              var nodeState = nodeStates[y];

              if(nodeStateHasWork(nodeState)) {
                //this node state has work
                var nodeStateStudentDataHtml = '';

                //display information about the node state
                nodeStateStudentDataHtml += '<div class="step">';
                nodeStateStudentDataHtml += '<div class="textcontainer">';
                nodeStateStudentDataHtml += 'Revision: ' + revisionCounter + '<br/>';
                nodeStateStudentDataHtml += 'Step Work Id: ' + stepWorkId + '<br/>';
                nodeStateStudentDataHtml += 'Start Time: <span class="date"> ' + startTime + '</span><br>';
                nodeStateStudentDataHtml += 'End Time: <span class="date">' + endTime + '</span><br>';
                nodeStateStudentDataHtml += "Score: <span id='score" + stepWorkId + "'></span><br/>";
                nodeStateStudentDataHtml += "Categories: <span id='categories" + stepWorkId + "'></span><br/>";
                nodeStateStudentDataHtml += '</div>';
                nodeStateStudentDataHtml += "<div class='svgcontainer' id='stepwork" + stepWorkId + "'></div>";
                nodeStateStudentDataHtml += '</div>';


                //add this node state html to the top so that the latest node state is at the top
                $('#studentDataDiv').append(nodeStateStudentDataHtml);

                //increment the revision counter
                revisionCounter++;

                getStudentDataHtml(nodeState,stepWorkId);


                //break out of the for loop since we have found a node state that has work
                break;
              }
            }
          }
        }
      }
    }
  }

  //get the wise ids
  var wiseIds = student.wiseIds;
  if(wiseIds != null && wiseIds != '') {
    //loop through all the wise ids
    for(var x=0; x<wiseIds.length; x++) {
      //display a wise id
      var wiseId = wiseIds[x];
      document.getElementById('studentDataDiv').innerHTML += 'Wise Id ' + (x + 1) + ': ' + wiseId;
      document.getElementById('studentDataDiv').innerHTML += '<br>';
    }
  }

  if(studentDataHtml == '') {
    //this student didn't do any work
    studentDataHtml = 'No Student Work';
  }


  $('#studentDataDiv').append('<br/>');
}

/**
 * Get the student work from the node state
 * @param nodeState the node state to get student data from
 * @return the html that will display the student work
 */
function getStudentDataHtml(nodeState,stepWorkId) {
  var studentDataHtml = '';

  if(nodeState != null) {
    //get the response
    var response = nodeState.response;
    if(! hasAuthorData()) {
      var obj = JSON.parse(response);
      var score = -1;
      var categories = [];
      if (obj && obj['MySystem.RubricScore']) {
        score = obj['MySystem.RubricScore'].LAST_SCORE_ID.score;
        categories = obj['MySystem.RubricScore'].LAST_SCORE_ID.categories;
      }
      processStudentResponse(response,stepWorkId,score,categories)
    }
    else {
      if(response != null) {
        //get the response as a JSON objct
        postLoadStudentData(response,stepWorkId);
      }
    }
  }
}

function processStudentResponse(responseJson,stepWorkId,score,categories) {
  var response = JSON.parse(responseJson);
  var studentDataHtml ="";
  var svgString ='';
  var svgOpenTagPattern = /<svg [^>]+>/;
  var imagePattern = /(<image .*?>)(<\/image>)?/g;
  var dimensionPattern = /(<image x="\d+" y="\d+") (width="10" height="10)"/g
  var goodSVGTag  = '<svg style="position:relative; left:0; top:0; width:100%; height:100%;" preserveAspectRatio="xMinYMin meet" viewBox="0 40 800 600" width="300" height="150" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';

  if(response != null && response != '') {
    //get the MySystem.GraphicPreview field
    var mySystemGraphicPreview = response['MySystem.GraphicPreview'];

    if(mySystemGraphicPreview != null && mySystemGraphicPreview != '') {
      //get the LAST_GRAPHIC_PREVIEW
      var lastGraphicPreview = mySystemGraphicPreview['LAST_GRAPHIC_PREVIEW'];

      if(lastGraphicPreview != null && lastGraphicPreview != '') {
        //get the svg string
        svgString = lastGraphicPreview.svg;

        //unescape the svg string
        svgString = unescape(svgString);

        //decompress the svg string
        svgString = lz77.decompress(svgString);

        svgString = svgString.replace(svgOpenTagPattern,goodSVGTag);

        //replace all instances of imagexlink with image xlink
        svgString = svgString.replace(/imagexlink/g, 'image xlink');

        // fix incorrect image widths and heights...

        svgString = svgString.replace(dimensionPattern,"$1 width='100' height='110'");

        //find the first match
        var match = imagePattern.exec(svgString);

        //loop until we have found all the image tags
        while(match != null) {
          //get the whole match
          var wholeMatch = match[0];

          //get the image opening tag
          var match1 = match[1];

          //get the image closing tag if it exists
          var match2 = match[2];

          if(match2 == null) {
            //the image closing tag does not exist so we will insert it
            svgString = svgString.replace(wholeMatch, wholeMatch + "</image>");
          }

          //find the next match
          match = imagePattern.exec(svgString);
        }
      }
    }
  }

  if(svgString == '') {
    //this student didn't do any work
    studentDataHtml = 'No Student Work';
  } else {
    //the svg string is the student work
    studentDataHtml = svgString;
  }
  $('#stepwork'+stepWorkId).html(studentDataHtml);
  $('#score'+stepWorkId).html(score);
  $('#categories'+stepWorkId).html(categories);
}

/**
 * Check if the node state has work
 * @param nodeState the node state we want to check if has work
 */
function nodeStateHasWork(nodeState) {
  var hasWork = false;

  var onlyShowSubmits = false;

  if(document.getElementById('onlyShowSubmitsCheckbox') != null) {
    //get whether the "Only Show Submits" checkbox is checked
    onlyShowSubmits = document.getElementById('onlyShowSubmitsCheckbox').checked;
  }

  if(nodeState != null && nodeState != '') {
    //get the data
    var response = nodeState.response;

    if(onlyShowSubmits) {
      //we are only showing submits
      var isSubmit = nodeState.isSubmit;

      if(isSubmit) {
        //this node state is a submit
        hasWork = true;
      }
    } else if(response != null && response != '') {
      //the data is not null or empty so this node state has work
      hasWork = true;
    }
  }

  return hasWork;
};

/**
 * Check if any of the student work has isSubmit=true
 * @param data the data from the data.js file
 */
function checkIfAnyStudentWorkHasIsSubmit(data) {
  var hasIsSubmit = false;

  //get the array of student data
  var students = data.students;

  //loop through the array of student data
  for(var x=0; x<students.length; x++) {
    //get a student data object
    var student = students[x];

    if(student != null) {
      //get the student data array aka node visits
      var studentDataArray = student.studentDataArray;

      if(studentDataArray != null) {

        //loop through all the student data
        for(var y=0; y<studentDataArray.length; y++) {
          var studentData = studentDataArray[y];

          if(studentData != null) {
            //get the data
            var data = studentData.data;

            if(data != null) {
              //get the node states
              var nodeStates = data.nodeStates;

              if(nodeStates != null) {

                //loop through all the node states
                for(var z=0; z<nodeStates.length; z++) {
                  //get a node state
                  var nodeState = nodeStates[z];

                  if(nodeState != null) {
                    //get the isSubmit value
                    var isSubmit = nodeState.isSubmit;

                    if(isSubmit) {
                      //isSubmit is true
                      hasIsSubmit = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return hasIsSubmit;
}

function getMySystemWindow() {
  return document.getElementById('runtime-iframe').contentWindow.MySystem;
}

function postLoadStudentData(learnerData,stepWorkId) {
  var message  = {
    'command':'loadStudentData',
    'data': learnerData,
    'stepWorkId': stepWorkId
  }
  document.getElementById('runtime-iframe').contentWindow.postMessage(message, "*");
}

function postLoadAuthorData(authorData) {
  var message  = {
    'command':'loadAuthorData',
    'data': authorData
  }
  document.getElementById('runtime-iframe').contentWindow.postMessage(message, "*");
}

function loadMySysPreview() {
  var authorIframeId = 'mysystem2-authoring-iframe',
      appIframeId = 'runtime-iframe',
      authorIframeLoaded = false,
      appIframeLoaded = false;

  var createIframe = function(url, id, $elem, callback) {
    $iframe = $('<iframe id='+id+'>').attr('src', url).attr('width', '100%').attr('height', 700);
    $elem.append($iframe);
    $('iframe#'+id).load(function()
    {
      callback(this);
    });
  };

  var bothIframesLoaded= function() {
    var dataStore      = new msaPreview.CouchDS(),
        authorContent  = document.getElementById('mysystem2-authoring-iframe').contentWindow,
        runtimeContent = getContentWindow();

    var mysystem = getMySystem();

    // this is the initialization method on the ember.js app:
    authorContent.MSA.setupParentIFrame(null, this, mysystem);

    // TODO: datastore needs a better api than content window....
    dataStore.setAuthorContentWindow(authorContent);
    dataStore.setLearnerContentWindow(runtimeContent);

    var dataIds = window.location.hash;
    if (dataIds) {
      dataIds = dataIds.substring(1);    // rm hash
      var data = dataIds.split("/");
      if (!!data[0]){
        dataStore.loadAuthoredData(data[0]);
      }
      if (data.length > 1 && !!data[1]){
        dataStore.loadLearnerData(data[1]);
      }
    };
  }; // bothIframesLoaded

  createIframe('mysystem2/mysystem2.html', 'runtime-iframe', $('#runtime_td'), function(iframe){
    loadStudentData();
  });

};

function receiveMessage(message) {
  if(message.data) {
    if (message.data.command === 'loadStudentData') {
      debugger;
      processStudentResponse(message.data.response, message.data.stepWorkId, message.data.score, message.data.categories);
    }
  }
}

function getAuthorData() {
  return $('#authorjson').val();
}

function hasAuthorData() {
  // TODO: Anything but this...
  if(getAuthorData().length > 3) {
    return true;
  }
  return false;
}

$(document).ready(function() {
  $('#save').bind('click', function (e) {
    e.preventDefault();
    var data = getAuthorData();
    postLoadAuthorData(data);
    displayStudentData();
  });
  loadMySysPreview();
  window.addEventListener("message", receiveMessage, false);
});



