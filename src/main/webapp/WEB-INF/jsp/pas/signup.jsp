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

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "XHTML1-s.dtd" >
<html xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"
  type="text/css" />
<title><spring:message code="application.title" /> <spring:message code="title.separator" /> <spring:message code="signup.title" /></title>
<script type="text/javascript" src="./javascript/pas/utils.js"></script>
<script type="text/javascript">
function onLoadHandler() {
  document.getElementById("username").focus();
}

addEvent(window, 'load', onLoadHandler);
</script>
</head>

<body>

<%@ include file="includes/header.jsp"%>

<div id="columns">
<div id="left">
<h2><spring:message code="signup" /></h2>
</div>

<div id="right"><form:form method="post" action="signup.html"
  commandName="userDetails">

  <p><label for="username"><spring:message code="signup.username" /></label>
  <form:input path="username" id="username" /> <form:errors path="username" />
  </p>

  <p><label for="password"><spring:message code="signup.password" /></label>
  <form:password path="password" id="password" /> <form:errors path="password" />
  </p>
  <p><input type="submit" value="<spring:message code="signup.submit" />" />
  </p>
</form:form></div>
</div>
<%@ include file="includes/footer.jsp"%>


</body>
</html>




