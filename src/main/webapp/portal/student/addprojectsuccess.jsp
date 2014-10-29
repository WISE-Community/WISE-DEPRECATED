<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="student.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

</head>
<body style="background:#FFFFFF;" onload="window.parent.location.reload();">
	<div class="dialogContent">
		<h5><spring:message code="student.addprojectsuccess"/></h5>
	</div>
</body>
</html>