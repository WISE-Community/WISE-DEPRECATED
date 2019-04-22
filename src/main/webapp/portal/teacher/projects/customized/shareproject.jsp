<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>

<html dir="${textDirection}">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></meta>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script type="text/javascript" src="${contextPath}/<spring:theme code="generalsource"/>"></script>
 
<title><spring:message code="teacher.projects.customized.shareproject.title"/></title>

<script type="text/javascript">

var teacherUsernamesString = "${teacher_usernames}";
var teacherUsernames = teacherUsernamesString.split(":");

//order the teacher user names alphabetically
teacherUsernames = teacherUsernames.sort(function(username1, username2) {
	var result = 0;
	
	if(username1 != null && username2 != null) {
		var username1LowerCase = username1.toLowerCase();
		var username2LowerCase = username2.toLowerCase();
		
		if(username1LowerCase < username2LowerCase) {
			result = -1;
		} else if(username1LowerCase > username2LowerCase) {
			result = 1;
		}
	}
	
	return result;
});

// updates the search input box with the specified text
function updateInputBox(text) {
	document.getElementById("sharedOwnerUsernameInput").value=text;
}
function populatePossibilities(username) {
	var matchedUsernameUL = document.getElementById("matchedUsernames");
	matchedUsernameUL.innerHTML = "";
	if (username.length > 0) {
		var resultArray = findStringsContaining(username, teacherUsernames);
		for (k=0; k < resultArray.length; k++) {
			var matchedUsernameLI = document.createElement("li");
			matchedUsernameLI.innerHTML = "<a onclick='updateInputBox(\""+resultArray[k]+"\")'>" + resultArray[k] + "</a>";
			matchedUsernameUL.appendChild(matchedUsernameLI);
		}
	}
}


// returns an array of strings that contain what
function findStringsContaining(what, all_array) {
	var resultArray = new Array();
	for (i=0; i < all_array.length; i++) {
		if (all_array[i].toLowerCase().indexOf(what.toLowerCase()) > -1) {
			resultArray.push(all_array[i]);
		}
	}	
	return resultArray;
}

// when remove user is clicked, confirm with user
function removeSharedUserClicked() {
  return confirm('<spring:message code="teacher.projects.customized.shareproject.confirm"/>');
}
</script>

</head>

<body style="background:#FFFFFF;">

<div class="dialogContent">		

	<div id="sharingSearchBoxHelp" class="dialogSection"><spring:message code="teacher.projects.customized.shareproject.instructions"/></div>
	
	<div id="sharingSearchSelect">
		<form:form method="post" modelAttribute="addSharedTeacherParameters" autocomplete='off'>
			<spring:message code="teacher.projects.customized.shareproject.searchLabel"/> <form:input path="sharedOwnerUsername" id="sharedOwnerUsernameInput" onkeyup="populatePossibilities(this.value)" size="25"/>
			<input type="submit" value="<spring:message code="save"/>"></input>
		</form:form>
		<ul id="matchedUsernames"></ul>
	</div>	
	
	<table id="sharedProjectPermissions" class="wisetable">
	
		<tr>
			<th><spring:message code="teacher.projects.customized.shareproject.usernameHeader"/></th>
			<th><spring:message code="teacher.projects.customized.shareproject.permissionHeader"/></th> 
			<th><spring:message code="teacher.projects.customized.shareproject.optionsHeader"/></th> 
		</tr>
		<tr>
			<c:choose>
				<c:when test="${project.owner == null }">
				</c:when>
				<c:otherwise>
					<td class="emph">${project.owner.userDetails.username}</td>
					<td><spring:message code="teacher.projects.customized.shareproject.owner"/></td>
					<td></td>
				</c:otherwise>
			</c:choose>
		</tr>
		
		<c:choose>
			<c:when test="${fn:length(project.sharedowners) == 0}">
			</c:when>
			<c:otherwise>
				<c:forEach var="sharedowner" items="${project.sharedOwnersOrderedAlphabetically}">
						<tr>
							<td>${sharedowner.userDetails.username}</td>
							<td>		
							<form:form method="post" id="${sharedowner.userDetails.username}"
								modelAttribute="${sharedowner.userDetails.username}" autocomplete='off'>
								<form:hidden path="sharedOwnerUsername" />
							
								<form:radiobutton path="permission"
									onclick="javscript:this.form.submit();" value="ROLE_READ_PROJECT" /><spring:message code="teacher.projects.customized.shareproject.canView"/><br />
								<form:radiobutton path="permission"
									onclick="javscript:this.form.submit();" value="ROLE_WRITE_PROJECT" /><spring:message code="teacher.projects.customized.shareproject.canEdit"/><br />
								<sec:authorize access="hasRole('ROLE_USER')">
								   <sec:authorize access="hasRole('ROLE_ADMINISTRATOR')">
									<form:radiobutton path="permission"
										onclick="javscript:this.form.submit();" value="ROLE_SHARE_PROJECT" /><spring:message code="teacher.projects.customized.shareproject.canShare"/><br />
									</sec:authorize>
								   <sec:authorize access="!hasAnyRole('ROLE_ADMINISTRATOR')">
										<sec:accesscontrollist domainObject="${project}" hasPermission="16">												
								        	<form:radiobutton path="permission"
									    	    onclick="javscript:this.form.submit();" value="ROLE_SHARE_PROJECT" /><spring:message code="teacher.projects.customized.shareproject.canShare"/><br />								
										</sec:accesscontrollist>					
									</sec:authorize>							
						    	</sec:authorize>
						    </form:form>					    									
							</td>
							<td>
								<form:form method="post" id="${sharedowner.userDetails.username}" modelAttribute="${sharedowner.userDetails.username}" autocomplete='off'>
	            					<form:hidden path="sharedOwnerUsername" />
	            					<input type="hidden" name="removeUserFromProject" value="true"></input>
									<input type="submit" value="Remove this User" onclick="return removeSharedUserClicked();"></input>
				    			</form:form>
						</td>
								
						</tr>
				</c:forEach>
			</c:otherwise>
		</c:choose>
	
	</table> 
</div>

<c:if test="${not empty message}">
<script type="text/javascript">
 alert("${message}");
</script>
</c:if>

</body>
</html>

