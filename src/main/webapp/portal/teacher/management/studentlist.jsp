<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>
</head>

<body style="background:#FFF; font-size:.9em;" onload="window.print();">
	<div class="pageContent">
		<div class="panelHeader">${run.name} <span dir=ltr>(Run ID: ${run.id})</span></div>
		<div class="panelContent">
			<c:forEach var="period" varStatus="periodStatus" items="${periods}">
				<div class="sectionHead"><spring:message code="run_period_label"/> ${period.name}</div>
				<ul>
				    <c:forEach var="student" varStatus="studentStatus" items="${period.members}">
						<li style="margin:.5em;">
							${student.userDetails.firstname} ${student.userDetails.lastname} <span dir=ltr>(${student.userDetails.username})</span>
						</li>
					</c:forEach>
				</ul>
			</c:forEach>
		</div>
	</div>
</body>

</html>