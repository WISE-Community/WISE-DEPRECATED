



/**
 * Takes in an xml object and sets the myUserInfo and myClassInfo
 * @param userAndClassInfoXMLObject an xml object containing user and
 * 		class info
 */
View.prototype.loadUserAndClassInfo_old = function(userAndClassInfoXMLObject) {
	//this.eventManager.fire('loadUserAndClassInfo');

	//retrieve the xml node object for myUserInfo
	var myUserInfoXML = userAndClassInfoXMLObject.getElementsByTagName("myUserInfo")[0];
	
	if(myUserInfoXML != null ) {
		//create and set my user info in this vle instance
		this.myUserInfo = USER_INFO.prototype.parseUserInfo(myUserInfoXML);
	}
	
	//retrieve the xml node object for myClassInfo
	var myClassInfoXML = userAndClassInfoXMLObject.getElementsByTagName("myClassInfo")[0];
	
	if(myClassInfoXML != null) {
		var myClassInfo = new CLASS_INFO();

		//create and set the teacher
		var teacherInfoXML = myClassInfoXML.getElementsByTagName("teacherUserInfo")[0];
		if (teacherInfoXML && teacherInfoXML != null) {
			myClassInfo.teacher = USER_INFO.prototype.parseUserInfo(teacherInfoXML);
		}
		
		//create and set all the classmates
		var classmateUserInfoXMLList = myClassInfoXML.getElementsByTagName("classmateUserInfo");
		for(var x=0; x<classmateUserInfoXMLList.length; x++) {
			var classmateUserInfoXML = classmateUserInfoXMLList[x];
			var classmateUserInfo = USER_INFO.prototype.parseUserInfo(classmateUserInfoXML);
			myClassInfo.addClassmate(classmateUserInfo);
		}
		
		//set the class info in this vle instance
		this.myClassInfo = myClassInfo;
	}
	
	//load the student data...This should be called outside of this function
	//this.loadVLEState(this.myUserInfo.workgroupId, this);
	
	//this.eventManager.fire('loadUserAndClassInfoComplete');
}

 
View.prototype.getWorkgroupId = function() {
	if(this.myUserInfo != null) {
		return this.myUserInfo.workgroupId;
	} else {
		return "";
	}
};

View.prototype.setUserName = function(userName) {
	if(this.myUserInfo != null) {
		this.myUserInfo.userName = userName;
	}
};

View.prototype.setWorkgroupId = function(workgroupId) {
	if(this.myUserInfo != null) {
		this.myUserInfo.workgroupId = workgroupId;
	}
};

View.prototype.getUserName = function() {
	if(this.myUserInfo != null) {
		return this.myUserInfo.userName;
	} else {
		return "";
	}
};


/*
 * Returns all of the students in the student's class including the student.
 */
View.prototype.getUsersInClass = function() {
	var allStudentsArray = new Array();
	for (var i=0; i<this.myClassInfo.classmates.length; i++) {
		allStudentsArray.push(this.myClassInfo.classmates[i]);
	}
	allStudentsArray.push(this.myUserInfo);
	return allStudentsArray;
}

/**
 * Returns the userName associated with the userId
 * @param userId the id of the user we want the userName for
 * @return the userName with the given userId or null if
 * 		no one has the userId
 */
View.prototype.getUserNameByUserId = function(userId) {
	//check the current logged in user
	if(userId == this.getWorkgroupId()) {
		return this.getUserName();
	}
	
	//check the class mates
	for(var x=0; x<this.myClassInfo.classmates.length; x++) {
		if(userId == this.myClassInfo.classmates[x].workgroupId) {
			return this.myClassInfo.classmates[x].userName;
		}
	}
	
	//return null if no one was found with the userId
	return null;
}


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/user/userfunctions.js');
};