<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../../favicon.jsp"%>
<title><spring:message code="student.studentinfo.studentInfo" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<c:if test="${textDirection == 'rtl' }">
	<link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

</head>
<body style="background: #FFFFFF;">
	<div class="dialogContent">

		<div class="sectionHead">
			<spring:message code="student.studentinfo.studentInfo" />
		</div>
		<div class="dialogSection sectionContent">
			<table style="margin: 0 auto;">
				<tr>
					<th><spring:message code="id" /></th>
					<td><c:out value="${userInfoMap['ID']}" /></td>
				</tr>
				<tr>
					<th><spring:message code="student.studentinfo.fullName" /></th>
					<td><c:out value="${userInfoMap['First Name']}" />&nbsp;<c:out
							value="${userInfoMap['Last Name']}" /></td>
				</tr>
				<tr>
					<th><spring:message code="student.studentinfo.wiseUsername" /></th>
					<td><c:out value="${userInfoMap['Username']}" /></td>
				</tr>
				<tr>
					<th><spring:message code="student.studentinfo.mostRecentLogin" /></th>
					<td><fmt:formatDate value="${userInfoMap['Last Login']}"
							type="both" dateStyle="medium" timeStyle="short" /></td>
				</tr>
				<tr>
					<th><spring:message
							code="student.studentinfo.registrationDate" /></th>
					<td><fmt:formatDate value="${userInfoMap['Sign Up Date']}"
							type="both" dateStyle="medium" timeStyle="short" /></td>
				</tr>
				<tr>
					<th><spring:message code="student.studentinfo.gender" /></th>
					<td><span style="text-transform: lowercase;"><c:out
								value="${userInfoMap['Gender']}" /></span></td>
				</tr>
				<tr>
					<th><spring:message code="student.studentinfo.birthday" /></th>
					<td><fmt:formatDate value="${userInfoMap['Birthday']}"
							pattern="MMM dd" /> (<fmt:formatDate
							value="${userInfoMap['Birthday']}" pattern="MM/dd" />)</td>
				</tr>
				<tr>
					<th><spring:message code="teacher.registerteacher.language" /></th>
					<td><span style="text-transform: lowercase;">
						<c:out value="${userInfoMap['Language']}" /></td>
				</tr>
				<tr>
					<th><spring:message code="student.studentinfo.numberOfLogins" /></th>
					<td><c:out value="${userInfoMap['Number of Logins']}" /></td>
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
						<th><spring:message
								code="student.studentinfo.runTeacherUsername" /></th>
						<td><c:out value="${run.owner.userDetails.username}"></c:out></td>
					</tr>

					<tr>
						<th><spring:message
								code="student.studentinfo.runTeacherEmail" /></th>
						<td><c:out value="${run.owner.userDetails.emailAddress}"></c:out></td>
					</tr>

					<tr>
						<th colspan="2"><hr></hr></th>
					</tr>
				</c:forEach>
			</table>
		</div>
	</div>
</body>
</html>
