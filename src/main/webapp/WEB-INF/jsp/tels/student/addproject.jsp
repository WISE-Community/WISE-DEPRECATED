<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>
<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="<spring:theme code="jqueryuisource"/>"></script>

<title><spring:message code="student.title" /></title>

<script type="text/javascript">
	$(document).ready(function() {

		//focus cursor into the First Name field on page ready 
		if ($('#runCode_part1').length) {
			$('#runCode_part1').focus();
		}
	});
	
	/*
	 * used to remember the run code the student has previously entered
	 * so we don't keep trying to find the period for the same run code
	 */
	previousRunCode = '';

	function findPeriods() {
		var successCallback = function(responseText) {
			var periodSelect = document.getElementById("runCode_part2");
			periodSelect.innerHTML = "";
			// o.responseText can be either "not found" (when runcode doesn't point to an existing run
			// or "1,2,3,4,5,...", a comma-separated values of period names
			if (responseText == "not found" || responseText.length < 2) {
				alert("<spring:message code="student.addproject.invalidAccessCode" />");
			} else {
				var op = document.createElement('option');
				op.appendChild(document.createTextNode("<spring:message code="student.addproject.selectClassPeriod" />"));
				op.value = 'none';
				periodSelect.appendChild(op);

				var periodsArr = responseText.split(",");
				for ( var i = 0; i < periodsArr.length; i++) {
					var periodName = periodsArr[i];
					if (periodName != "") {
						var op = document.createElement('option');
						op.appendChild(document.createTextNode(periodName));
						op.value = periodName;
						periodSelect.appendChild(op);
					}
				}
				periodSelect.disabled = false;
			}
		};

		var failureCallback = function(responseText) {
			alert('<spring:message code="student.addproject.serverError" />');
		};
		var runcode = document.getElementById("runCode_part1").value;
		if (runcode != null && runcode != "") {
			$.ajax({
				url : "/webapp/runinfo.html?runcode=" + runcode,
				dataType : "text",
				success : successCallback,
				error : failureCallback
			});
		}
	}

	function save() {
		var runcode = document.getElementById("runCode_part1").value;
		var period = document.getElementById("runCode_part2").value;

		if (period != null && period == "none") {
			alert('<spring:message code="student.addproject.selectClassPeriod" />');
		} else if (runcode != null && period != null && period != "none") {
			var projectCode = document.getElementById("projectcode");
			projectCode.value = runcode + "-" + period;
			document.getElementById("addproject").submit();
		} else {
			alert('<spring:message code="student.addproject.invalidAccessCode" />');
		}
	}

	function setup() {
		var runcode = document.getElementById('runCode_part1').value;
		if (runcode != null && runcode != "") {
			findPeriods();
		}
	}
	
	/**
	 * Check if the run code the student entered is in the proper format
	 * and if so, try to find the periods for that run code.
	 */
	function checkRunCode() {
		//get the run code the student has entered
		var runCode = $('#runCode_part1').val();
		
		/*
		 * the run code regex to check if the run code the student entered is
		 * in the proper format so we can make the request to get the periods.
		 * the proper format is any number of letters followed by 3 digits.
		 */
		var runCodePattern = /^[A-Za-z]*\d\d\d$/
		
		/*
		 * check if the run code has changed since the last time the student
		 * has entered the run code
		 */
		if(runCode != previousRunCode) {
			//run code has changed
			if(runCode.match(runCodePattern)) {
				/*
				 * run code matches the proper run code format so we will try
				 * to find the periods
				 */
				findPeriods();
			} else {
				/*
				 * the run code the student entered is not in the proper 
				 * format so we will not try to find the periods
				 */
			}		
		}
		
		/*
		 * remember the value the student entered so we can compare it the next 
		 * time this function is called 
		 */
		previousRunCode = runCode;
	}
</script>

</head>

<body style="background: #FFFFFF" onload="setup();">
	<div class="dialogContent">
		<div class="dialogSection">
			<div class="sectionHead"><spring:message code="instructions" /></div>
			<ol id="addProjectInstructions">
				<li><spring:message code="student.addproject.enterAccessCode" /></li>
				<li><spring:message code="student.addproject.showPeriods" /></li>
				<li><spring:message code="student.addproject.selectClassPeriod" /></li>
				<li><spring:message code="student.addproject.clickAddProject" /></li>
			</ol>

			<div class="dialogSection formSection" id="addProjectForm">

				<!-- Support for Spring errors object -->
				<div class="errorMsgNoBg">
					<spring:bind path="addProjectParameters.*">
						<c:forEach var="error" items="${status.errorMessages}">
							<p>
								<c:out value="${error}" />
							</p>
						</c:forEach>
					</spring:bind>
				</div>
				<form:form method="post" commandName="addProjectParameters" id="addproject" autocomplete='off'>
					<div>
						<label for="runCode_part1" id="runCode_part1_label"><spring:message code="student.addproject.accessCode" /></label>
						<form:input path="runCode_part1" id="runCode_part1" size="25" maxlength="25" tabindex="1" onkeyup="checkRunCode()"/>
					</div>
					<div>
						<label for="runCode_part2" id="runCode_part2_label"><spring:message code="student.addproject.choosePeriod" /></label>
						<form:select path="runCode_part2" id="runCode_part2" tabindex="2" disabled="true" />
					</div>

					<form:hidden path="projectcode" id="projectcode" />

					<div>
						<input type="button" onclick="save();" value="<spring:message code='student.addproject.addProject' />" />
					</div>
				</form:form>
			</div>
		</div>
	</div>
</body>
</html>
