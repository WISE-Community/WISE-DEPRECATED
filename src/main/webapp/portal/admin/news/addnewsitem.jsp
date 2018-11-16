<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="wiseAdmin" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<c:if test="${textDirection == 'rtl' }">
		<link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>
<style media="screen">
	html, body {margin:0;padding:20px;xwidth:90%;height:100;}
</style>

</head>
<body>
<h3><spring:message code="admin.news.addNewsItem" /></h3>

	<form:form method="post" id="addnewsitems" autocomplete='off'>
		<dl>
		<dt><label for="titleField"><spring:message code="title" /></label></dt>
		<dd><input name="title" size="75" id="titleField"></input> </dd>
		<dt><label for="typeField"><spring:message code="type" /></label></dt>
		<dd><select name="type">
				<option value="public"><spring:message code="public" /></option>
				<option value="teacherOnly"><spring:message code="teacherOnly" /></option>
			</select></dd>
		<dt><label for="newsField"><spring:message code="message" /></label></dt>
		<dd><textarea rows="20" name="news" id="newsField" style="width:100%;"></textarea></dd>
		</dl>
   	    <input type="submit" id="save" value="<spring:message code="submit" />" />
	</form:form>
</body>
</html>
