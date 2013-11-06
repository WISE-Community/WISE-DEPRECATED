<%@ include file="../includes/include.jsp"%>
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

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "XHTML1-s.dtd" >
<html xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"
  type="text/css" />
<title><spring:message code="application.title" /> <spring:message code="title.separator" /> <spring:message code="createoffering.title" /></title>
<script type="text/javascript" src="./javascript/pas/utils.js"></script>
<script type="text/javascript">
function onLoadHandler() {
  document.getElementById("name").focus();
}

addEvent(window, 'load', onLoadHandler);
</script>
</head>

<body>

<%@ include file="../includes/header.jsp"%>

<c:forEach var="error" items="${status.errorMessages}">
	<b> <br />
	<c:out value="${error}" /> </b>
</c:forEach>

<div id="columns">
<div id="left">
<h2><spring:message code="createoffering.title" /></h2>
</div>

<div id="right"><form:form method="post" action="createoffering.html"
  commandName="offeringParameters">

  <p><label for="name"><spring:message code="createoffering.name" /></label>
  <form:input path="name" id="name" /> <form:errors path="name" />
  </p>
  <p>
  <label for="curnitId"><spring:message code="createoffering.curnitId" /></label>
  <input name="curnitId" id="curnitId" value=<%= request.getParameter("curnitId") %> /> <form:errors path="curnitId" />
  </p>
  <p><input type="submit" value="<spring:message code="createoffering.submit" />" />
  </p>
</form:form></div>
</div>
<%@ include file="../includes/footer.jsp"%>


</body>
</html>




