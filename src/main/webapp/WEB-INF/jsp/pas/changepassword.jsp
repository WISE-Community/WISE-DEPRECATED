<%@ include file="includes/include.jsp"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "XHTML1-s.dtd" />
<html xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"
    type="text/css" />
    
<script type="text/javascript" src="./javascript/tels/rotator.js"></script>
    
<title><spring:message code="application.title" /></title>
</head>

<body>

<%@ include file="includes/header.jsp"%>

<div id="columns">
<div id="left"><%@ include file="includes/menu.jsp"%>
</div>

<!-- Support for Spring errors object -->
<spring:bind path="changePasswordParameters.*">
  <c:forEach var="error" items="${status.errorMessages}">
    <b>
      <br /><c:out value="${error}"/>
    </b>
  </c:forEach>
</spring:bind>

<h2><spring:message code="change.password" /></h2>

	<form:form method="post" action="changepassword.html" commandName="changePasswordParameters" id="changepassword">
	<div><label for="changepassword"><spring:message code="changepassword.password1" /></label>
      <form:password path="passwd1" id="changepassword"/>
	</div>
	
	<div><label for="changepassword"><spring:message code="changepassword.password2" /></label>
		<form:password path="passwd2" id="changepassword"/>
	</div>

    <div><input type="submit" value="<spring:message code="changepassword.submit" />" /></div>

</form:form>

</body>
</html>