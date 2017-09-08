<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<%@ include file="../../favicon.jsp"%>
<title><spring:message code="teacher.management.updatemyaccountinfo.title" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="registerstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >

<script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript"></script>

</head>
<body>
<div id="pageWrapper">

	<%@ include file="../../headermain.jsp"%>

	<div id="page">

		<div id="pageContent">

			<div class="infoContent">
				<div class="panelHeader"><spring:message code="teacher.management.updatemyaccountinfo.header"/></div>
				<div class="infoContentBox">
					<div><spring:message code="teacher.management.updatemyaccountinfo.instructions"/></div>

					<!-- Support for Spring errors object -->
					<div id="errorMsgNoBg">
						<spring:bind path="teacherAccountForm.*">
						  <c:forEach var="error" items="${status.errorMessages}">
						    <p><c:out value="${error}"/></p>
						  </c:forEach>
						</spring:bind>
					</div>

					<div>
						<form:form method="post" action="updatemyaccountinfo.html" commandName="teacherAccountForm" id="teacherRegForm" autocomplete='off'>
						  <table class="regTable">
						  	<tr>
						  		<td><label for="firstname" id="firstname1"><spring:message code="teacher.registerteacher.firstName" /></label></td>
						    	<td><form:input disabled="true" path="userDetails.firstname" id="teacherFirstName" size="25" maxlength="25" tabindex="1"/><span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span> </td>
						    </tr>

						  	<tr>
						  		<td><label for="lastname" id="lastname1"><spring:message code="teacher.registerteacher.lastName"/></label></td>
								<td><form:input disabled="true" path="userDetails.lastname" id="teacherLastName" size="25" maxlength="25" tabindex="2"/> <span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span> </td>
							</tr>

						    <tr>
						  		<td><label for="displayname" id="displayname"><spring:message code="teacher.management.updatemyaccountinfo.displayName" /></label></td>
						    	<td><form:input path="userDetails.displayname" id="teacherDisplayName" size="25" maxlength="50" tabindex="2"/><span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span> </td>
						    </tr>

						    <tr>
						    	<td><label for="emailAddress" id="emailAddress1"><spring:message code="teacher.registerteacher.email" /></label></td>
								<td><form:input path="userDetails.emailAddress" id="teacherEmail" size="25" maxlength="40" tabindex="3"/> <span class="hint"><spring:message code="teacher.registerteacher.yourAccountInformationWillBeEmailed"/> <span class="hint-pointer"></span></span></td>
							</tr>

						    <tr>
						    	<td><label for="city" id="city1"><spring:message code="teacher.registerteacher.city" /></label> </td>
								<td><form:input path="userDetails.city" id="teacherCity" size="25" maxlength="50" tabindex="4"/>
						    		<span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span></td>
						    </tr>

						    <tr>
						    	<td><label for="state" id="state1" ><spring:message code="teacher.registerteacher.state" /></label> </td>
								<td><form:input path="userDetails.state" id="teacherState" size="25" maxlength="50" tabindex="5"/>
							    	<span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span>
							</tr>

						    <tr>
						    	<td><label for="country" id="country1"><spring:message code="teacher.registerteacher.country" /></label></td>
								<td><form:input path="userDetails.country" id="teacherCountry" size="25" maxlength="50" tabindex="6"/>
								    <span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span>
							</tr>

						    <tr>
						    	<td><label for="schoolname" id="schoolname1"><spring:message code="teacher.registerteacher.schoolName" /></label></td>
								<td><form:input path="userDetails.schoolname" id="teacherSchool" size="25" maxlength="50" tabindex="7"/><span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span> </td>
							</tr>

						    <tr>
						    	<td><label for="schoollevel" id="schoollevel1"><spring:message code="teacher.registerteacher.schoolLevel" /></label></td>
								<td>
									<form:select path="userDetails.schoollevel" id="schoollevel">
							    		<c:forEach items="${schoollevels}" var="schoollevel">
							            	<form:option value="${schoollevel}"><spring:message code="teacher.registerteacher.${schoollevel}" /></form:option>
							          	</c:forEach>
						        	</form:select>
						        	<span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span></td>
						    </tr>

						    <tr>
						    	<td><label for="curriculumsubjects" id="curriculumsubjects1"><spring:message code="teacher.registerteacher.curriculumSubjects" /></label></td>
								<td>
								    <a id="toggleSubjects"><spring:message code="teacher.registerteacher.showHideSubjects"/></a>

								   	<div id="curriculumSubjectsBox">
								          <div><spring:message code="teacher.registerteacher.describeScienceTopics"/></div>

								          <table id="textCurriculumBox">
								          <tr>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects1" value="Biology"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.biology"/></td>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects2" value="APBiology"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.apBiology"/></td>
								          </tr>
								          <tr>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects3" value="EnvironmentalScience"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.environmentalScience"/></td>
										  <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects4" value="Chemistry"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.chemistry"/></td>
								          </tr>
								          <tr>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects5" value="APChemistry"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.apChemistry"/></td>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects6" value="Astronomy"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.astronomy"/></td>
								          </tr>
								          <tr>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects7" value="Physics"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.physics"/></td>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects8" value="APPhysics"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.apPhysics"/></td>
								          </tr>
								          <tr>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects9" value="Anatomy"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.anatomy"/></td>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects10" value="EarthScience"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.earthScience"/></td>
								          </tr>
								          <tr>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects11" value="Biotechnology"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.biotechnology"/></td>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects12" value="Geology"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.geology"/></td>
										  </tr>
								          <tr>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects14" value="AdvancedIntScience"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.advancedIntegratedScience"/></td>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects13" value="IntegratedScience"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.integratedScience"/></td>

								          </tr>
								          <tr>
								          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects15" value="Other"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.other"/></td>
								          <td></td>
								          </tr>
								          </table>

										 <div><spring:message code="teacher.registerteacher.note"/><a id="closeSubjects"><spring:message code="teacher.registerteacher.close"/></a></div>
								     </div>
							 	</td>
							 </tr>

						    <tr>
						    	<td><label for="language" id="language"><spring:message code="teacher.registerteacher.language" /></label></td>
								<td>
									<form:select path="userDetails.language" id="language">
	    				            	<form:option value="default"><spring:message code="default" /></form:option>
							    		<c:forEach items="${languages}" var="languageOption">
							            	<form:option value="${languageOption}"><spring:message code="language.${languageOption}" /></form:option>
							          	</c:forEach>
						        	</form:select>
						        	<span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span></td>
						    </tr>

						  </table>
	  					  <form:input path="newAccount" type="hidden" value="0" />
					      <div><input type="submit" value="<spring:message code='saveChanges'/>"/></div>
						  <div><a href="updatemyaccount"><spring:message code="teacher.registerteacher.cancel"/></a></div>

						</form:form>
					</div>
					<sec:authorize access="!hasAnyRole('ROLE_TRANSLATOR,ROLE_ADMINISTRATOR')">
						<div id="translateWISEMessage" class="panelFooter" style="text-align:left; padding:10px; color:#745A33">
							<span>Interested in helping us translate WISE in another language? Please <a href="${contextPath}/contact/contactwise.html">contact us</a>.</span>
						</div>
					</sec:authorize>

				</div>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->

	<%@ include file="../../footer.jsp"%>
</div>
</body>
</html>
