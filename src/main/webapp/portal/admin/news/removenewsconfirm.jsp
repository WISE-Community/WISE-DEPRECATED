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

<spring:message code="admin.news.confirmRemove" />: ${newsTitle}
<br><br>
<a href="removenewssuccess.html?newsId=${newsId}"><spring:message code="confirm" /></a><br><br>
<a href="#" onclick="javascript:window.close()"><spring:message code="cancel" /></a>

</body>
</html>