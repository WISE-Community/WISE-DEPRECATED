<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html lang="en">

<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />

<script type="text/javascript">
	function topiframeOnLoad() {
		var getClassroomMonitorConfigUrl = "${getClassroomMonitorConfigUrl}";
		window.frames["topifrm"].load(getClassroomMonitorConfigUrl);
	}
</script>

</head>

<body style="margin:0; overflow-y:hidden;">
<div id="wait"></div> 

<!--  BEGIN: for LD-inspired Projects that don't have curnitmap 
TODO: re-enable &minified=${minified}-->
<c:if test="${fn:length(getGradeWorkUrl) > 0}">
		<div>
			<iframe id="topifrm" src="${getClassroomMonitorUrl}?loadScriptsIndividually&permission=${permission}" name="topifrm" scrolling="auto" width="100%"
				height="100%" style="overflow-y:auto;" frameborder="0">Sorry, you cannot view this web page because your browser doesn't support iframes.</iframe>
		</div>
</c:if>

<!--  END: for LD-inspired Projects that don't have curnitmap -->
</body>

</html>
