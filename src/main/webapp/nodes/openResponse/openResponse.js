function getStudentData() {
	var response = document.getElementById("responseTextarea").value;
	return {"response":response};
}

function setContent(content) {
    
	 $("#title").html(content.title);
	 $("#prompt").html(content.prompt);
}

function setStudentData(studentData) {
    
    if (studentData != null && studentData.length > 0) {
        var latestStudentData = studentData[studentData.length - 1];
        
        if (latestStudentData !== null) {
            $("#responseTextarea").html(latestStudentData.response);
        }
    }
}

function saveButtonClicked() {
    var studentData = getStudentData();
    saveStudentData(studentData);
}

