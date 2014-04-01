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
<h3><spring:message code="admin.news.editNewsItem" /></h3>

	<form method="post" action="editnewsitem.html" id="editnewsitem" autocomplete='off'>
		<dl>
		<dt><label for="titleField"><spring:message code="title" /></label></dt>
		<dd><input size="75" id="title" name="title" value="${newsItem.title}"></input> </dd>
		<dt><label for="newsField"><spring:message code="message" /></label></dt>
		<dd><textarea rows="20" cols="100" id="news" name="news">${newsItem.news}</textarea></dd>
		</dl>
	    <input type="hidden" id="newsItemId" name="newsItemId" value="${newsItem.id}"></input>
	    <input type="hidden" id="action" name="action" value="edit"></input>
		 <input type="submit" id="save" value="<spring:message code="submit" />" />
 	
	</form>
</body>
</html>