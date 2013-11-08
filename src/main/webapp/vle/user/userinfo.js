/*
 * TODO: COMMENT ME
 */

View.prototype.loadMyUserInfo = function(contentObject) {
	this.myUserInfo = this.parseUserInfo(contentObject);
}

View.prototype.getMyUserInfo = function() {
	return this.myUserInfo;
}

View.prototype.createUserInfo = function(workgroupId, userName, periodId, periodName) {
	return function(workgroupIdParam, userNameParam, periodIdParam, periodNameParam) {
		var workgroupId = workgroupIdParam;
		var userName = userNameParam;
		var periodId = periodIdParam;
		var periodName = periodNameParam;

		return {
			getWorkgroupId:function() {
				return workgroupId;
			},
			getUserName:function() {
				return userName;
			},
			getPeriodId:function() {
				return periodId;
			},
			getPeriodName:function() {
				return periodName;
			}
		};
	}(workgroupId, userName, periodId, periodName);
};

View.prototype.parseUserInfo = function(contentObject) {
	var contentObjectJSON = contentObject.getContentJSON();
	var userInfoJSON = contentObjectJSON.myUserInfo;
	
	var workgroupId = userInfoJSON.workgroupId;
	var userName = userInfoJSON.userName;
	var periodId = userInfoJSON.periodId;
	var periodName = userInfoJSON.periodName;
	
	return this.createUserInfo(workgroupId, userName, periodId, periodName);
};

function USER_INFO(workgroupId, userName, periodId, periodName) {
	this.workgroupId = workgroupId;
	this.userName = userName;
	this.periodId = periodId; //the period group id in the database
	this.periodName = periodName; //the period number from the teacher's perspective
}

/**
 * Takes an xml object and returns a real USER_INFO object.
 * @param userInfoXML an xml object containing workgroupId and userName
 * @return a new USER_INFO object with populated workgropuId and userName
 */
USER_INFO.prototype.parseUserInfo = function(userInfoXML) {
	var userInfo = new USER_INFO();
	userInfo.workgroupId = userInfoXML.getElementsByTagName("workgroupId")[0].firstChild.nodeValue;
	userInfo.userName = userInfoXML.getElementsByTagName("userName")[0].firstChild.nodeValue;
	
	var periodIdElements = userInfoXML.getElementsByTagName("periodId");
	
	if(periodIdElements.length > 0 && periodIdElements[0].firstChild != null) {
		//get the class period id, this is the database group id, e.g. 862
		userInfo.periodId = periodIdElements[0].firstChild.nodeValue;
	}
	
	var periodNameElements = userInfoXML.getElementsByTagName("periodName");
	
	if(periodNameElements.length > 0 && periodNameElements[0].firstChild != null) {
		/*
		 * get the class period name, this is what you think of usually when
		 * you think of a period, e.g. 1
		 */
		userInfo.periodName = periodNameElements[0].firstChild.nodeValue;
	}
	
	return userInfo;
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/user/userinfo.js');
};