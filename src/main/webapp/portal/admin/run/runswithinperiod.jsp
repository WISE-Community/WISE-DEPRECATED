<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="wiseAdmin" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>

<style>
th {
	font-weight:bold;
	border:1px solid;
}
</style>
</head>
<body>
<%@ include file="../../headermain.jsp"%>

<div id="page">
<div id="pageContent" class="contentPanel">
<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<h3><spring:message code="run_plural" /> ${period} (${fn:length(runs)} <spring:message code="run_plural" />)</h3>
<table id="runStatsTable" border="1">
	<thead>
		<tr><th><spring:message code="run_id" /> (<spring:message code="run_accessCode" />)</th>
			<th><spring:message code="run_name" /></th>
			<th><spring:message code="admin.run.owners" /></th>
			<c:if test="${period!=null}">
				<th><spring:message code="admin.run.accessCount" /> ${period}</th>
			</c:if>
			<th><spring:message code="admin.run.totalAccessCount" /></th>
			<th><spring:message code="available_actions" /></th></tr>
	</thead>
	<tbody>
		<c:forEach var="run" items="${runs}">
			<tr>
				<td>${run.id} (${run.runcode})</td>
				<td>${run.name}</td>
				<td>
						<a href="${contextPath}/login/impersonate?username=${run.owner.userDetails.username}">${run.owner.userDetails.username}</a><br/>
						(${run.owner.userDetails.schoolname}, ${run.owner.userDetails.city}, ${run.owner.userDetails.state},${run.owner.userDetails.country})
				</td>
				<c:if test="${period!=null}">
					<td>${fn:length(run.studentAttendance)}</td>
				</c:if>
				<td>${run.timesRun}</td>
			    <td>
			    	<ul>
			    		<sec:authorize access="hasRole('ROLE_ADMINISTRATOR')">
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