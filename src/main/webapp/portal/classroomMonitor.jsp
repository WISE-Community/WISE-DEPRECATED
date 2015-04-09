<%@ include file="include.jsp"%>
<html dir="${textDirection}">
<head>
</head>
<body>
    <div ng-view>
        <div ui-view></div>
    </div>
    <script>
    var configUrl = '${vleConfigUrl}';
    </script>
    <script data-main='${contextPath}/wise5/classroomMonitor/main' src='${contextPath}/wise5/lib/require/require.js'></script>
</body>
</html>