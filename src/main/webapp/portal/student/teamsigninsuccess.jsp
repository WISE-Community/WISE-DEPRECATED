<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

<title><spring:message code="student.teamsigninsuccess.teamSignInSuccess" /></title>
</head>

<body onload="setTimeout('self.close()', 5000);" onunload="opener.location.reload()">
   <spring:message code="student.teamsigninsuccess.teamSignInSuccess"/>
</body>
</html>
