<%@ include file="include.jsp"%>
<html dir="${textDirection}">
<!--[if lt IE 7]>      <html lang="en" dir="${textDirection}" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html lang="en" dir="${textDirection}" class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html lang="en" dir="${textDirection}" class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html dir="${textDirection}" class="no-js" lang="en"> <!--<![endif]-->
	<head>
		<meta charset="utf-8">
		<meta http-equiv="x-ua-compatible" content="ie=edge">
		<title>WISE Project</title>
		<meta name="description" content="WISE Student Virtual Learning Environment (VLE)">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link rel="apple-touch-icon" href="apple-touch-icon.png">
		<!-- Place favicon.ico in the root directory -->

		<script src="${contextPath}/wise5/lib/modernizr/modernizr.custom.js"></script>

	</head>
	<body>
		<div ng-view layout-fill>
			<div ui-view layout-fill></div>
		</div>
		<script>
			var configUrl = '${vleConfigUrl}';
		</script>
		<script data-main='${contextPath}/wise5/vle/main' src='${contextPath}/wise5/lib/require/require.js'></script>
	</body>
</html>