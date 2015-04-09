<%@ include file="include.jsp"%>
<html dir="${textDirection}">
<head>
</head>
<body>
	<div ng-view>
	    <div ui-view></div>
	</div>
	<script>
	//var configUrl = 'http://localhost:8080/wise/request/info.html?action=getVLEConfig&runId=' + 2;
    var configUrl = '${vleConfigUrl}';
	</script>
	<script data-main='${contextPath}/wise5/vle/main' src='${contextPath}/wise5/lib/require/require.js'></script>
</body>
</html>