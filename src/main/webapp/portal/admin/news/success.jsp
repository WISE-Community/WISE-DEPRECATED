<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"    type="text/css" />

<title><spring:message code="wiseAdmin" /></title>
</head>

<body>

<h1><spring:message code="success" /></h1>

<div><a href="#" onclick="parent.location.reload(); window.close()"><spring:message code="close" /></a></div>

</body>
</html>