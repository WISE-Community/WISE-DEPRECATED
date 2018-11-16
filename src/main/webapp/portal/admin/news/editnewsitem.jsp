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
<h3><spring:message code="admin.news.editNewsItem" /></h3>

	<form:form method="post" id="editnewsitem" autocomplete='off'>
		<dl>
		<dt><label for="titleField"><spring:message code="title" /></label></dt>
		<dd><input size="75" id="title" name="title" value="${newsItem.title}"></input> </dd>
		<dt><label for="typeField"><spring:message code="type" /></label></dt>
		<dd><select name="type">
				<c:choose>
					<c:when test="${newsItem.type=='teacherOnly'}">
						<option value="public"><spring:message code="public" /></option>
						<option value="teacherOnly" selected="true"><spring:message code="teacherOnly" /></option>
						<option value="hidden"><spring:message code="hidden" /></option>
					</c:when>
					<c:when test="${newsItem.type=='hidden'}">
						<option value="public"><spring:message code="public" /></option>
						<option value="teacherOnly"><spring:message code="teacherOnly" /></option>
						<option value="hidden" selected="true"><spring:message code="hidden" /></option>
					</c:when>
					<c:otherwise>
						<option value="public" selected="true"><spring:message code="public" /></option>
						<option value="teacherOnly"><spring:message code="teacherOnly" /></option>
						<option value="hidden"><spring:message code="hidden" /></option>
					</c:otherwise>
				</c:choose>
			</select>
		</dd>
		<dt><label for="newsField"><spring:message code="message" /></label></dt>
		<dd><textarea rows="20" id="news" name="news" style="width:100%;">${newsItem.news}</textarea></dd>
		</dl>
		 <input type="submit" id="save" value="<spring:message code="submit" />" />
	</form:form>
</body>
</html>
