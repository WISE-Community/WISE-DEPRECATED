<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="student.viewannouncements.viewAnnouncements" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="studenthomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="${contextPath}/<spring:theme code="generalsource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>

</head>
<body style="background:#FFFFFF;">
	<% pageContext.setAttribute("newLineChar", "\n"); %>
	<div class="dialogContent">

		<c:forEach var="run" items="${runs}">
		<div class="sectionHead"><spring:message code="student.viewannouncements.announcementsFor" /> ${run.name}</div>
		
		<div class="dialogSection">
			<c:choose>
				<c:when test="${fn:length(run.announcements) > 0}">
					<ul class="announcements">
						<c:forEach var="announcement" items="${run.announcements}">
							<c:choose>
							    <c:when test="${user.userDetails.lastLoginTime < announcement.timestamp || user.userDetails.lastLoginTime == null || previousLoginTime < announcement.timestamp}">
									<li class="new">
										<div><span class="aTitle">${announcement.title}</span> <span class="aDate">(<fmt:formatDate value="${announcement.timestamp}" type="both" dateStyle="medium" timeStyle="short" />)</span> 
										<span class="newTag"><spring:message code="student.viewannouncements.newAnnouncement" /></span></div>
										<div class="aMessage">${fn:replace(announcement.announcement, newLineChar, "<br />")}</div>
									</li>
								</c:when>
								<c:otherwise>
									<c:if test="${param.newOnly == 'false'}">
										<li>
											<div><span class="aTitle">${announcement.title}</span> <span class="aDate">(<fmt:formatDate value="${announcement.timestamp}" type="both" dateStyle="medium" timeStyle="short" />)</span></div>
											<div class="aMessage">${fn:replace(announcement.announcement, newLineChar, "<br />")}</div>
										</li>
									</c:if>
								</c:otherwise>
							</c:choose>
						</c:forEach>
					</ul>
				</c:when>
				<c:otherwise>
					<div class="noMessages"><spring:message code="student.viewannouncements.noAnnouncements" /></div>
				</c:otherwise>
			</c:choose>
		</div>
		</c:forEach>
	</div>
</body>
</html>