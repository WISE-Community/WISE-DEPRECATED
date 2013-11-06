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
<title>Edit Announcement</title>

<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
</head>

<body style="background:#FFFFFF;">
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	<div class="dialogContent">
		<div class="sectionHead"><spring:message code="teacher.run.announcement.editannouncement.editAnnouncement"/></div>
		<div class="dialogSection">
			<div class="errorMsgNoBg">
				<!-- Support for Spring errors object -->
				<spring:bind path="announcementParameters.*">
			  		<c:forEach var="error" items="${status.errorMessages}">
			   			 <p><c:out value="${error}"/></p>
			   		</c:forEach>
				</spring:bind>
			</div>
			<form:form method="post" action="editannouncement.html" commandName="announcementParameters" id="editannouncement" autocomplete='off'>
				<div>
					<label for="titleField"><spring:message code="teacher.run.announcement.editannouncement.title"/> </label><form:input path="title" id="titleField"/>
				</div><br />
				<div><label for="announcementField"><spring:message code="teacher.run.announcement.editannouncement.message"/> </label></div>
				<div><form:textarea path="announcement" rows="7" cols="90" id="announcementField"/></div>
				<br />
				<% String runId = request.getParameter( "runId" ); %>
				<div><input type="submit" id="save" value="Save" />  <a href="manageannouncement.html?runId=<c:out value='${param.runId}' />"><spring:message code="teacher.run.announcement.editannouncement.cancel"/></a></div>
			</form:form>
		</div>
	</div>
</body>