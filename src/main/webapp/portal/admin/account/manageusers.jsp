<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>  
<!-- <link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />  -->
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
    
<script src="${contextPath}/<spring:theme code="generalsource" />" type="text/javascript"></script>
    
<title><spring:message code="wiseAdmin" /></title>

<script type="text/javascript">
// does a form POST to find the project by runId.
function findRunByRunId(runId) {
	$("#findProjectRunsFormRunId").val(runId);
	$("#findProjectRunsByIdForm").submit();
};
$(document).ready(function() {
	if ($(".newTeacher").length > 0) {
		$(".newTeacherTotal").html("("+$(".newTeacher").length+")")
	}
	if ($(".newStudent").length > 0) {
		$(".newStudentTotal").html("("+$(".newStudent").length+")")
	}
});
</script>
</head>
<body>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<c:choose>
<c:when test="${fn:length(loggedInTeacherUsernames) > 0 || fn:length(loggedInStudentUsernames) > 0}">
<div><spring:message code="admin.account.manageusers.currentlyLoggedInTeachers" /> (${fn:length(loggedInTeacherUsernames)}).  <spring:message code="admin.account.manageusers.newTeachersMsg" /> <span class='newTeacherTotal'></span></div>
<table id="teachersTable" border="2">
    <tr><th><spring:message code="username" /></th><th colspan="3"><spring:message code="available_actions" /></th></tr>
	<c:forEach var="user" items="${loggedInTeacherUsernames}">
		<c:set var="username" value="${user.userDetails.username}"></c:set>
		<c:choose>
		<c:when test="${user.userDetails.numberOfLogins == 1}">
			<tr style="background-color:lightpink" class="newTeacher">
		</c:when>
		<c:otherwise>
			<tr>
		</c:otherwise>
		</c:choose>
			<td>${username}</td>
			<td><a href="#" onclick="javascript:popup640('../../teacher/management/changepassword.html?userName=${username}');"><spring:message code="changePassword" /></a></td>
			<td><a href="../../j_acegi_switch_user?j_username=${username}"><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
			<td><a href="#" onclick="javascript:popup640('../../teacherinfo.html?userName=${username}');"><spring:message code="info" /></a></td>
		</tr>
	</c:forEach>
</table>
<br/>
<div><spring:message code="admin.account.manageusers.currentlyLoggedInStudents" /> (${fn:length(loggedInStudentUsernames)}). <spring:message code="admin.account.manageusers.newStudentsMsg" /> <span class='newStudentTotal'></span></div>
<table id="studentsTable" border="2">
<tr><th><spring:message code="username" /></th><th colspan="3"><spring:message code="available_actions" /></th><th><spring:message code="admin.account.manageusers.runInfoIfInProgress" /></th></tr>
	<c:forEach var="studentUserArray" items="${loggedInStudentUsernames}">
	<!--  user[0] = student username
	      user[1] = run object that student is running
	-->
		<c:set var="user" value="${studentUserArray[0]}"></c:set>
		<c:set var="username" value="${user.userDetails.username}"></c:set>
		<c:choose>
		<c:when test="${user.userDetails.numberOfLogins == 1}">
			<tr style="background-color:lightpink" class="newStudent">
		</c:when>
		<c:otherwise>
			<tr>
		</c:otherwise>
		</c:choose>
			<td>${username}</td>
			<td><a href="#" onclick="javascript:popup640('../../teacher/management/changepassword.html?userName=${username}');"><spring:message code="changePassword" /></a></td> 
			<td><a href="../j_acegi_switch_user?j_username=${username}"><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td> 
			<td><a href="#" onclick="javascript:popup640('../../teacherinfo.html?userName=${username}');"><spring:message code="info" /></a></td>
			<c:if test="${not empty studentUserArray[1]}">
				<td>
				<a style="color:blue;text-decoration:underline; cursor:pointer" onclick="findRunByRunId(${studentUserArray[1].id})">(<spring:message code="run_id" />: ${studentUserArray[1].id}) | <spring:message code="run_name" />: "${studentUserArray[1].name}"  
				<c:forEach var="owner" items="${studentUserArray[1].owners}">
					| <spring:message code="teacher_cap" />: ${owner.userDetails.username}
					${owner.userDetails.schoolname}, ${owner.userDetails.city}, ${owner.userDetails.state},${owner.userDetails.country}
				</c:forEach>
				</a></td>
			</c:if>
		</tr>
	</c:forEach>
</table>
</c:when>

<c:otherwise>

<c:choose>
<c:when test="${studentsWhoLoggedInSinceYesterday != null && teachersWhoLoggedInSinceYesterday != null}">
<spring:message code="admin.account.manageusers.teachersWhoLoggedInToday" /> (${fn:length(teachersWhoLoggedInSinceYesterday)}). <spring:message code="admin.account.manageusers.newTeachersMsg" /> <span class='newTeacherTotal'></span>
<table id="teachersTable" border="2">
	<c:forEach var="user" items="${teachersWhoLoggedInSinceYesterday}">
		<c:set var="username" value="${user.userDetails.username}"></c:set>
		<c:choose>
		<c:when test="${user.userDetails.numberOfLogins == 1}">
			<tr style="background-color:lightpink" class="newTeacher">
		</c:when>
		<c:otherwise>
			<tr>
		</c:otherwise>
		</c:choose>
			<td>${username}</td>
			<td><a href="#"
				onclick="javascript:popup640('../../teacher/management/changepassword.html?userName=${username}');"><spring:message code="changePassword" /></a></td>
			<td><a href="../../j_acegi_switch_user?j_username=${username}"><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
			<td><a href="#"
				onclick="javascript:popup640('../../teacherinfo.html?userName=${username}');"><spring:message code="info" /></a></td>
			<td>${user.userDetails.schoolname},${user.userDetails.city},${user.userDetails.state},${user.userDetails.country}</td>
		</tr>
	</c:forEach>
</table>
<br/><br/>
<spring:message code="admin.account.manageusers.studentsWhoLoggedInToday" /> (${fn:length(studentsWhoLoggedInSinceYesterday)}). <spring:message code="admin.account.manageusers.newStudentsMsg" /> <span class='newStudentTotal'></span>
<table id="teachersTable" border="2">
	<c:forEach var="user" items="${studentsWhoLoggedInSinceYesterday}">
		<c:set var="username" value="${user.userDetails.username}"></c:set>
		<c:choose>
		<c:when test="${user.userDetails.numberOfLogins == 1}">
			<tr style="background-color:lightpink" class="newStudent">
		</c:when>
		<c:otherwise>
			<tr>
		</c:otherwise>
		</c:choose>
			<td>${username}</td>
			<td><a href="#"
				onclick="javascript:popup640('../../teacher/management/changepassword.html?userName=${username}');"><spring:message code="changePassword" /></a></td>
			<td><a href="../../j_acegi_switch_user?j_username=${username}"><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
			<td><a href="#"
				onclick="javascript:popup640('../../teacherinfo.html?userName=${username}');"><spring:message code="info" /></a></td>
		</tr>
	</c:forEach>
</table>
		
</c:when>
<c:otherwise>

<c:choose>
<c:when test="${fn:length(teachers) > 0}">
<div><spring:message code="admin.account.manageusers.totalNumberOfTeachers" />: ${fn:length(teachers)}</div>
<table id="teachersTable" border="2">
	<c:forEach var="username" items="${teachers}">
		<tr>
			<td>${username}</td>
			<td><a href="#" onclick="javascript:popup640('../../teacher/management/changepassword.html?userName=${username}');"><spring:message code="changePassword" /></a></td>
			<td><a href="../../j_acegi_switch_user?j_username=${username}"><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
			<td><a href="#" onclick="javascript:popup640('../../teacherinfo.html?userName=${username}');"><spring:message code="info" /></a></td>
		</tr>
	</c:forEach>
</table>
</c:when>
<c:otherwise>
<div><spring:message code="admin.account.manageusers.totalNumberOfStudents" />: ${fn:length(students)}</div>
<table id="teachersTable" border="2">
	<c:forEach var="username" items="${students}">
		<tr>
			<td>${username}</td>
			<td><a href="#" onclick="javascript:popup640('../../teacher/management/changepassword.html?userName=${username}');"><spring:message code="changePassword" /></a></td>
			<td><a href="../../j_acegi_switch_user?j_username=${username}"><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
			<td><a href="#" onclick="javascript:popup640('../../studentinfo.html?userName=${username}');"><spring:message code="info" /></a></td>
		</tr>
	</c:forEach>
</table>
</c:otherwise>
</c:choose>

</c:otherwise>
</c:choose>


</c:otherwise>

</c:choose>
<form style="visibility:hidden" id="findProjectRunsByIdForm" method="post" action="../run/findprojectrunsbyrunid.html">
<input type="hidden" id="findProjectRunsFormRunId" name="runId" value=""></input>
</form>
</body>
</html>