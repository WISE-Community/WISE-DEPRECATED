<!--[if lt IE 7]>      <html lang="en" dir="${textDirection}" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html lang="en" dir="${textDirection}" class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html lang="en" dir="${textDirection}" class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html dir="${textDirection}" class="no-js" lang="en"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>WISE Classroom Monitor</title>
        <base href="${contextPath}/" target="_blank">
        <meta name="description" content="WISE Classroom Monitor">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <script>
            if (global === undefined) {
              var global = window;
            }
        </script>
        <app-root></app-root>
        <div ng-view>
            <div ui-view></div>
        </div>
        <script>
            var configURL = '${configURL}';
        </script>
        <script src="${contextPath}/wise5/classroomMonitor/dist/runtime.js"></script>
        <script src="${contextPath}/wise5/classroomMonitor/dist/polyfills-es5.js" nomodule></script>
        <script src="${contextPath}/wise5/classroomMonitor/dist/polyfills.js"></script>
        <script src="${contextPath}/wise5/classroomMonitor/dist/vendor.js"></script>
        <script src="${contextPath}/wise5/classroomMonitor/dist/main.js"></script>
    </body>
</html>
