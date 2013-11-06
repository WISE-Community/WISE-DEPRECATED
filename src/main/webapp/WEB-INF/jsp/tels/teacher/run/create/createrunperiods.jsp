<%@ include file="../../../include.jsp"%>

<!DOCTYPE html >
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

<script type="text/javascript">
function checkIfTextAreaEmpty (form) {
	if(form.manualCheckbox.checked==true){
		form.manualPeriods.disabled=false;
		for(i=0;i<form.options.length;i++){
		   form.options[i].disabled=true;
		   form.options[i].checked=false;
		}
	}else{
		form.manualPeriods.disabled=true;
		for(i=0;i<form.options.length;i++){
		   form.options[i].disabled=false;
		}	
	}
}
</script>

<title><spring:message code="teacher.run.create.createrunperiods.settingUpAProjectRunStep3" /></title>

</head>

<!-- Support for Spring errors object -->
<spring:bind path="runParameters.periodNames">
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
					<spring:message code="teacher.run.create.createrunperiods.setupAClassroomRun" />
					<span class="pageTitle"><spring:message code="teacher.run.create.createrunperiods.management"/></span>
				</div>
				<form:form method="post" commandName="runParameters" autocomplete='off'>
					<div class="panelContent">
						<div id="setUpRunBox">
							<div id="stepNumber" class="sectionHead"><spring:message code="teacher.run.create.createrunperiods.step3Of5"/>&nbsp;<spring:message code="teacher.run.create.createrunperiods.selectPeriods"/></div>
							<div class="sectionContent">
								<h5><spring:message code="teacher.run.create.createrunperiods.selectPeriods"/><spring:message code="teacher.run.create.createrunperiods.next"/>.</h5>
								
							    <div style="margin:1em;">
							          <div id="periodBoxes">
							          	<c:forEach items="${periodNames}" var="periodName">
							            <div>
							            	<form:checkbox path="periodNames" value="${periodName}" id="${periodName}"/>
							            	<label for="${periodName}"><spring:message code="teacher.run.create.createrunperiods.${periodName}" /></label>
							            </div>
							          	</c:forEach>
							          </div>      
							    </div>
								<div>
									<div style="line-height: 1em; margin-bottom: 1em;; font-size: .9em;"><spring:message code="teacher.run.create.createrunperiods.orManuallyEnterPeriods"/>
										<form:textarea path="manuallyEnteredPeriods" id="manualperiodsinput" rows="1" cols="40"/>
									</div>
									<h5>(<spring:message code="teacher.run.create.createrunperiods.separatePeriodsWithCommas"/>.&nbsp;<spring:message code="teacher.run.create.createrunperiods.periodNamesNoMoreThan16Chars"/>)</h5>
								</div>
							</div>
						</div> <!--end of SetUpRunBox -->
						<div class="center">
							<input type="submit" name="_target1" value="<spring:message code="teacher.run.create.createrunperiods.back"/>" />
							<input type="submit" name="_cancel" value="<spring:message code="teacher.run.create.createrunperiods.cancel"/>" />
							<input type="submit" name="_target3" value="<spring:message code="teacher.run.create.createrunperiods.next"/>" />
						</div>
					</div>
				</form:form>
			</div>
		</div>
		<div style="clear: both;"></div>
	</div>   <!-- End of page-->

	<%@ include file="../../../footer.jsp"%>
</div>
			





<!--end of centered div-->
</div>
</body>
</html>