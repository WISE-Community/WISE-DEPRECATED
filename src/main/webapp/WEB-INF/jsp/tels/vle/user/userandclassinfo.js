
View.prototype.loadUserAndClassInfo = function(userAndClassInfoContentObject) {
	this.eventManager.fire('getUserAndClassInfoStarted');
	this.userAndClassInfo = this.parseUserAndClassInfo(userAndClassInfoContentObject);
	
	this.userAndClassInfoLoaded = true;
	this.eventManager.fire('getUserAndClassInfoCompleted');
};

View.prototype.getUserAndClassInfo = function() {
	return this.userAndClassInfo;
};

View.prototype.createUserAndClassInfo = function(myUserInfo, periods, classmateUserInfos, teacherUserInfo, sharedTeacherUserInfos) {
	return function(myUserInfoParam, periodsParam, classmateUserInfosParam, teacherUserInfoParam, sharedTeacherUserInfosParam) {
		var myUserInfo = myUserInfoParam;
		var periods = periodsParam;
		var classmateUserInfos = classmateUserInfosParam;
		var teacherUserInfo = teacherUserInfoParam;
		
		var getWorkgroupId = function() {
			if (myUserInfo != null) {
				return myUserInfo.workgroupId;
			}
		};
		
		var getUserName = function() {
			if (myUserInfo != null) {
				return myUserInfo.userName;
			}
		};
		
		/**
		 * Get the user login by extracting it from the userName
		 * field.
		 */
		var getUserLoginName = function() {
			var userLoginName = "";
			
			//use a regular expression to capture the text between the parens
			var captureLoginRegEx = /.*\((.*)\)/;
			
			//userName will be like "Geoffrey Kwan (GeoffreyKwan)"
			var regExMatch = captureLoginRegEx.exec(myUserInfo.userName);
			
			//check if there was a match
			if(regExMatch != null && regExMatch.length > 1) {
				/*
				 * 0th element is the whole string - "Geoffrey Kwan (GeoffreyKwan)"
				 * 1st element is the capture - "GeoffreyKwan"
				 */
				userLoginName = regExMatch[1];
			}
			
			//return the user login name
			return userLoginName;
		};
		
		var getPeriodId = function() {
			return myUserInfo.periodId;
		};
		
		var getPeriodName = function() {
			return myUserInfo.periodName;
		};
		
		/**
		 * Get an array of period objects. Each period object contains
		 * the period id and period name.
		 */
		var getPeriods = function() {
			return periods;
		};
		
		var getClassmateUserInfos = function() {
			return classmateUserInfos;
		};
		
		var getTeacherUserInfo = function() {
			return teacherUserInfo;
		};
		
		var getSharedTeacherUserInfos = function() {
			return sharedTeacherUserInfos;
		};
		
		var getUsersInClass = function() {
			var allStudentsArray = new Array();
			for (var i=0; i<classmateUserInfos.length; i++) {
				allStudentsArray.push(classmateUserInfos[i]);
			}
			allStudentsArray.push(myUserInfo);
			return allStudentsArray;
		};
		
		/**
		 * Get all the classmate workgroup ids. This will not include the
		 * workgroup id of the signed in user.
		 */
		var getClassmateWorkgroupIds = function() {
			var classmateWorkgroupIds = [];
			
			//loop through all the classmates
			for (var x=0; x<classmateUserInfos.length; x++) {
				//get a classmate
				var classmateUserInfo = classmateUserInfos[x];
				
				if(classmateUserInfo != null) {
					//get the workgroup id for the classmate
					var workgroupId = classmateUserInfo.workgroupId;
					
					//add the workgroup id to our array that we will return
					classmateWorkgroupIds.push(workgroupId);
				}
			}
			return classmateWorkgroupIds;
		};
		
		var getWorkgroupIdsInClass = function() {
			var usersInClass = getUsersInClass();
			var workgroupIdsInClass = [];
			
			for(var x=0; x<usersInClass.length; x++) {
				var user = usersInClass[x];
				
				workgroupIdsInClass.push(user.workgroupId);
			}
			
			return workgroupIdsInClass;
		};
		
		var getUserNameByUserId = function(userId) {
			//check the current logged in user
			if(userId == getWorkgroupId()) {
				return getUserName();
			}
			
			//check the class mates
			for(var x=0; x<classmateUserInfos.length; x++) {
				if(userId == classmateUserInfos[x].workgroupId) {
					return classmateUserInfos[x].userName;
				}
			}
			
			//return null if no one was found with the userId
			return null;
		};
		
		var getClassmateByWorkgroupId = function(workgroupId) {
			for (var i=0; i< classmateUserInfos.length; i++) {
				if (classmateUserInfos[i].workgroupId == workgroupId) {
					return classmateUserInfos[i];
				}
			}
			return null;
		};
		
		var getClassmateIdsByPeriodId = function(periodId) {
			var classmateIds = "";
			
			//loop through all the classmates
			for (var i=0; i< classmateUserInfos.length; i++) {
				//make sure the classmate is in the same period
				if(classmateUserInfos[i].periodId == periodId) {
					//add a : if necessary
					if(classmateIds != "") {
						classmateIds += ":";
					}
					
					//add the workgroup id
					classmateIds += classmateUserInfos[i].workgroupId;
				}
			}
			return classmateIds;
		};
		
		var getClassmatePeriodNameByWorkgroupId = function(workgroupId) {
			//loop through all the classmates
			for(var x=0; x<classmateUserInfos.length; x++) {
				//get a classmate
				var classmate = classmateUserInfos[x];
				
				//check if this is the classmate we're looking for
				if(classmate.workgroupId == workgroupId) {
					//return the period name/number
					return classmate.periodName;
				}
			}
			
			//return null if we did not find the workgroup id in our classmates
			return null;
		};
		
		/**
		 * Get the period id for a workgroup id
		 * @param the workgroup id
		 * @return the period id or null if we did not find the workgroup id
		 */
		var getClassmatePeriodIdByWorkgroupId = function(workgroupId) {
			//loop through all the classmates
			for(var x=0; x<classmateUserInfos.length; x++) {
				//get a classmate
				var classmate = classmateUserInfos[x];
				
				//check if this is the classmate we're looking for
				if(classmate.workgroupId == workgroupId) {
					//return the period name id
					return classmate.periodId;
				}
			}
			
			//return null if we did not find the workgroup id in our classmates
			return null;
		};
		
		var getTeacherWorkgroupId = function() {
			var workgroupId = null;
			
			if(teacherUserInfo != null) {
				workgroupId = teacherUserInfo.workgroupId;
			}
			
			return workgroupId;
		};
		
		/**
		 * Get the shared teacher workgroup ids in an array
		 * @return an array containing the teacher workgroup ids
		 */
		var getSharedTeacherWorkgroupIds = function() {
			var sharedTeacherWorkgroupIdsArray = [];
			
			//loop through all the shared teachers
			for(var x=0; x<sharedTeacherUserInfos.length; x++) {
				var sharedTeacherUserInfo = sharedTeacherUserInfos[x];
				
				sharedTeacherWorkgroupIdsArray.push(sharedTeacherUserInfo.workgroupId);
			}
			
			return sharedTeacherWorkgroupIdsArray;
		};
		
		/**
		 * Get the teacher workgroup id and all shared teacher workgroup
		 * ids in an array
		 * @return the teacher and shared teacher workgroup ids in an array
		 */
		var getAllTeacherWorkgroupIds = function() {
			//get the teacher workgroup id
			var teacherWorkgroupId = getTeacherWorkgroupId();
			
			//get the shared teacher workgroup ids
			var sharedTeacherWorkgroupIds = getSharedTeacherWorkgroupIds();
			
			//add the teacher workgroup to the array of shared teacher workgroup ids
			sharedTeacherWorkgroupIds.unshift(teacherWorkgroupId);
			
			return sharedTeacherWorkgroupIds;
		};
		
		/**
		 * Get all the classmates in the period id
		 * @param the period id. if the period id is null or 'all'
		 * we will get classmates from all the periods
		 * @return the classmates in the period
		 */
		var getClassmatesInPeriodId = function(periodId) {
			var classmates = [];
			
			//loop through all the classmates
			for (var x=0; x< classmateUserInfos.length; x++) {
				var classmateUserInfo = classmateUserInfos[x];
				
				if(classmateUserInfo != null) {
					var tempPeriodId = classmateUserInfo.periodId;
					
					//check if the classmate is in the period
					if(periodId == null || periodId == 'all' || periodId == tempPeriodId) {
						classmates.push(classmateUserInfo);
					}
				}
			}
			
			return classmates;
		}
		
		/**
		 * Get all the workgroup ids in a period
		 * 
		 * @param periodId the period id or null if we want the workgroup
		 * ids from all periods
		 * 
		 * @return the workgroup ids from the period
		 */
		var getClassmateWorkgroupIdsInPeriodId = function(periodId) {
			var workgroupIds = [];
			
			//loop through all the classmates
			for (var x=0; x< classmateUserInfos.length; x++) {
				var classmateUserInfo = classmateUserInfos[x];
				
				if(classmateUserInfo != null) {
					var tempPeriodId = classmateUserInfo.periodId;
					
					//check if the classmate is in the period
					if(periodId == null || periodId == 'all' || periodId == tempPeriodId) {
						//get the workgroup id
						var workgroupId = classmateUserInfo.workgroupId;
						
						//add the workgroup id to our array
						workgroupIds.push(workgroupId);
					}
				}
			}
			
			return workgroupIds;
		}
		
		var getClassmatesInAlphabeticalOrder = function() {
			
			var sortByUserName = function(a, b) {
				//get the user names from the vleStates
				var userNameA = a.userName.toLowerCase();
				var userNameB = b.userName.toLowerCase();
				
				//compare them
				return userNameA > userNameB;
			};
			
			return classmateUserInfos.sort(sortByUserName);
		};
		
		/**
		 * Get the user ids for this user
		 * @return an array containing the user ids in the workgroup
		 */
		var getUserIds = function() {
			var userIds = null;
			
			if(myUserInfo != null) {
				userIds = myUserInfo.userIds;	
			}
			
			return userIds;
		};
		
		/**
		 * Get all the students in a period
		 * @param periodId the period id
		 */
		var getAllStudentsInPeriodId = function(periodId) {
			//get all the classmates. this does not include the currently logged in student
			var allStudentsInPeriod = getClassmatesInPeriodId(periodId);
			
			//get the period id of the currently logged in student
			var myPeriodId = getPeriodId();
			
			if(periodId == myPeriodId) {
				//add the currently logged in student if they are in the period
				allStudentsInPeriod.push(myUserInfo);
			}
			
			return allStudentsInPeriod;
		};
		
		return {
			getWorkgroupId:function() {
				return getWorkgroupId();
			},
			getUserName:function() {
				return getUserName();
			},
			getPeriodId:function() {
				return getPeriodId();
			},
			getPeriodName:function() {
				return getPeriodName();
			},
			getUsersInClass:function() {
				return getUsersInClass();
			},
			getUserNameByUserId:function(userId) {
				return getUserNameByUserId(userId);
			},
			getClassmateByWorkgroupId:function(workgroupId) {
				return getClassmateByWorkgroupId(workgroupId);
			},
			getClassmateIdsByPeriodId:function(periodId) {
				return getClassmateIdsByPeriodId(periodId);
			},
			getClassmatePeriodNameByWorkgroupId:function(workgroupId) {
				return getClassmatePeriodNameByWorkgroupId(workgroupId);
			},
			getClassmatePeriodIdByWorkgroupId:function(workgroupId) {
				return getClassmatePeriodIdByWorkgroupId(workgroupId);
			},
			getTeacherWorkgroupId:function() {
				return getTeacherWorkgroupId();
			},
			getClassmatesInAlphabeticalOrder:function() {
				return getClassmatesInAlphabeticalOrder();
			},
			getWorkgroupIdsInClass:function() {
				return getWorkgroupIdsInClass();
			},
			getClassmateUserInfos:function() {
				return getClassmateUserInfos();
			},
			getTeacherUserInfo:function() {
				return getTeacherUserInfo();
			},
			getSharedTeacherUserInfos:function() {
				return getSharedTeacherUserInfos();
			},
			getSharedTeacherWorkgroupIds:function() {
				return getSharedTeacherWorkgroupIds();
			},
			getAllTeacherWorkgroupIds:function() {
				return getAllTeacherWorkgroupIds();
			},
			getUserLoginName:function() {
				return getUserLoginName();
			},
			getClassmateWorkgroupIds:function() {
				return getClassmateWorkgroupIds();
			},
			getPeriods:function() {
				return getPeriods();
			},
			getClassmatesInPeriodId:function(periodId) {
				return getClassmatesInPeriodId(periodId);
			},
			getUserIds:function() {
				return getUserIds();
			},
			getAllStudentsInPeriodId:function(periodId) {
				return getAllStudentsInPeriodId(periodId);
			},
			getClassmateWorkgroupIdsInPeriodId:function(periodId) {
				return getClassmateWorkgroupIdsInPeriodId(periodId);
			}
		};
	}(myUserInfo, periods, classmateUserInfos, teacherUserInfo, sharedTeacherUserInfos);
};

View.prototype.parseUserAndClassInfo = function(contentObject) {
	var contentObjectJSON = contentObject.getContentJSON();
	var classInfoJSON;
	var myUserInfo;
	var periods;
	var classmateUserInfos;
	var teacherUserInfo;
	var sharedTeacherUserInfos;
	
	if(contentObjectJSON.myUserInfo != null) {
		classInfoJSON = contentObjectJSON.myUserInfo.myClassInfo;	
		myUserInfo = contentObjectJSON.myUserInfo;
		
		if(classInfoJSON != null) {
			if(classInfoJSON.periods != null) {
				periods = classInfoJSON.periods;
			}
			
			if(classInfoJSON.classmateUserInfos != null) {
				classmateUserInfos = classInfoJSON.classmateUserInfos;
			}
			
			if(classInfoJSON.teacherUserInfo != null) {
				teacherUserInfo = classInfoJSON.teacherUserInfo;
			}
			
			if(classInfoJSON.sharedTeacherUserInfos != null) {
				sharedTeacherUserInfos = classInfoJSON.sharedTeacherUserInfos;
			}
		}
	}
	
	return this.createUserAndClassInfo(myUserInfo, periods, classmateUserInfos, teacherUserInfo, sharedTeacherUserInfos);
};


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/user/userandclassinfo.js');
};