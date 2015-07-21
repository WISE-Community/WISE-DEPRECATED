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

		<link rel="stylesheet" href="${contextPath}/wise5/vendor/angular-material/angular-material.min.css">
		<link rel="stylesheet" href="${contextPath}/wise5/lib/jquery/jquery-ui.min.css"><!-- TODO: remove when jquery-ui dep is removed -->
		<link rel="stylesheet" href="${contextPath}/wise5/style/css/vle.css">

		<script src="${contextPath}/wise5/lib/modernizr/modernizr.custom.js"></script>

	</head>
	<body>
		<div ng-view layout-fill>
		<div ui-view layout-fill></div>
		</div>
		<script>
			var configUrl = '${vleConfigUrl}';
		</script>
		<script data-main='${contextPath}/wise5/vle/main' src='${contextPath}/wise5/vendor/requirejs/require.js'></script>

		<!-- Google Analytics: change UA-XXXXX-X to be your site's ID.
		<script>
			(function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
					function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
				e=o.createElement(i);r=o.getElementsByTagName(i)[0];
				e.src='https://www.google-analytics.com/analytics.js';
				r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
			ga('create','UA-XXXXX-X','auto');ga('send','pageview');
		</script> -->
	</body>
</html>