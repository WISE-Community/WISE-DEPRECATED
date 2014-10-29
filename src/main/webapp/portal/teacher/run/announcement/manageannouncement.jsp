<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.announcement.manageannouncement.manageAnnouncements"/></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>

<style>
.aTitle {
  font-weight:bold;
}
</style>
<script type="text/javascript">
function removeAnnouncement(runId, announcementId, announcementTitle) {
	var doRemove = confirm("Remove \""+announcementTitle+"\"?");
	if (doRemove) {
		$("#removeAnnouncementForm_"+announcementId).submit();
	}
};
</script>
</head>

<body style="background:#FFFFFF;">

<div class="dialogContent">
	<div class="sectionHead"><spring:message code="teacher.run.announcement.manageannouncement.existingAnnouncements"/></div>
	<div id="existingAnnouncements" class="dialogSection">
		<c:choose>
			<c:when test="${fn:length(run.announcements) > 0}">
				<ul id="announcementList">
					<c:forEach var="announcement" items="${run.announcements}">
						<li id='announcement_'+${announcement.id}>
							<span>
								<c:choose>
									<c:when test="${!empty announcement.title}">
										<span class="aTitle">${announcement.title}</span>
									</c:when>
									<c:otherwise>
										[<spring:message code="teacher.run.announcement.manageannouncement.noTitle"/>]
									</c:otherwise>
								</c:choose>
							</span> 
							<span class="aDate">(<fmt:formatDate value="${announcement.timestamp}" type="both" timeStyle="short" dateStyle="medium" />)</span>
							<div class="aBody">${announcement.announcement}</div>
							<a href="editannouncement.html?runId=${run.id}&announcementId=${announcement.id}"><spring:message code="teacher.run.announcement.manageannouncement.edit"/></a>
							<a onclick="removeAnnouncement('${run.id}','${announcement.id}', '${announcement.title}');"><spring:message code="teacher.run.announcement.manageannouncement.delete"/></a>
							<div style="display:hidden">
								<form id="removeAnnouncementForm_${announcement.id}" method="POST" action="manageannouncement.html">
									<input type="hidden" name="command" value="remove"></input>
									<input type="hidden" name="runId" value="${run.id}"></input>
									<input type="hidden" name="announcementId" value="${announcement.id}"></input>
								</form>
							</div>
						</li>
					</c:forEach>
				</ul>
			</c:when>
			<c:otherwise>
				<spring:message code="teacher.run.announcement.manageannouncement.noAnnouncements"/>
			</c:otherwise>
		</c:choose>
	</div>
	<div class="sectionHead"></div>
	<div class="dialogSection">
		<input type="button" value="<spring:message code="teacher.run.announcement.manageannouncement.newAnnouncement"/>" onClick="window.location='createannouncement.html?runId=${run.id}'"/> 
	</div>
	<div class="dialogSection">
		<p class="info"><spring:message code="teacher.run.announcement.manageannouncement.newAnnouncementsWillBeShown"/></p>
	</div>

</div>
</body>
</html>