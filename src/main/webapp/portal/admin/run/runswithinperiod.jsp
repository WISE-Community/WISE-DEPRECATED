<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

<title><spring:message code="wiseAdmin" /></title>
</head>

<body>
<%@ include file="../../headermain.jsp"%>

<div id="page">
<div id="pageContent" class="contentPanel">
<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<h3><spring:message code="run_plural" /> ${period} (${fn:length(runs)} <spring:message code="run_plural" />)</h3>
<table id="runStatsTable" border="1">
	<thead>
		<tr><th><spring:message code="run_id" /></th><th><spring:message code="run_accessCode" /></th><th><spring:message code="run_name" /></th>
			<th><spring:message code="run_lastAccessTime" /></th><th><spring:message code="admin.run.accessCount" /> ${period}</th>
			<th><spring:message code="run_name" /><spring:message code="admin.run.totalAccessCount" /></th><th><spring:message code="admin.run.owners" /></th>
			<th><spring:message code="available_actions" /></th></tr>
	</thead>
	<tbody>
		<tr></tr>
		<c:forEach var="run" items="${runs}">
			<tr>
				<td>${run.id}</td>
				<td>${run.runcode}</td>
				<td>${run.name}</td>
				<td><fmt:formatDate value="${run.lastRun}" type="both" dateStyle="short" timeStyle="short" /></td>
				<td>${fn:length(run.studentAttendance)}</td>
				<td>${run.timesRun}</td>
				<td>
					<c:forEach var="owner" items="${run.owners}">
						<a href="${contextPath}/j_acegi_switch_user?j_username=${owner.userDetails.username}">${owner.userDetails.username}</a><br/>
						(${owner.userDetails.schoolname}, ${owner.userDetails.city}, ${owner.userDetails.state},${owner.userDetails.country})
					</c:forEach>
				</td>
			    <td>
			    	<ul>
			    		<sec:authorize ifAnyGranted="ROLE_ADMINISTRATOR">
			    		  <li><a href="${contextPath}/teacher/run/shareprojectrun.html?runId=${run.id}"><spring:message code="admin.run.manageSharedTeachers" /></a></li>
			    		  <li><a href="${contextPath}/teacher/management/viewmystudents.html?runId=${run.id}"><spring:message code="admin.run.manageStudents" /></a></li>
			    		</sec:authorize>
			    	</ul>
			    </td>
			</tr>
		</c:forEach>
	</tbody>
</table>
</div>

</div>
</body>
</html>