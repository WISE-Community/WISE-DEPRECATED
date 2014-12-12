angular.module('UserAndClassInfoService', [])

.service('UserAndClassInfoService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {
	
	this.userAndClassInfo = null;
	
	this.retrieveUserAndClassInfo = function(update) {
		var userAndClassInfoUrl = ConfigService.getConfigParam('getUserInfoUrl');
		
		return $http.get(userAndClassInfoUrl).then(angular.bind(this, function(result) {
			var userAndClassInfo = result.data;
			
			this.userAndClassInfo = userAndClassInfo;
			
			return userAndClassInfo;
		}));
	};
	
	this.retrieveUserAndClassInfo0 = function(update) {
		
		if(this.userAndClassInfo == null || update) {
			return ConfigService.getConfigParam('getUserInfoUrl').then(angular.bind(this, function(result) {
				var userAndClassInfoUrl = result;
				
				return $http.get(userAndClassInfoUrl).then(angular.bind(this, function(result) {
					var userAndClassInfo = result.data;
					
					this.userAndClassInfo = userAndClassInfo;
					
					return userAndClassInfo;
				}));
			}));
		} else {
			var deferred = $q.defer();
			deferred.resolve(this.userAndClassInfo);
			return deferred.promise;
		}
	};
	
	this.getClassmateUserInfos = function() {
		var userAndClassInfo = this.userAndClassInfo;
		
		if(userAndClassInfo != null) {
			var myUserInfo = userAndClassInfo.myUserInfo;
			
			if(myUserInfo != null) {
				var myClassInfo = myUserInfo.myClassInfo;
				
				if(myClassInfo != null) {
					var classmateUserInfos = myClassInfo.classmateUserInfos;
					
					if(classmateUserInfos != null) {
						return classmateUserInfos;
					}
				}				
			}
		}
		
		return null;
	};
	
	this.getStudentWorkgroupIds = function() {
		var studentWorkgroupIds = [];
		
		var userAndClassInfo = this.userAndClassInfo;
		
		if(userAndClassInfo != null) {
			var myUserInfo = userAndClassInfo.myUserInfo;
			
			if(myUserInfo != null) {
				
				var myClassInfo = myUserInfo.myClassInfo;
				
				if(myClassInfo != null) {
					var classmateUserInfos = myClassInfo.classmateUserInfos;
					
					if(classmateUserInfos != null) {
						for(var x=0; x<classmateUserInfos.length; x++) {
							var classmateUserInfo = classmateUserInfos[x];
							
							if(classmateUserInfo != null) {
								var workgroupId = classmateUserInfo.workgroupId;
								
								studentWorkgroupIds.push(workgroupId);
							}
						}
					}					
				}
			}
		}
		
		return studentWorkgroupIds;
	};
	
	this.getTeacherWorkgroupIds = function() {
		var teacherWorkgroupIds = [];
		
		var userAndClassInfo = this.userAndClassInfo;
		
		if(userAndClassInfo != null) {
			var myUserInfo = userAndClassInfo.myUserInfo;
			
			if(myUserInfo != null) {
				var workgroupId = myUserInfo.workgroupId;
				teacherWorkgroupIds.push(workgroupId);
				
				var myClassInfo = myUserInfo.myClassInfo;
				
				if(myClassInfo != null) {
					var sharedTeacherUserInfos = myClassInfo.sharedTeacherUserInfos;
					
					if(sharedTeacherUserInfos != null) {
						
						for(var x=0; x<sharedTeacherUserInfos.length; x++) {
							var sharedTeacherUserInfo = sharedTeacherUserInfos[x];
							
							var tempWorkgroupId = sharedTeacherUserInfo.workgroupId;
							
							teacherWorkgroupIds.push(tempWorkgroupId);
						}
					}
				}
			}
		}
		
		return teacherWorkgroupIds;
	};
	
	this.getPeriodsIds = function() {
		var periodIds = [];
		
		var userAndClassInfo = this.userAndClassInfo;
		
		if(userAndClassInfo != null) {
			var myUserInfo = userAndClassInfo.myUserInfo;
			
			if(myUserInfo != null) {
				var periodId = myUserInfo.periodId;
				
				periodIds = periodId.split(':');
			}
		}
		
		return periodIds;
	};
}]);