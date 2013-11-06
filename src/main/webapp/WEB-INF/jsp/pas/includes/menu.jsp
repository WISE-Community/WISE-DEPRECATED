<%@ include file="include.jsp"%>
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
<spring:message code="hello" /> <sec:authentication property="principal.username" />
<ul>
<li><a href="changepassword.html"><spring:message code="change.password" /></a></li>
<li><a href="offeringlist.html"><spring:message code="offerings.list" /></a></li>
<li><a href="curnitlist.html"><spring:message code="curnit.list" /></a></li>
<li><a href="groupmanagement.html"> <spring:message code="group.management" /></a></li>
</ul>
<form action="<c:url value="/j_spring_security_logout"/>" method="POST">
  <input type="submit" value="<spring:message code="log.out" />"/>
 </form><br />

