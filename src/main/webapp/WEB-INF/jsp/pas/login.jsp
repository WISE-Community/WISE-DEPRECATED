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
<title><spring:message code="application.title" /> <spring:message code="title.separator" /> <spring:message code="login.title" /></title>
<script type="text/javascript" src="./javascript/pas/utils.js"></script>
<script type="text/javascript">
function onLoadHandler() {
  document.getElementById("j_username").focus();
}

addEvent(window, 'load', onLoadHandler);
</script>
</head>

<body>

<%@ include file="includes/header.jsp"%>

<div id="columns">
<div id="left">
<h2><spring:message code="login" /></h2>
</div>

<div id="right"><a href="signup.html"><spring:message code="sign.up" /></a><br />

<c:if test="${failed}">
  <p><spring:message code="login.failed" /></p>
</c:if>

<form method="post" action="j_acegi_security_check">

<p><label for="j_username"><spring:message code="login.username" /></label>
<input type="text" name="j_username" id="j_username" /></p>

<p><label for="j_password"><spring:message code="login.password" /></label>
<input type="password" name="j_password" id="j_password" /></p>

<p><input type="submit" value="<spring:message code="login.submit" />" /></p>
</form>

</div>
</div>
<%@ include file="includes/footer.jsp"%>

</body>
</html>
