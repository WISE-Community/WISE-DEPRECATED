<%@ include file="include.jsp"%>
<html dir="${textDirection}">
<head>
</head>
<body>
	<div ng-view>
	    <div ui-view></div>
	</div>
	<script>
	var configUrl = 'http://localhost:8080/wise/request/info.html?action=getVLEConfig&runId=' + 1;
    //var configUrl = ${configUrl};
	</script>
	<script data-main='${contextPath}/vle5/teacher/main' src='${contextPath}/vle5/lib/require/require.js'></script>
</body>
</html>