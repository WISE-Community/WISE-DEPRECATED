<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<script type="text/javascript">
</script>
</head>

<body style="background:#FFF; font-size:.9em;" onload="window.print();">
	<div class="pageContent">
		<div class="panelHeader">${run.name} (Run ID: ${run.id})</div>
		<div class="panelContent">
			<c:forEach var="period" varStatus="periodStatus" items="${periods}">
				<div class="sectionHead">Period: ${period.name}</div>
				<ul>
				  <c:forEach var="student" varStatus="studentStatus" items="${period.members}">
				    <li style="margin:.5em;">
				      ${student.userDetails.firstname} ${student.userDetails.lastname} (${student.userDetails.username})    
				    </li>
				  </c:forEach>      
				</ul>
			</c:forEach>
		</div>
	</div>

</body>

</html>