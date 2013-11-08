<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<script type="text/javascript" src="./javascript/tels/general.js"></script>

<title>Teacher Information</title>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

</head>

<body>

	<h3><spring:message code="teacher.teacherinfo.teacherInformation"/></h3>

	<table id="teacherInfoTable" border="2" cellpadding="2" cellspacing="0" align="center">
	<tr>
		<th><spring:message code="teacher.teacherinfo.id"/></th>
		<td><c:out value="${userInfoMap['ID']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.name"/></th>
		<td><c:out value="${userInfoMap['First Name']}"/>&nbsp;<c:out value="${userInfoMap['Last Name']}"/> </td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.username"/></th>
		<td><c:out value="${userInfoMap['Username']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.displayName"/></th>
		<td><c:out value="${userInfoMap['Display Name']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.emailAddress"/></th>
		<td><c:out value="${userInfoMap['Email']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.signupDate"/></th>
		<td><fmt:formatDate value="${userInfoMap['Sign Up Date']}" type="both" dateStyle="short" timeStyle="short"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.city"/></th>
		<td><c:out value="${userInfoMap['City']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.state"/></th>
		<td><c:out value="${userInfoMap['State']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.country"/></th>
		<td><c:out value="${userInfoMap['Country']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.schoolName"/></th>
		<td><c:out value="${userInfoMap['School Name']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.schoolLevel"/></th>
		<td><span style="text-transform:lowercase;"><c:out value="${userInfoMap['School Level']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.curriculumSubjects"/></th>
		<td><span style="text-transform:lowercase;"><c:out value="${userInfoMap['Curriculum Subjects']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.howDidYouHear"/></th>
		<td><span style="text-transform:lowercase;"><c:out value="${userInfoMap['How did you hear about us']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.numberOfLogins"/></th>
		<td><c:out value="${userInfoMap['Number of Logins']}"/></td>
	</tr>
	<tr>
		<th><spring:message code="teacher.teacherinfo.lastLogin"/></th>
		<td><fmt:formatDate value="${userInfoMap['Last Login']}" type="both" dateStyle="short" timeStyle="short"/></td>
	</tr>
</table>
<br>

<a href="#" onclick="javascript:window.close()"><spring:message code="teacher.teacherinfo.closeThisWindow" /></a>
</body>
</html>