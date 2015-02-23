<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.announcement.editannouncement.editAnnouncement"/></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />

</head>
<body style="background:#FFFFFF;">
	<div class="dialogContent">
		<div class="sectionHead"><spring:message code="teacher.run.announcement.editannouncement.editAnnouncement"/></div>
		<div class="dialogSection">
			<form method="POST" action="manageannouncement.html" id="manageannouncement" autocomplete='off'>
				<div>
					<label for="titleField"><spring:message code="teacher.run.announcement.editannouncement.title"/> </label>
					<input name="title" id="titleField" value="${announcement.title}" size="50"></input>
				</div><br/>
				<div><label for="announcementField"><spring:message code="teacher.run.announcement.editannouncement.message"/> </label></div>
				<div><textarea name="announcement" rows="7" cols="90" id="announcementField">${announcement.announcement}</textarea></div>
				<br />
				<input type="hidden" name="command" value="edit" />
				<input type="hidden" name="runId" value="${run.id}" />
				<input type="hidden" name="announcementId" value="${announcement.id}" />
				
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