<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title><spring:message code="teacher.run.announcement.manageannouncement.manageAnnouncements"/></title>

</head>

<body style="background:#FFFFFF;">
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<div class="dialogContent">
	<div class="sectionHead"><spring:message code="teacher.run.announcement.manageannouncement.existingAnnouncements"/></div>
	<div id="existingAnnouncements" class="dialogSection">
		<c:choose>
			<c:when test="${fn:length(run.announcements) > 0}">
				<ul id="announcementList">
					<c:forEach var="announcement" items="${run.announcements}">
						<li>
							<span>
								<c:choose>
									<c:when test="${!empty announcement.title}">
										${announcement.title}
									</c:when>
									<c:otherwise>
										[<spring:message code="teacher.run.announcement.manageannouncement.noTitle"/>]
									</c:otherwise>
								</c:choose>
							</span> <span class="aDate">(<fmt:formatDate value="${announcement.timestamp}" type="both" timeStyle="short" dateStyle="medium" />)</span>
							<a href="viewannouncement.html?runId=${run.id}&announcementId=${announcement.id}"><spring:message code="teacher.run.announcement.manageannouncement.view"/></a>
							<a href="editannouncement.html?runId=${run.id}&announcementId=${announcement.id}"><spring:message code="teacher.run.announcement.manageannouncement.edit"/></a>
							<a href="removeannouncement.html?runId=${run.id}&announcementId=${announcement.id}"><spring:message code="teacher.run.announcement.manageannouncement.delete"/></a>
						</li>
					</c:forEach>
				</ul>
			</c:when>
			<c:otherwise>
				<spring:message code="teacher.run.announcement.manageannouncement.noAnnouncements"/>
			</c:otherwise>
		</c:choose>
	</div>
	
	<div class="dialogSection">
		<input type="button" value="<spring:message code="teacher.run.announcement.manageannouncement.newAnnouncement"/>" onClick="window.location='createannouncement.html?runId=${run.id}'"/> 
	</div>
	<div class="dialogSection">
		<p class="info"><spring:message code="teacher.run.announcement.manageannouncement.newAnnouncementsWillBeShown"/></p>
	</div>

</div>
</body>
</html>