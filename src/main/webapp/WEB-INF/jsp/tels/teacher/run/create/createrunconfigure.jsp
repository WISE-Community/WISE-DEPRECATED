<%@ include file="../../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
    
<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="<spring:theme code="jquerycookiesource"/>"></script>
<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>


<title><spring:message code="teacher.run.create.createrunconfigure.settingUpAProjectRunStep4" /></title>

</head>

<!-- Support for Spring errors object -->
<spring:bind path="runParameters.postLevel">
  <c:forEach var="error" items="${status.errorMessages}">
    <c:choose>
      <c:when test="${fn:length(error) > 0}" >
        <script type="text/javascript">
          <!--
            alert("${error}");
          //-->
        </script>
      </c:when>
    </c:choose>
  </c:forEach>
</spring:bind>

<body>

<div id="pageWrapper">

	<%@ include file="../../../headermain.jsp"%>
		
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	
	<div id="page">
			
		<div id="pageContent">
			
			<div class="contentPanel">
				<div class="panelHeader">
					<spring:message code="teacher.run.create.createrunconfigure.setupAClassroomRun" />
					<span class="pageTitle"><spring:message code="teacher.run.create.createrunconfigure.management"/></span>
				</div>
				<form:form method="post" commandName="runParameters" autocomplete='off'>
					<div class="panelContent">
						<div id="setUpRunBox">
							<div id="stepNumber" class="sectionHead"><spring:message code="teacher.run.create.createrunconfigure.step4Of5"/>&nbsp;<spring:message code="teacher.run.create.createrunconfigure.configureTheRun"/></div>
							<div class="sectionContent">

								<h5><spring:message code="teacher.run.create.createrunconfigure.selectNumberStudentsInWorkgroup"/>&nbsp;<spring:message code="teacher.run.create.createrunconfigure.next"/>.</h5>


								<h5 style="margin:.5em;">
									<spring:message code="teacher.run.create.createrunconfigure.howManyStudentsPerComputer"/><br/>
									<form:radiobutton path="maxWorkgroupSize" value='1'/><spring:message code="teacher.run.create.createrunconfigure.always1"/><br/>
									<form:radiobutton path="maxWorkgroupSize" value='${maxWorkgroupSize}'/><spring:message code="teacher.run.create.createrunconfigure.1to"/>${maxWorkgroupSize} <spring:message code="teacher.run.create.createrunconfigure.studentsPerComputer"/>
								</h5>
								<h5 style="margin:.5em;">
									<spring:message code="teacher.run.create.createrunconfigure.selectStorageLevel"/><br/>
									<c:choose>
										<c:when test="${minPostLevel==5}">
											<br/>
											<spring:message code="teacher.run.create.createrunconfigure.requiresLogStudentDataHighestLevel"/><br/>
											<spring:message code="teacher.run.create.createrunconfigure.likeToOverrideThisSetting"/> <a href="webapp/contact/contactwisegeneral.html"><spring:message code="teacher.run.create.createrunconfigure.contactWise"/></a><br/>
										</c:when>
										<c:otherwise>	
											<c:forEach var='postLevel' items='${implementedPostLevels}'>
												<c:if test="${postLevel >= minPostLevel}">
													<form:radiobutton path='postLevel' value='${postLevel}'/>${postLevelTextMap[postLevel]}<br/>
												</c:if>
											</c:forEach>
										</c:otherwise>
									</c:choose>
								</h5>
							</div>
						</div>
						<div class="center">
							<input type="submit" name="_target2" value="<spring:message code="teacher.run.create.createrunconfigure.back"/>" />
							<input type="submit" name="_cancel" value="<spring:message code="teacher.run.create.createrunconfigure.cancel"/>" />
							<input type="submit" name="_target4" value="<spring:message code="teacher.run.create.createrunconfigure.next"/>" />
						</div>
					</div>
				</form:form>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->

	<%@ include file="../../../footer.jsp"%>
</div>
</body>
</html>