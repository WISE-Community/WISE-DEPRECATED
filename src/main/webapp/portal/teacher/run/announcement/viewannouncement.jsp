<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title><spring:message code="teacher.run.announcement.viewannouncement.viewAnnouncement"/></title>

<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
</head>

<body style="background:#FFFFFF;">
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	<div class="dialogContent">
		<div class="sectionHead"><spring:message code="teacher.run.announcement.viewannouncement.sent"/> <fmt:formatDate value="${announcement.timestamp}" type="both" timeStyle="short" dateStyle="medium" /></div>
		<div class="dialogSection"><spring:message code="teacher.run.announcement.viewannouncement.title"/> ${announcement.title}</div>
		<div class="dialogSection">
			<spring:message code="teacher.run.announcement.viewannouncement.message"/> ${announcement.announcement}
		</div>
		<div class="dialogSection"><a href="manageannouncement.html?runId=<c:out value='${param.runId}' />"><spring:message code="teacher.run.announcement.viewannouncement.goBack"/></a></div>
	</div>
</body>
</html>