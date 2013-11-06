<%@ include file="../includes/include.jsp"%>
<!--
  * Copyright (c) 2007 Encore Research Group, University of Toronto
  * 
  * This library is free software; you can redistribute it and/or
  * modify it under the terms of the GNU Lesser General Public
  * License as published by the Free Software Foundation; either
  * version 2.1 of the License, or (at your option) any later version.
  *
  * This library is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  * Lesser General Public License for more details.
  *
  * You should have received a copy of the GNU Lesser General Public
  * License along with this library; if not, write to the Free Software
  * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
-->

<!-- $Id: -->

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
<link href="<spring:theme code="stylesheet"/>" media="screen"
	rel="stylesheet" type="text/css" />
<title><spring:message code="application.title" /> <spring:message
	code="title.separator" /> <spring:message code="group.management" /></title>
</head>

<body>

<%@ include file="../includes/header.jsp"%>

<div id="columns">
<div id="left"><%@ include file="../includes/menu.jsp"%>
</div>

<div id="right"><form:form method="post" action="editgroup.html" commandName="groupParameters">
	<label for="group_name"><spring:message code="group.name.label" /></label>
	<form:input path="name" id="group_name" />
	<form:errors path="name" />
	<label for="group_parent"><spring:message
		code="group.parent.label" /></label>
	<form:select path="parentId" id="group_parent">
		<form:option value="0" label="no parent" />
		<form:options items="${grouplist}" itemValue="id" itemLabel="name" />
	</form:select>
	<c:forEach var="user" items="${userlist}">
		<form:checkbox path="memberIds" value="${user.id}"
			id="user_${user.id}" />
		<label for="user_${user.id}">${user.userDetails.username}</label>
	</c:forEach>
	<input type="submit"
		value="<spring:message code="group.add.submit.label" />" />
</form:form></div>

</div>

<%@ include file="../includes/footer.jsp"%>

</body>
</html>