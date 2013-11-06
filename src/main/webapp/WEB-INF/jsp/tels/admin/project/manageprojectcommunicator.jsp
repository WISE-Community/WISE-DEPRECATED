<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="../<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="../<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="../<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="../<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
    
<script type="text/javascript" src="../javascript/tels/general.js"></script>
    
<title><spring:message code="wiseAdmin" /></title>

<script type='text/javascript' src='/webapp/dwr/interface/ChangePasswordParametersValidatorJS.js'></script>
<script type='text/javascript' src='/webapp/dwr/engine.js'></script>

<meta http-equiv="content-type" content="text/html; charset=utf-8"/>

</head>
<body>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<div id="centeredDiv">

<%@ include file="../adminheader.jsp"%>

<h5 style="color:#0000CC;"><a href="../index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<c:out value="${message}" />

<h2>External Projects</h2>
<table id="adminManageProjectsTable">
	<tr>
		<th> Project Title </th>
		<th> External Location </th>
		<th> Preview Project </th>
		<th> Import Project to Library </th>		
	</tr>
	<c:forEach var="project" items="${projectList}">
	<tr>
		<td>${project.name}</td>		
		<td>${project.projectCommunicator.address} (${project.projectCommunicator.longitude},${project.projectCommunicator.latitude})</td>
		<td><a href="../../previewproject.html?externalId=${project.externalId}&projectCommunicatorId=${project.projectCommunicator.id}">Preview</a></td>		
		<td><a href="../importexternalproject.html?projectType=diy&externalId=${project.externalId}&projectCommunicatorId=${project.projectCommunicator.id}">Import</a></td>				
	</tr>
	</c:forEach>
</table>

</body>
</html>