<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
    
<script type="text/javascript" src="${contextPath}/portal/javascript/general.js"></script>

    
<title><spring:message code="wiseAdmin" /></title>

</head>
<body>
<%@ include file="../../headermain.jsp"%>
<div id="page">
<div id="pageContent">
<div class="contentPanel">

<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<div class="sectionHead"><spring:message code="admin.news.newsItems" /></div>

<div class="sectionContent">

<a href="#" onclick="javascript:popup640('addnewsitems.html');"><spring:message code="admin.news.addNewsItem" /></a>
</div>

<div class="sectionContent">

<c:choose>
	<c:when test="${fn:length(all_news) > 0}">
		<table id="newsItems" border="2" cellpadding="2" cellspacing="0" align="center">
		<tr>
			<th><h5><spring:message code="date" /></h5></th>
			<th><h5><spring:message code="title" /></h5></th>
			<th><h5><spring:message code="message" /></h5></th>
			<th><h5><spring:message code="available_actions" /></h5></th>
		</tr>
		<c:forEach var="news" items="${all_news}">
			<tr>
				<td><fmt:formatDate value="${news.date}" type="both" dateStyle="short" timeStyle="short" /></td>
				<td>${news.title}</td>
				<td>${news.news}</td>
				<td>
					<a href="#" onclick="javascript:popup640('editnewsitem.html?newsId=${news.id}');"><spring:message code="edit" /></a>
					<a href="#" onclick="javascript:popup640('removenewsconfirm.html?newsId=${news.id}&newsTitle=${news.title}');"><spring:message code="remove" /></a>
				</td>
			</tr>
		</c:forEach>
		</table>
	</c:when>
	<c:otherwise>
		<h5><spring:message code="admin.news.noNewsItemFound" /></h5>
	</c:otherwise>
</c:choose>
</div>
</div>
</div>
</div>

</body>
</html>