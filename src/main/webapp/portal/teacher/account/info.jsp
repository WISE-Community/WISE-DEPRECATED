<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../../favicon.jsp"%>
<title>Teacher Information</title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="generalsource" />" type="text/javascript"></script>

</head>
<body style="background: #FFFFFF;">
	<div class="dialogContent">
		<div class="sectionHead">
			<spring:message code="teacher.teacherinfo.teacherInformation" />
		</div>
		<div class="dialogSection sectionContent">

	<table style="margin: 0 auto;">
		<tr>
			<th><spring:message code="teacher.teacherinfo.id" /></th>
			<td><c:out value="${userInfoMap['ID']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.name" /></th>
			<td><c:out value="${userInfoMap['First Name']}" />&nbsp;<c:out
					value="${userInfoMap['Last Name']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.username" /></th>
			<td><c:out value="${userInfoMap['Username']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.displayName" /></th>
			<td><c:out value="${userInfoMap['Display Name']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.emailAddress" /></th>
			<td><c:out value="${userInfoMap['Email']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.signupDate" /></th>
			<td><fmt:formatDate value="${userInfoMap['Sign Up Date']}"
					type="both" dateStyle="short" timeStyle="short" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.city" /></th>
			<td><c:out value="${userInfoMap['City']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.state" /></th>
			<td><c:out value="${userInfoMap['State']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.country" /></th>
			<td><c:out value="${userInfoMap['Country']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.schoolName" /></th>
			<td><c:out value="${userInfoMap['School Name']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.schoolLevel" /></th>
			<td><span style="text-transform: lowercase;"><c:out
						value="${userInfoMap['School Level']}" /></td>
		</tr>
		<tr>
			<th><spring:message
					code="teacher.teacherinfo.curriculumSubjects" /></th>
			<td><span style="text-transform: lowercase;"><c:out
						value="${userInfoMap['Curriculum Subjects']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.registerteacher.language" /></th>
			<td><span style="text-transform: lowercase;"><c:out
						value="${userInfoMap['Language']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.howDidYouHear" /></th>
			<td><span style="text-transform: lowercase;"><c:out
						value="${userInfoMap['How did you hear about us']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.numberOfLogins" /></th>
			<td><c:out value="${userInfoMap['Number of Logins']}" /></td>
		</tr>
		<tr>
			<th><spring:message code="teacher.teacherinfo.lastLogin" /></th>
			<td><fmt:formatDate value="${userInfoMap['Last Login']}"
					type="both" dateStyle="short" timeStyle="short" /></td>
		</tr>
	</table>
	<br>
	<table style="margin: 0 auto;">
		<tr>
			<th colspan="2"><u><spring:message
						code="student.studentinfo.runList" /></u></th>
		</tr>

		<c:forEach var="run" items="${runList}">
			<tr>
				<th><spring:message code="student.studentinfo.runId" /></th>
				<td><c:out value="${run.id}"></c:out></td>
			</tr>

			<tr>
				<th><spring:message code="student.studentinfo.runName" /></th>
				<td><c:out value="${run.name}"></c:out></td>
			</tr>

			<tr>
				<th><spring:message code="student.studentinfo.runStartTime" /></th>
				<td><c:out value="${run.starttime}"></c:out></td>
			</tr>

			<tr>
				<th colspan="2"><hr></hr></th>
			</tr>
		</c:forEach>
	</table>

	</div>
</body>
</html>
