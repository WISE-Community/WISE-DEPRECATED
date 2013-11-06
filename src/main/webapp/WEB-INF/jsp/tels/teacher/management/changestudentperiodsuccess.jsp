<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"
    type="text/css" />
    
<title><spring:message code="teacher.management.changestudentperiod.header" /></title>
<script type='text/javascript'>
function refreshParent(){
	if(window.opener){
		window.opener.location.reload();
		self.close();
	};
};

var refreshRequired = true;
</script>

</head>

<!-- <body onload='refreshParent()'>  -->
<body style="background:#FFF;">

	<div class="dialogContent">
		<div class="dialogSection">
			<div class="errorMsgNoBg"><p><spring:message code="teacher.management.changestudentperiodsuccess.success"/></p></div>
		</div>
	</div>

</body>
</html>