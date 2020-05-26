<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>
<title><spring:message code="teacher.management.changestudentperiod.header"/></title>
<script>
    $(document).ready(function() {
        $("input[type=submit]").focus();
    });
</script>
</head>
<body style="background:#FFF;">
<div class="dialogContent">
	<form:form method="post" action="changestudentperiod.html" modelAttribute="changePeriodParameters" id="changestudentperiod" autocomplete='off'>
		<div class="sectionContent">
			<table style="margin:0 auto;">
				<tr>
					<th><spring:message code="teacher.management.changestudentperiod.current"/></th>
					<td>${changePeriodParameters.currentPeriod}</td>
				</tr>
				<tr>
					<th><spring:message code="teacher.management.changestudentperiod.new"/></th>
					<td><form:select path="newPeriod" id="newPeriod">
						<c:forEach items="${changePeriodParameters.run.periods}" var="period">
                            <c:if test="${changePeriodParameters.currentPeriod != period.name}">
                                <form:option value="${period.name}">
                                    ${period.name}
                                </form:option>
                            </c:if>
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
