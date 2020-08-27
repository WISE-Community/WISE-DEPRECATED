<%@ include file="../../include.jsp"%>
<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<%@ include file="../../favicon.jsp"%>

<script src="${contextPath}/<spring:theme code="generalsource" />" type="text/javascript"></script>

<title><spring:message code="wiseAdmin" /></title>

<script type="text/javascript">
    $(document).ready(function() {
        if ($(".newTeacher").length > 0) {
            $(".newTeacherTotal").html("("+$(".newTeacher").length+")")
        }
        if ($(".newStudent").length > 0) {
            $(".newStudentTotal").html("("+$(".newStudent").length+")")
        }
    });
</script>
<style type="text/css">
.newTeacher, .newStudent {
  background-color:pink;
}

table.userTable {
  border: 1px solid #98BF21;
  border-collapse:collapse;
}

table.userTable th {
  border: 1px solid #98BF21;
  background-color: #A7C942;
  color: #FFFFFF;
  font-size:1.2em;
  padding:5px;
}

table.userTable td {
  border: 1px solid #98BF21;
  line-height:130%;
  padding: 3px 7px 2px;
}

a {
  color:blue;
  text-decoration:underline;
}

a:hover {
  cursor:pointer;
}

</style>
</head>
<body>
<jsp:useBean id="now" class="java.util.Date"/>
<fmt:formatDate value="${now}" pattern="yyyy-MM-dd" var="today"/>

<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>

<c:choose>
<c:when test="${fn:length(loggedInTeacherUsernames) > 0 || fn:length(loggedInStudentUsernames) > 0}">
<h3><spring:message code="admin.account.manageusers.currentlyLoggedInTeachers" /> (${fn:length(loggedInTeacherUsernames)}).  <spring:message code="admin.account.manageusers.newTeachersMsg" /> <span class='newTeacherTotal'></span></h3>
<table id="teachersTable" class='userTable' border="2">
    <tr><th><spring:message code="username" /></th><th colspan="4"><spring:message code="available_actions" /></th></tr>
    <c:forEach var="username" items="${loggedInTeacherUsernames}">
        <tr>
            <td>${username}</td>
            <td><a target='_blank' href='../../teacher/management/changepassword.html?username=${username}'><spring:message code="changePassword" /></a></td>
            <td><a onclick='impersonateUser("${username}")'><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
            <td><a target='_blank' href='../../teacher/account/info?username=${username}'><spring:message code="info" /></a></td>
            <td><a target='_blank' href='manageuserroles.html?username=${username}'><spring:message code="admin.index.manageUserRoles" /></a></td>
        </tr>
    </c:forEach>
</table>
<br/>
<hr/>
<h3><spring:message code="admin.account.manageusers.currentlyLoggedInStudents" /> (${fn:length(loggedInStudentUsernames)}). <spring:message code="admin.account.manageusers.newStudentsMsg" /> <span class='newStudentTotal'></span></h3>
<table id="studentsTable" class='userTable' border="2">
<tr><th><spring:message code="username" /></th><th colspan="3"><spring:message code="available_actions" /></th></tr>
    <c:forEach var="username" items="${loggedInStudentUsernames}">
        <tr>
            <td>${username}</td>
            <td><a target='_blank' href='../../teacher/management/changepassword.html?username=${username}'><spring:message code="changePassword" /></a></td>
            <td><a onclick='impersonateUser("${username}")'><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
            <td><a target='_blank' href='../../student/account/info?username=${username}'><spring:message code="info" /></a></td>
        </tr>
    </c:forEach>
</table>
</c:when>

<c:otherwise>

<c:choose>
    <c:when test="${studentsWhoLoggedInSince != null && teachersWhoLoggedInSince != null}">
        <h3><spring:message code="admin.account.manageusers.teachersWhoLoggedIn" /> (${fn:length(teachersWhoLoggedInSince)}). <spring:message code="admin.account.manageusers.newTeachersMsg" /> <span class='newTeacherTotal'></span></h3>
        <table id="teachersTable" class='userTable' border="2">
            <c:forEach var="user" items="${teachersWhoLoggedInSince}">
                <c:set var="username" value="${user.userDetails.username}"></c:set>
                <c:choose>
                    <c:when test="${user.userDetails.signupdate > today}">
                        <tr class="newTeacher">
                    </c:when>
                    <c:otherwise>
                        <tr>
                    </c:otherwise>
                </c:choose>
                <td>${username}</td>
                <td><a target='_blank' href='../../teacher/management/changepassword.html?username=${username}'><spring:message code="changePassword" /></a></td>
                <td><a onclick='impersonateUser("${username}")'><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
                <td><a target='_blank' href='../../teacher/account/info?username=${username}'><spring:message code="info" /></a></td>
                <td>${user.userDetails.schoolname},${user.userDetails.city},${user.userDetails.state},${user.userDetails.country}</td>
                </tr>
            </c:forEach>
        </table>
        <br/>
        <hr/>
        <h3><spring:message code="admin.account.manageusers.studentsWhoLoggedIn" /> (${fn:length(studentsWhoLoggedInSince)}). <spring:message code="admin.account.manageusers.newStudentsMsg" /> <span class='newStudentTotal'></span></h3>
        <table id="teachersTable" class='userTable' border="2">
            <c:forEach var="user" items="${studentsWhoLoggedInSince}">
                <c:set var="username" value="${user.userDetails.username}"></c:set>
                <c:choose>
                    <c:when test="${user.userDetails.signupdate > today}">
                        <tr class="newStudent">
                    </c:when>
                    <c:otherwise>
                        <tr>
                    </c:otherwise>
                </c:choose>
                <td>${username}</td>
                <td><a target='_blank' href='../../teacher/management/changepassword.html?username=${username}'><spring:message code="changePassword" /></a></td>
                <td><a onclick='impersonateUser("${username}")'><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
                <td><a target='_blank' href='../../student/account/info?username=${username}'><spring:message code="info" /></a></td>
                </tr>
            </c:forEach>
        </table>
    </c:when>
    <c:otherwise>
        <c:choose>
            <c:when test="${fn:length(teachers) > 0}">
                <h3><spring:message code="admin.account.manageusers.totalNumberOfTeachers" />: ${fn:length(teachers)}</h3>
                <table id="teachersTable" class='userTable' border="2">
                    <c:forEach var="username" items="${teachers}">
                        <tr>
                            <td>${username}</td>
                            <td><a target='_blank' href='../../teacher/management/changepassword.html?username=${username}'><spring:message code="changePassword" /></a></td>
                            <td><a onclick='impersonateUser("${username}")'><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
                            <td><a target='_blank' href='../../teacher/account/info?username=${username}'><spring:message code="info" /></a></td>
                            <td><a target='_blank' href='manageuserroles.html?username=${username}'><spring:message code="admin.index.manageUserRoles" /></a></td>
                        </tr>
                    </c:forEach>
                </table>
            </c:when>
            <c:otherwise>
                <h3><spring:message code="admin.account.manageusers.totalNumberOfStudents" />: ${fn:length(students)}</h3>
                <table id="studentsTable" class='userTable' border="2">
                    <c:forEach var="username" items="${students}">
                        <tr>
                            <td>${username}</td>
                            <td><a target='_blank' href='../../teacher/management/changepassword.html?username=${username}'><spring:message code="changePassword" /></a></td>
                            <td><a onclick='impersonateUser("${username}")'><spring:message code="admin.account.manageusers.logInAsThisUser" /></a></td>
                            <td><a target='_blank' href='../../student/account/info?username=${username}'><spring:message code="info" /></a></td>
                        </tr>
                    </c:forEach>
                </table>
</c:otherwise>
</c:choose>

</c:otherwise>
</c:choose>
</c:otherwise>
</c:choose>
</body>
</html>
