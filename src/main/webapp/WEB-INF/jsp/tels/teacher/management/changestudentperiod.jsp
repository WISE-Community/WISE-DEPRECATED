<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<title><spring:message code="teacher.management.changestudentperiod.header"/></title>

</head>
<body style="background:#FFF;">

<div class="dialogContent">		

	<div class="sectionHead"><spring:message code="teacher.management.changestudentperiod.header"/></div>
	
	<form:form method="post" action="changestudentperiod.html" commandName="changePeriodParameters" id="changestudentperiod" autocomplete='off'>
		<div class="sectionContent">
			<span style="color:#ff0000;"><spring:message code="teacher.management.changestudentperiod.warning"/></span>
		</div>
		<div class="sectionContent">
			<table style="margin:0 auto;">
				<tr>
					<th><spring:message code="teacher.management.changestudentperiod.current"/></th>
					<td>${changePeriodParameters.projectcode}</td>
				</tr>
				<tr>
					<th><spring:message code="teacher.management.changestudentperiod.new"/></th>
					<td><form:select path="projectcodeTo" id="projectcodeTo">
						<c:forEach items="${changePeriodParameters.run.periods}" var="period">
							<form:option value="${period.name}">
								${period.name}
							</form:option>
						</c:forEach>
						</form:select>	
						<br/>
					</td> 
				</tr>
			</table>
		</div>
	
	    <div class="sectionContent" style="text-align:center;">
	    	<input type="submit" value="<spring:message code="saveChanges"/>"/>
	    </div>
	</form:form>
</div>

</body>
</html>