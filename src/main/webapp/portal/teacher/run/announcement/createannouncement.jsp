<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.announcement.createannouncement.sendNewAnnouncement"/></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />

</head>
<body style="background:#FFFFFF;">
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
				<div>
					<input type="submit" id="save" value="<spring:message code="save"/>" />
					<input type="button" id="cancel" 
						value="<spring:message code='teacher.run.announcement.createannouncement.cancel'/>" 
						onclick="window.location='manageannouncement.html?runId=${param.runId}';" />
				</div>
			</form>
		</div>
	</div>
</body>
</html>