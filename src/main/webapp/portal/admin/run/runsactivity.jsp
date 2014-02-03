<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<title><spring:message code="wiseAdmin" /></title>
</head>

<body>


<%@ include file="../../headermain.jsp"%>
<div id="page">
<div id="pageContent" class="contentPanel">

<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<h3><spring:message code="admin.index.runsByActivity" /></h3>
<table id="runStatsTable">
	<thead>
		<tr><th><spring:message code="run_id" /></th><th><spring:message code="run_accessCode" /></th><th><spring:message code="run_name" /></th>
		<th><spring:message code="admin.run.owners" /></th><th><spring:message code="admin.run.totalAccessCount" /></th></tr>
	</thead>
	<tbody>
		<tr></tr>
		<c:forEach var="run" items="${runs}">
			<tr>
				<td>${run.id}</td>
				<td>${run.runcode}</td>
				<td>${run.name}</td>
				<td>
					<c:forEach var="owner" items="${run.owners}">
						${owner.userDetails.username}&nbsp;
					</c:forEach>
				</td>
				<td>${run.timesRun}</td>
			</tr>
		</c:forEach>
	</tbody>
</table>
</div>
</div>

</body>
</html>