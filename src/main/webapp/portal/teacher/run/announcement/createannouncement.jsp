<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title>Create Announcement</title>

<script type="text/javascript" src="${contextPath}/<spring:theme code="generalsource"/>"></script>
</head>

<body style="background:#FFFFFF;">
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	<div class="dialogContent">
		<div class="sectionHead"><spring:message code="teacher.run.announcement.createannouncement.sendNewAnnouncement"/></div>
		<div class="dialogSection">
			<form method="post" action="manageannouncement.html" id="createannouncement" autocomplete='off'>
				<div><label for="titleField"><spring:message code="teacher.run.announcement.createannouncement.title"/> </label> 
				<input name="title" id="titleField" size="50"/></div><br />
				
				<div><label for="announcementField"><spring:message code="teacher.run.announcement.editannouncement.message"/> </label></div>
				<div><textarea name="announcement" rows="8" cols="84" id="announcementField"></textarea></div>
				<input type="hidden" name="command" value="create" />
				<input type="hidden" name="runId" value="${run.id}" />
				<div><input type="submit" id="save" value="Save" />   <a href="manageannouncement.html?runId=<c:out value='${param.runId}' />">
				<spring:message code="teacher.run.announcement.createannouncement.cancel"/></a></div>
			</form>
		</div>
	</div>
</body>