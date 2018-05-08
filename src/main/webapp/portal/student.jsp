<%@ include file="include.jsp"%>
<!--[if lt IE 7]>      <html lang="en" dir="${textDirection}" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html lang="en" dir="${textDirection}" class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html lang="en" dir="${textDirection}" class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html dir="${textDirection}" class="no-js" lang="en"> <!--<![endif]-->
	<head>
		<meta charset="utf-8">
		<meta http-equiv="x-ua-compatible" content="ie=edge">
		<title>WISE</title>
		<base href="${contextPath}/" target="_blank">
		<meta name="description" content="WISE Student Virtual Learning Environment (VLE)">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<%@ include file="favicon.jsp"%>
		<link rel="apple-touch-icon" href="apple-touch-icon.png">
	    <script src="${contextPath}/wise5/jspm_packages/system.js"></script>
    	<script src="${contextPath}/wise5/config.js?v=5.7.5"></script>
		<script>
        	System.import('${contextPath}/wise5/vle/bootstrap');
	    </script>
	</head>
	<body class="vle">
		<div ng-view>
				<div ui-view></div>
		</div>
		<script>
			var configURL = '${configURL}';
		</script>
	</body>
</html>
