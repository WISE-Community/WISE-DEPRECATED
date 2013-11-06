<%@ include file="../../include.jsp" %>

<!DOCTYPE html>

<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherrunstylesheet" />" media="screen" rel="stylesheet" type="text/css" />


<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
 
<title><spring:message code="teacher.run.shareprojectrun.sharingPermissions"/></title>

<script type="text/javascript">
//extend Array prototype
Array.prototype.contains = function(obj) {
	  var i = this.length;
	  while (i--) {
	    if (this[i] === obj) {
	      return true;
	    }
	  }
	  return false;
}

var teacherUsernamesString = "${teacher_usernames}";
var teacherUsernames = teacherUsernamesString.split(":");
teacherUsernames = teacherUsernames.sort();

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

//when remove user is clicked, confirm with user
function removeSharedUserClicked() {
  return confirm('<spring:message code="teacher.run.shareprojectrun.areYouSureYouWantToRemoveSharedTeacher"/>');
}
</script>

</head>

<body style="background:#FFFFFF;">

<div class="dialogContent">		

	<div id="sharingSearchBoxHelp" class="dialogSection"><spring:message code="teacher.run.shareprojectrun.toShareRunWithAnotherTeacher"/></div>
	<div id="sharingSearchSelect">
		<form:form method="post" commandName="addSharedTeacherParameters" autocomplete='off'>
			<spring:message code="teacher.run.shareprojectrun.wiseUser"/> <form:input path="sharedOwnerUsername" id="sharedOwnerUsernameInput" onkeyup="populatePossibilities(this.value)" size="30"/>
		    <input type="submit" value="Save" />
		</form:form>
		<ul id="matchedUsernames"></ul>
	</div>
	
	<table id="sharedProjectPermissions" class='wisetable'>
	
		<tr>
			<th><spring:message code="teacher.run.shareprojectrun.username"/></th>
			<th><spring:message code="teacher.run.shareprojectrun.permissionLevel"/></th> 
			<th><spring:message code="teacher.run.shareprojectrun.options"/></th>
		</tr>
		<!--  display owners of the run -->
		<c:choose>
			<c:when test="${fn:length(run.owners) == 0}">
			</c:when>
			<c:otherwise>
				<c:forEach var="owner" items="${run.owners}">
					<tr>
					    <td class="emph">${owner.userDetails.username}</td>
						<td><spring:message code="teacher.run.shareprojectrun.ownerOfProjectRun"/></td>
						<td></td>
				    </tr>
				</c:forEach>
			</c:otherwise>
		</c:choose>
		
		<!--  display shared owners of the run -->
		<c:forEach var="sharedowner" items="${run.sharedowners}">        
			    <tr>
			        <td class="user">${sharedowner.userDetails.username}</td>
				    <td align="left">
				    	<form:form method="post" id="${sharedowner.userDetails.username}" commandName="${sharedowner.userDetails.username}" autocomplete='off'>
	            			<form:hidden path="sharedOwnerUsername" />
				        	<form:radiobutton path="permission" onclick="javscript:this.form.submit();" value="ROLE_RUN_READ" /> <spring:message code="teacher.run.shareprojectrun.canViewProjectRun"/><br />
				    	    <form:radiobutton path="permission" onclick="javscript:this.form.submit();" value="ROLE_RUN_GRADE" /> <spring:message code="teacher.run.shareprojectrun.canViewAndGradeProjectRun"/>
				    	</form:form>			        
					</td>
					<td><form:form method="post" id="${sharedowner.userDetails.username}" commandName="${sharedowner.userDetails.username}" autocomplete='off'>
	            		<form:hidden path="sharedOwnerUsername" />
	            		<input type="hidden" name="removeUserFromRun" value="true"></input>
						<input type="submit" value="Remove this User" onclick="return removeSharedUserClicked();"></input>
				    	</form:form>			        
					    <!-- <a href='#' onclick="alert('Remove Shared Teacher is not yet implemented.');"><spring:message code="teacher.run.shareprojectrun.removeThisUser"/></a> -->
					</td>
				</tr>
		</c:forEach>
	
	</table>
</div>

</body>
</html>

