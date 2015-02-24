<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="student.title" /></title>

<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="${contextPath}/<spring:theme code="registerstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<script type="text/javascript" src="${contextPath}/<spring:theme code="generalsource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jqueryuisource"/>"></script>

</head>
<body style="background: #FFFFFF">
	<div class="dialogContent">
		<div class="dialogSection">

			<div class="dialogSection formSection" id="updateStudentAccountForm">

				<!-- Support for Spring errors object -->
				<div class="errorMsgNoBg">
					<spring:bind path="studentAccountForm.*">
						<c:forEach var="error" items="${status.errorMessages}">
							<p>
								<c:out value="${error}" />
							</p>
						</c:forEach>
					</spring:bind>
				</div>
				<form:form method="post" action="updatestudentaccount.html"
					commandName="studentAccountForm" id="studentRegForm"
					autocomplete='off'>
	<table>
<tr>
						    	<td><label for="language" id="language"><spring:message code="student.index.language" /></label></td>
								<td>
									<form:select path="userDetails.language" id="language">           
							    		<c:forEach items="${languages}" var="languageOption">
							            	<form:option value="${languageOption}"><spring:message code="language.${languageOption}" /></form:option>
							          	</c:forEach>
						        	</form:select>
						    </tr>
						    </table>
					<div>
						<form:input path="newAccount" type="hidden" value="0" />
						<input type="submit" value="<spring:message code='save' />" />
					</div>
				</form:form>
			</div>
		</div>
	</div>
</body>
</html>