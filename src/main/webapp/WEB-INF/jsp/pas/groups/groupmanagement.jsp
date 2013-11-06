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

<div id="right">

<table border="1">
	<thead>
		<tr>
			<th><spring:message code="group.parent.heading" /></th>
			<th><spring:message code="group.name.heading" /></th>
			<th><spring:message code="group.members.heading" /></th>
			<th>&nbsp;</th>
		</tr>
	</thead>
	<c:forEach var="group" items="${grouplist}">
		<tr>
			<c:choose>
				<c:when test="${group.parent != null}">
					<td>${group.parent.name}</td>
				</c:when>
				<c:otherwise>
					<td>&nbsp;</td>
				</c:otherwise>
			</c:choose>
			<td>${group.name}</td>
			<td><c:forEach var="member" items="${group.members}">
      	${member.userDetails.username}<br />
			</c:forEach></td>
			<td><a href="editgroup.html?groupId=${group.id}"><spring:message
				code="group.edit" /></a></td>
		</tr>
	</c:forEach>
	<tr>
		<td>&nbsp;</td>
		<td><a href="addgroup.html">Add a new group</a></td>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
	</tr>
</table>
</div>

</div>

<%@ include file="../includes/footer.jsp"%>

</body>
</html>