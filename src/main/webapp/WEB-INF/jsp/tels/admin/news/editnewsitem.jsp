<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
    
    
<title><spring:message code="wiseAdmin" /></title>

</head>
<body>
<%@ include file="../adminheader.jsp"%>

<!-- Support for Spring errors object -->
<spring:bind path="newsItemParameters.*">
  <c:forEach var="error" items="${status.errorMessages}">
    <b>
      <br /><c:out value="${error}"/>
    </b>
  </c:forEach>
</spring:bind>

<br>
<h5><spring:message code="admin.news.editNewsItem" /></h5>

	<form:form method="post" action="editnewsitem.html" commandName="newsItemParameters" id="editnewsitem" autocomplete='off'>
		<dl>
		<dt><label for="titleField"><spring:message code="title" /></label></dt>
		<dd><form:input path="title" size="50" id="titleField"/> </dd>
		<dt><label for="newsField"><spring:message code="message" /></label></dt>
		<dd><form:textarea rows="10" cols="50" path="news" id="newsField"/></dd>
		</dl>
 	
 	   <input type="image" id="save" src="<spring:theme code="register_save" />" 
    	onmouseover="swapSaveImage('save',1)" alt="Save" onmouseout="swapSaveImage('save',0)"   />

	</form:form>
</body>
</html>