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

<script type="text/javascript">
function removeNewsItem(newsItemId, newsItemTitle) {
	var doRemove = confirm("Remove News Item: '"+ newsItemTitle +"'?");
	if (doRemove) {
		$.ajax({
			url:"managenewsitems.html",
			type:"POST",
			data:{"action":"remove","newsItemId":newsItemId},
			success:function(data) {
				if (data == "success") {
					window.location.reload();
				} else {
					alert('failed to remove item');
				}
			},
			failure:function() {
				alert('failed to remove item');
			}
		});
	} 
};

function addNewsItem() {
	var div = $('#addNewsItemDialog').html('<iframe width="100%" height="100%" src="addnewsitem.html?action=add"></iframe>');
	div.dialog({
		modal: true,
		width: '700',
		height: '600',
		title: 'Add News Item',
		close: function(){ $(this).html(''); },
		buttons: {
			Close: function(){
				$(this).dialog('close');
			}
		}
	});	
}

function editNewsItem(newsItemId) {
	var div = $('#editNewsItemDialog').html('<iframe width="100%" height="100%" src="editnewsitem.html?action=edit&newsItemId='+newsItemId+'"></iframe>');
	div.dialog({
		modal: true,
		width: '700',
		height: '600',
		title: 'Edit News Item',
		close: function(){ $(this).html(''); },
		buttons: {
			Close: function(){
				$(this).dialog('close');
			}
		}
	});	
}
</script>
</head>
<body>
<%@ include file="../../headermain.jsp"%>
<div id="page">
<div id="pageContent">
<div class="contentPanel">

<h5 style="color:#0000CC;"><a href="${contextPath}/admin/index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<div class="sectionHead"><spring:message code="admin.news.newsItems" /></div>

<div class="sectionContent">

<a onclick="addNewsItem()"><spring:message code="admin.news.addNewsItem" /></a>
</div>

<div class="sectionContent">

<c:choose>
	<c:when test="${fn:length(all_news) > 0}">
		<table id="newsItems" border="2" cellpadding="2" cellspacing="0" align="center">
		<tr>
			<th><h5><spring:message code="date" /></h5></th>
			<th><h5><spring:message code="type" /></h5></th>
			<th><h5><spring:message code="title" /></h5></th>
			<th><h5><spring:message code="message" /></h5></th>
			<th><h5><spring:message code="available_actions" /></h5></th>
		</tr>
		<c:forEach var="news" items="${all_news}">
			<tr>
				<td><fmt:formatDate value="${news.date}" type="both" dateStyle="short" timeStyle="short" /></td>
				<td>${news.type}</td>
				<td>${news.title}</td>
				<td>${news.news}</td>
				<td>
					<a onclick="editNewsItem('${news.id}');"><spring:message code="edit" /></a>
					<a onclick="removeNewsItem('${news.id}','${news.title}');"><spring:message code="remove" /></a>
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
<div id="editNewsItemDialog" class="dialog"></div>
<div id="addNewsItemDialog" class="dialog"></div>

</body>
</html>