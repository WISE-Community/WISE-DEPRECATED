<%@ include file="include.jsp"%>
<html dir="${textDirection}">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="x-ua-compatible" content="ie=edge">
		<title>WISE Project</title>
		<base href="${contextPath}/" target="_blank">
		<meta name="description" content="WISE Student Virtual Learning Environment (VLE)">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="apple-touch-icon" href="apple-touch-icon.png">
		<!-- Place favicon.ico in the root directory -->

		<script src="${contextPath}/wise5/lib/modernizr/modernizr.custom.js"></script>
        <script src="${contextPath}/wise5/jspm_packages/system.js"></script>
        <script src="${contextPath}/wise5/config.js"></script>
        <script>
            System.import('${contextPath}/wise5/vle/bootstrap');
        </script>
	</head>
	<body layout="row" ui-view>
		<script>
			var configUrl = '${vleConfigUrl}';
		</script>
	</body>
</html>