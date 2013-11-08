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
<title>Create Announcement</title>

<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
</head>

<body style="background:#FFFFFF;">
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	<div class="dialogContent">
		<div class="sectionHead"><spring:message code="teacher.run.announcement.createannouncement.sendNewAnnouncement"/></div>
		<div class="dialogSection">
			<div class="errorMsgNoBg">
				<!-- Support for Spring errors object -->
				<spring:bind path="announcementParameters.*">
			  		<c:forEach var="error" items="${status.errorMessages}">
			   			 <p><c:out value="${error}"/></p>
			   		</c:forEach>
				</spring:bind>
			</div>
			<form:form method="post" action="createannouncement.html" commandName="announcementParameters" id="createannouncement" autocomplete='off'>
				<div><label for="titleField"><spring:message code="teacher.run.announcement.createannouncement.title"/> </label> <form:input path="title" id="titleField" size="50"/></div><br />
				<div>
					<label for="announcementField"><spring:message code="teacher.run.announcement.createannouncement.content"/></label>
					<form:textarea path="announcement" rows="8" cols="84" id="announcementField"/>
				</div>
				<div><input type="submit" id="save" value="Save" />   <a href="manageannouncement.html?runId=<c:out value='${param.runId}' />"><spring:message code="teacher.run.announcement.createannouncement.cancel"/></a></div>
			</form:form>
		</div>
	</div>
</body>