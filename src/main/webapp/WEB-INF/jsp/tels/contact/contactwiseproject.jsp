<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="homepagestylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>

<title><spring:message code="contact.contactwiseproject.contactWISEProjectIssues"/></title>
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
</head>
<body>

<script type="text/javascript">
	function detectUserSystem() {
		document.getElementById("usersystem").setAttribute("value", navigator.userAgent);
	}
</script>

<div id="pageWrapper">

	<%@ include file="../headermain.jsp"%>
	
	<div id="page">
		
		<div id="pageContent">
		
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="contact.contactwiseproject.contactWISEProjectIssues"/></div>
				<div class="infoContentBox">
					<h4><spring:message code="contact.contactwiseproject.describeTheProblem"/></h4>
					<div class="instructions"><spring:message code="contact.contactwiseproject.reportActivityAndStepWhereProblemOccurs"/></div>
					<div class="instructions"><spring:message code="contact.contactwiseproject.ifEncounteringErrorPleaseIncludeText"/><em><spring:message code="contact.contactwiseproject.detailedDescription"/></em>&nbsp;<spring:message code="contact.contactwiseproject.boxBelow"/></div>
					<div class="instructions"><spring:message code="contact.contactwiseproject.pleaseIndicateURLAddressForProblem"/></div>
					<div class="instructions"><spring:message code="contact.contactwiseproject.toReportAMoreGeneralProblem"/>&nbsp;<a href="/webapp/contact/contactwisegeneral.html"><spring:message code="contact.contactwiseproject.contactWISEGeneralIssues"/></a>.</div>

					<!-- Support for Spring errors object -->
					<div id="errorMsgNoBg">
					<spring:bind path="contactWISEProject.*">
					  <c:forEach var="error" items="${status.errorMessages}">
					        <p><c:out value="${error}"/></p>
					    </c:forEach>
					</spring:bind>
					</div>

					<form:form commandName="contactWISEProject" method="post" action="contactwiseproject.html" id="contactWiseForm" autocomplete='off'>  
					  <dl>
					
					  	<sec:authorize ifAllGranted="ROLE_ANONYMOUS">
					  		<dt><label for="NameContact" id="NameContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.name"/>:</label></dt>
					   		<dd><form:input path="name" id="name" size="50" tabindex="1" /></dd>
					    </sec:authorize>
					    
					   <sec:authorize ifAllGranted="ROLE_TEACHER">
					  		<dt><label for="NameContact" id="NameContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.name"/>:</label></dt>
					   		<dd><form:input path="name" id="name" size="50" tabindex="1" /></dd>
					    </sec:authorize>
					    
					  	<sec:authorize ifAllGranted="ROLE_STUDENT">
					  		<dt><label for="NameContact" id="NameContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.name"/>:</label></dt>
					   		<dd><form:input path="name" id="name" size="50" tabindex="1" disabled="true" /></dd>
					    </sec:authorize>
					            
						<sec:authorize ifAllGranted="ROLE_ANONYMOUS">
							<dt><label for="emailContact" id="emailContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.email"/>:</label></dt>
							<dd><form:input path="email" id="email" size="50" tabindex="2"/> </dd>
						</sec:authorize>
					
						<sec:authorize ifAllGranted="ROLE_TEACHER">
							<dt><label for="emailContact" id="emailContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.email"/>:</label></dt>
							<dd><form:input path="email" id="email" size="50" tabindex="2"/> </dd>
						</sec:authorize>
						   
						
					    <dt><label for="projectName" id="projectName"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.projectName"/>:</label></dt>
						<dd><form:input path="projectName" id="projectName" size="50"  tabindex="3" disabled="true" /> </dd>
					            
					    <dt><label for="issueTypeContact" id="issueTypeContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.issueType"/>:</label> </dt>
						<dd><form:select path="issuetype" id="issuetype"  tabindex="4">
						      <c:forEach items="${issuetypes}" var="issuetype">
					            <form:option value="${issuetype.name}">
					            	<spring:message code="contact.contactwiseproject.${issuetype.name}" />
					            </form:option>
					          </c:forEach>
							</form:select>
					
								</dd>
					
						<dt><label for="summaryContact" id="summaryContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.issueSummary"/></label></dt>
						<dd style="color:#3333CC;"><form:input path="summary" id="summary" size="50" tabindex="7"/></dd>
						
						<dt><label for="descriptionContact" id="descriptionContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.detailedDescription"/></label></dt>
						<dd><form:textarea path="description" id="description" tabindex="8" rows="6" cols="72"></form:textarea></dd>
					    
					    <form:hidden path="usersystem" id="usersystem" /> 
					  </dl>    
					     <div id="asterixWarning"><spring:message code="contact.contactwiseproject.itemsWithStarAreRequired"/></div>  
					        
					    <div>
					    	<input type="submit" onclick="detectUserSystem();" id="sendMessageButton" value="<spring:message code="contact.contactwiseproject.sendMessage"/>"></input>
					  	</div>
					
					</form:form>
				</div>
				<a href="/webapp/index.html" title="<spring:message code="wiseHome"/>"><spring:message code="returnHome"/></a>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page -->
	
	<%@ include file="../footer.jsp"%>
</div>


</body>
</html>