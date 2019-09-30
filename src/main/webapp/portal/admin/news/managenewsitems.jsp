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
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" rel="stylesheet" type="text/css">
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
		<link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript" ></script>

<script type="text/javascript">
function removeNewsItem(newsItemId, newsItemTitle) {
	var doRemove = confirm("Remove News Item: '"+ newsItemTitle +"'?");
	if (doRemove) {
		$.ajax({
			url:"delete/" + newsItemId,
			type:"POST",
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
	var div = $('#addNewsItemDialog').html('<iframe width="100%" height="100%" src="add"></iframe>');
	div.dialog({
		modal: true,
		width: '700',
		height: '600',
		title: '<spring:message code="admin.news.addNewsItem" />',
		close: function(){ $(this).html(''); },
		buttons: {
			'<spring:message code="close" />': function(){
				$(this).dialog('close');
			}
		}
	});	
}

function editNewsItem(newsItemId) {
	var div = $('#editNewsItemDialog').html('<iframe width="100%" height="100%" src="edit/'+newsItemId+'"></iframe>');
	div.dialog({
		modal: true,
		width: '700',
		height: '600',
		title: '<spring:message code="admin.news.editNewsItem" />',
		close: function(){ $(this).html(''); },
		buttons: {
			'<spring:message code="close" />': function(){
				$(this).dialog('close');
			}
		}
	});	
}
</script>
</head>
<body>
<div id="pageWrapper">
<%@ include file="../../headermain.jsp"%>
<div id="page">
<div id="pageContent">
<div class="contentPanel">

<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>

<div class="sectionHead"><spring:message code="admin.news.newsItems" /></div>

<div class="sectionContent">

<a onclick="addNewsItem()"><spring:message code="admin.news.addNewsItem" /></a>
</div>

<div class="sectionContent">

<c:choose>
	<c:when test="${fn:length(allNews) > 0}">
		<table id="newsItems" border="2" cellpadding="2" cellspacing="0" align="center">
		<tr>
			<th><h5><spring:message code="date" /></h5></th>
			<th><h5><spring:message code="type" /></h5></th>
			<th><h5><spring:message code="title" /></h5></th>
			<th><h5><spring:message code="message" /></h5></th>
			<th><h5><spring:message code="available_actions" /></h5></th>
		</tr>
		<c:forEach var="news" items="${allNews}">
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
</div>
</body>
</html>
