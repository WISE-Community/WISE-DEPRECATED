<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" /> 
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />	

<title><spring:message code="forgotaccount.student.searchforstudentusername.searchForUsernameViaProjectCode"/></title>

</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage" />"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="forgotaccount.student.searchforstudentusername.studentLostUsernamePassword"/></div>
				<div class="infoContentBox">
					<div><spring:message code="forgotaccount.student.searchforstudentusername.searchForUsername"/></div>
					<div class="instructions"><spring:message code="forgotaccount.student.searchforstudentusername.fillInInformationAndSearch"/></div>
					<div>
						<form:form name="projectCode" method="post" commandName="reminderParameters" autocomplete='off'>
							<table width="100%" style="border-collapse:separate;border-spacing:10px">
								<tr>
									<td align="right"><label id="firstNameLabel" for="firstName"><spring:message code="forgotaccount.student.searchforstudentusername.firstName"/>:</label></td>
									<td align="left"><form:input path="firstName" id="firstName" tabindex="1"/></td>	
								</tr>
								<tr>
									<td align="right"><label id="lastNameLabel" for="lastName"><spring:message code="forgotaccount.student.searchforstudentusername.lastName"/>:</label></td>
									<td align="left"><form:input path="lastName" id="lastName" tabindex="2" /></td>
								</tr>
								<tr>
									<td align="right"><label for="birthMonth"><spring:message code="forgotaccount.student.searchforstudentusername.birthMonth"/>:</label></td>
									<td align="left">
										<form:select path="birthMonth" id="birthMonth" tabindex="3">
										<c:forEach var="month" begin="1" end="12" step="1">
											<option value="${month}">
												<spring:message code="forgotaccount.student.searchforstudentusername.birthmonths.${month}" />
											</option>
										</c:forEach>
									    </form:select>
									</td>
								</tr>
								<tr>
									<td align="right"><label for="birthDay"><spring:message code="forgotaccount.student.searchforstudentusername.birthDay"/>:</label></td>
									<td align="left">
										<form:select path="birthDay" id="birthDay" tabindex="4">
											 <c:forEach var="date" begin="1" end="31" step="1">
												  <option value="${date}">
												  		<spring:message code="forgotaccount.student.searchforstudentusername.birthdates.${date}" />
											  	  </option>
										  </c:forEach>
									    </form:select>
									</td>
								</tr>
								<tr><td colspan=2 align="center"><input type="submit" value="Search" tabindex="5" /></td></tr>
					 		</table>
						</form:form>
					</div>
					<div class="errorMsgNoBg">
						<!-- Support for Spring errors object -->
						<spring:bind path="reminderParameters.*">
						  	<c:forEach var="error" items="${status.errorMessages}">
						    	<p><c:out value="${error}"/></p>
							  </c:forEach>
						</spring:bind>
					</div>
				</div>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome" />"><spring:message code="returnHome"/></a>
			</div>
		</div>
	</div>
</div>

</body>
</html>
