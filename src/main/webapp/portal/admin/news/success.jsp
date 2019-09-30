<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="wiseAdmin" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"    type="text/css" />
<c:if test="${textDirection == 'rtl' }">
		<link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>
</head>
<body>
<h1><spring:message code="success" /></h1>
<div><a href="#" onclick="parent.location.reload(); window.close()"><spring:message code="close" /></a></div>
</body>
</html>