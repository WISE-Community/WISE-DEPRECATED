<%@ include file="include.jsp"%>
<html dir="${textDirection}">
<head>
</head>
<body>
    <div ng-view>
        <div ui-view></div>
    </div>
    <script>
    var configUrl = ${configUrl};
    </script>
    <script data-main='${contextPath}/vle5/teacher/authoringTool/main' src='${contextPath}/vle5/lib/require/require.js'></script>
</body>
</html>