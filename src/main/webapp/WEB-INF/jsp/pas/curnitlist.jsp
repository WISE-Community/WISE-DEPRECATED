<%@ include file="includes/include.jsp"%>
<!--
  * Copyright (c) 2006 Encore Research Group, University of Toronto
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

<!-- $Id$ -->

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"
  type="text/css" />
<title><spring:message code="application.title" /> <spring:message code="title.separator" /> <spring:message code="curnit.list" /></title>
</head>

<body>

<%@ include file="includes/header.jsp"%>

<div id="columns">
<div id="left">
<%@ include file="includes/menu.jsp" %>
</div>

<table align="center" bgcolor="#008800" border="0" cellspacing="2" cellpadding="3">
  <tr bgcolor="#CCCCCC"><td><b><spring:message code="curnit.name.heading" /></b></td></tr>
<c:forEach var="curnit" items="${curnitlist}">
  <tr bgcolor="#FFFF88">
  <td><b><a href="<c:url value="createoffering.html"><c:param name="curnitId" value="${curnit.id}"/></c:url>">
	  <font color="BLACK"><c:out value="${curnit.sdsCurnit.name}"/></font>
  </a></b></td>
  </tr>
</c:forEach>
</table>
<div><a href="<c:url value="registercurnit.html" />"><spring:message code="register.curnit" /></a></div>
</div>

<%@ include file="includes/footer.jsp"%>

</body>
</html>
