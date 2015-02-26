<%@ include file="../include.jsp"%>
<%@ page import="net.tanesha.recaptcha.ReCaptcha" %>
<%@ page import="net.tanesha.recaptcha.ReCaptchaFactory" %>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title>Contact WISE</title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="homepagestylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" >
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
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
				<div class="panelHeader"><spring:message code="contact.contactwisegeneral.contactWISEGeneralIssues"/></div>
				<div class="infoContentBox">
					<h4><spring:message code="contact.contactwisegeneral.pleaseDescribeYourIssue"/></h4>
					<div class="instructions"><spring:message code="contact.contactwisegeneral.ifEncounteringErrorPleaseIncludeText"/>&nbsp;<spring:message code="contact.contactwisegeneral.detailedDescription"/>&nbsp;<spring:message code="contact.contactwisegeneral.boxBelow"/></div>
					<div class="instructions"><spring:message code="contact.contactwisegeneral.pleaseIndicateURLAddressForProblem"/></div>
					<c:if test="${discourseSSOLoginURL != null}">
						<div class="instructions"><a target=_blank href="${discourseSSOLoginURL}"><spring:message code="contact.contactwisegeneral.wiseTeacherCommunity"/></a></div>
                 	</c:if>

					<!-- Support for Spring errors object -->
					<div class="errorMsgNoBg">
						<spring:bind path="contactWISEForm.*">
						  <c:forEach var="error" items="${status.errorMessages}">
						        <p><c:out value="${error}"/></p>
						    </c:forEach>
						</spring:bind>
					</div>

					<form:form commandName="contactWISEForm" method="post" action="contactwise.html" id="contactWiseForm" autocomplete='off'>  
					  
					  <dl>
					  
					    <sec:authorize ifAllGranted="ROLE_ANONYMOUS">
					  	<dt><label for="NameContact" id="NameContact"><span class="asterix">* </span><spring:message code="contact.contactwisegeneral.name"/></label></dt>
					    <dd><form:input path="name"  id="name" size="50" tabindex="1"/></dd>
					    </sec:authorize>
					    
					  	<sec:authorize ifAllGranted="ROLE_TEACHER">
					  	<dt><label for="NameContact" id="NameContact"><span class="asterix">* </span><spring:message code="contact.contactwisegeneral.name"/></label></dt>
					    <dd><form:input path="name"  id="name" size="50" tabindex="1"/></dd>
					    </sec:authorize>
					    
					  	<sec:authorize ifAllGranted="ROLE_STUDENT">
					  	<dt><label for="NameContact" id="NameContact"><span class="asterix">* </span><spring:message code="contact.contactwisegeneral.name"/></label></dt>
					    <dd><form:input path="name"  id="name" size="50" tabindex="1" disabled="true"/></dd>
					    </sec:authorize>
					
						<sec:authorize ifAllGranted="ROLE_ANONYMOUS">
							<dt><label for="emailContact" id="emailContact"><span class="asterix">* </span><spring:message code="contact.contactwisegeneral.email"/></label></dt>
							<dd><form:input path="email" id="email" size="50" tabindex="2"/> </dd>
						</sec:authorize>
					
						<sec:authorize ifAllGranted="ROLE_TEACHER">
							<dt><label for="emailContact" id="emailContact"><span class="asterix">* </span><spring:message code="contact.contactwisegeneral.email"/></label></dt>
							<dd><form:input path="email" id="email" size="50" tabindex="2"/> </dd>
						</sec:authorize>
						
						<sec:authorize ifAllGranted="ROLE_STUDENT">
							<dt><label for="teacher" id="teacher"><span class="asterix">* </span><spring:message code="contact.contactwisegeneral.teacher"/></label> </dt>
							<dd>
								<form:select path="teacherId" id="teacherId"  tabindex="3">
							      <c:forEach items="${teachers}" var="teacher">
						            <form:option value="${teacher.id}">
						            	${teacher.userDetails.firstname} ${teacher.userDetails.lastname}
						            </form:option>
						          </c:forEach>
								</form:select>
							</dd>
						</sec:authorize>
						   
						<c:if test="${contactWISEForm.projectName != null}">
					    	<dt><label for="projectName" id="projectName"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.projectName"/>:</label></dt>
							<dd><form:input path="projectName" id="projectName" size="50"  tabindex="3" disabled="true" /> </dd>
						</c:if>
						          
					    <dt><label for="issueTypeContact" id="issueTypeContact"><span class="asterix">* </span><spring:message code="contact.contactwiseproject.issueType"/>:</label> </dt>
						<dd><form:select path="issuetype" id="issuetype"  tabindex="4">
						      <c:forEach items="${issuetypes}" var="issuetype">
					            <form:option value="${issuetype.name}">
					            	<spring:message code="contact.contactwisegeneral.${issuetype.name}" />
					            </form:option>
					          </c:forEach>
							</form:select>
						</dd>
					
						<dt><label for="summaryContact" id="summaryContact"><span class="asterix">* </span><spring:message code="contact.contactwisegeneral.issueSummary"/></label></dt>
						<dd style="color:#3333CC;"><form:input path="summary" id="summary" size="50" tabindex="6"/></dd>
						
						<dt><label for="descriptionContact" id="descriptionContact"><span class="asterix">* </span><spring:message code="contact.contactwisegeneral.detailedDescription"/></label></dt>
						<dd><form:textarea path="description" id="description" tabindex="7" rows="9" cols="65"></form:textarea></dd>
					      
					    <form:hidden path="usersystem" id="usersystem" />
					  </dl>  
					    
					     <div id="asterixWarning" class="instructions"><spring:message code="contact.contactwisegeneral.itemsWithStarAreRequired"/></div>  
					    	<c:if test="${user == null && not empty reCaptchaPublicKey && not empty reCaptchaPrivateKey}">
								<div style="width: 50%; margin:0 auto;">
								<p><spring:message code='login.recaptcha'/></p>
								<%
									//get the captcha public and private key so we can make the captcha
									String reCaptchaPublicKey = (String) request.getAttribute("reCaptchaPublicKey");
									String reCaptchaPrivateKey = (String) request.getAttribute("reCaptchaPrivateKey");
									
									//create the captcha factory
									ReCaptcha c = ReCaptchaFactory.newSecureReCaptcha(reCaptchaPublicKey, reCaptchaPrivateKey, false);
									
									//make the html that will display the captcha
									String reCaptchaHtml = c.createRecaptchaHtml(null, null);
									
									//output the captcha html to the page
									out.print(reCaptchaHtml);
								%>
								</div>
							</c:if>
							
					    <div><input type="submit" onclick="detectUserSystem()" id="sendMessageButton" value="<spring:message code="contact.contactwisegeneral.sendMessage"/>"></input></div>
					                  
					</form:form>
				</div>
				<a href="${contextPath}/index.html" title="<spring:message code="wiseHome"/>"><spring:message code="returnHome"/></a>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page -->
	
	<%@ include file="../footer.jsp"%>
</div>

</body>
</html>