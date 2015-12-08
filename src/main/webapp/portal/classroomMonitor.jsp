<%@ include file="include.jsp"%>
<!--[if lt IE 7]>      <html lang="en" dir="${textDirection}" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html lang="en" dir="${textDirection}" class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html lang="en" dir="${textDirection}" class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html dir="${textDirection}" class="no-js" lang="en"> <!--<![endif]-->
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>WISE Classroom Monitor</title>
    <meta name="description" content="WISE Classroom Monitor">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="${contextPath}/" target="_blank">

    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <!-- Place favicon.ico in the root directory -->

    <script src="${contextPath}/wise5/lib/modernizr/modernizr.custom.js"></script>
</head>
<body>
    <div ng-view>
        <div ui-view></div>
    </div>
    <script>
    var configUrl = '${vleConfigUrl}';
    </script>
    <script data-main='${contextPath}/wise5/classroomMonitor/main' src='${contextPath}/wise5/vendor/requirejs/require.js'></script>
</body>
</html>