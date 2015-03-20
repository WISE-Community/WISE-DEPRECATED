

function getStudentData() {
}

function setContent(content) {
    //$("#title").html(content.title);
    //$("#prompt").html(content.prompt);
    
    var scope = angular.element($('#view')).scope();
    console.log('scope=' + scope);
    scope.setContent(content);
}

function setStudentData(studentData) {
    /*
    if (studentData != null && studentData.length > 0) {
        var latestStudentData = studentData[studentData.length - 1];
        
        if (latestStudentData !== null) {
            
        }
    }
    */
    
}

//Called sometime after postMessage is called
function receiveMessage(event) {
    console.log('hello');
}

window.addEventListener("message", receiveMessage, false);